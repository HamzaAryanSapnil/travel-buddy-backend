"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetupService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const prisma_1 = require("../../shared/prisma");
const pick_1 = __importDefault(require("../../shared/pick"));
const tripMember_service_1 = require("../tripMember/tripMember.service");
const notification_service_1 = require("../notification/notification.service");
const meetup_constant_1 = require("./meetup.constant");
const assertCanViewPlan = (authUser, planId) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId },
        select: {
            id: true,
            visibility: true,
            startDate: true,
            endDate: true,
        },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check if plan is PUBLIC - anyone can view
    if (plan.visibility === client_1.PlanVisibility.PUBLIC) {
        return plan;
    }
    // For PRIVATE/UNLISTED plans, check if user is a member
    const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, planId);
    if (!member) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to view this plan.");
    }
    return plan;
});
const assertMeetupPermission = (authUser, meetupId, action) => __awaiter(void 0, void 0, void 0, function* () {
    const meetup = yield prisma_1.prisma.meetup.findUnique({
        where: { id: meetupId },
        include: {
            plan: {
                select: {
                    id: true,
                    ownerId: true,
                },
            },
        },
    });
    if (!meetup) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Meetup not found.");
    }
    // Prevent update/delete if status is COMPLETED or CANCELLED
    if ((action === "update" || action === "delete" || action === "status") &&
        (meetup.status === client_1.MeetupStatus.COMPLETED ||
            meetup.status === client_1.MeetupStatus.CANCELLED)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Cannot ${action} a meetup that is ${meetup.status.toLowerCase()}.`);
    }
    // Check if user is organizer
    if (meetup.organizerId === authUser.userId) {
        return meetup;
    }
    // Check if user is plan owner/admin
    if (meetup.plan.ownerId === authUser.userId || authUser.role === "ADMIN") {
        return meetup;
    }
    // Check if user is plan admin via TripMember
    const { member, capabilities } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, meetup.plan.id);
    if (member && (member.role === "OWNER" || member.role === "ADMIN")) {
        return meetup;
    }
    throw new ApiError_1.default(http_status_1.default.FORBIDDEN, `You are not allowed to ${action} this meetup. Only the organizer or plan owner/admin can ${action} it.`);
});
const validateStatusTransition = (currentStatus, newStatus) => {
    // Allowed transitions
    const allowedTransitions = {
        [client_1.MeetupStatus.PENDING]: [client_1.MeetupStatus.CONFIRMED, client_1.MeetupStatus.CANCELLED],
        [client_1.MeetupStatus.CONFIRMED]: [client_1.MeetupStatus.COMPLETED, client_1.MeetupStatus.CANCELLED],
        [client_1.MeetupStatus.COMPLETED]: [], // Cannot transition from COMPLETED
        [client_1.MeetupStatus.CANCELLED]: [], // Cannot transition from CANCELLED
    };
    if (!allowedTransitions[currentStatus].includes(newStatus)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions[currentStatus].join(", ") || "none"}.`);
    }
};
const createMeetup = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify plan exists and user is a member
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: payload.planId },
        select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            visibility: true,
        },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check if user is a plan member (via TripMember)
    const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, payload.planId);
    if (!member && plan.visibility !== client_1.PlanVisibility.PUBLIC) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You must be a member of this plan to create a meetup.");
    }
    // Validate scheduledAt is in the future
    const scheduledAt = new Date(payload.scheduledAt);
    const now = new Date();
    if (isNaN(scheduledAt.getTime()) || scheduledAt <= now) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Scheduled date must be a valid future date.");
    }
    // Validate scheduledAt is within plan date range (optional but recommended)
    if (scheduledAt < plan.startDate || scheduledAt > plan.endDate) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Scheduled date must be within the plan's date range.");
    }
    // Validate location and locationId are not both provided
    if (payload.location && payload.locationId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot provide both location and locationId. Provide only one.");
    }
    const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Create meetup
        const meetup = yield tx.meetup.create({
            data: {
                planId: payload.planId,
                organizerId: authUser.userId,
                scheduledAt,
                location: payload.location || null,
                locationId: payload.locationId || null,
                maxParticipants: payload.maxParticipants || null,
                videoRoomLink: payload.videoRoomLink || null,
                status: client_1.MeetupStatus.PENDING,
            },
        });
        // Auto-create ChatThread for meetup
        const chatThread = yield tx.chatThread.create({
            data: {
                type: client_1.ChatThreadType.MEETUP,
                refId: meetup.id,
                title: `Chat: ${payload.location || "Meetup"}`,
            },
        });
        // Add organizer as thread owner
        yield tx.chatThreadMember.create({
            data: {
                threadId: chatThread.id,
                userId: authUser.userId,
                role: "owner",
            },
        });
        return meetup;
    }));
    // Notify plan members (MEETUP_CREATED)
    notification_service_1.NotificationService.notifyPlanMembers(payload.planId, authUser.userId, {
        type: client_1.NotificationType.MEETUP_CREATED,
        title: "New meetup created",
        message: `A new meetup has been scheduled for ${plan.title}`,
        data: {
            planId: payload.planId,
            meetupId: result.id,
        },
    }).catch((error) => {
        console.error("Failed to send notification for meetup creation:", error);
    });
    // Fetch created meetup with relations
    const meetup = yield prisma_1.prisma.meetup.findUniqueOrThrow({
        where: { id: result.id },
        include: {
            organizer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                },
            },
            locationRel: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true,
                    latitude: true,
                    longitude: true,
                },
            },
            _count: {
                select: {
                    invitations: true,
                },
            },
        },
    });
    return {
        id: meetup.id,
        planId: meetup.planId,
        organizerId: meetup.organizerId,
        scheduledAt: meetup.scheduledAt,
        location: meetup.location,
        locationId: meetup.locationId,
        status: meetup.status,
        maxParticipants: meetup.maxParticipants,
        videoRoomLink: meetup.videoRoomLink,
        createdAt: meetup.createdAt,
        updatedAt: meetup.updatedAt,
        organizer: meetup.organizer,
        plan: {
            id: meetup.plan.id,
            title: meetup.plan.title,
            destination: meetup.plan.destination,
        },
        locationRel: meetup.locationRel,
        invitationCount: meetup._count.invitations,
    };
});
const getMeetup = (authUser, meetupId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load meetup with relations
    const meetup = yield prisma_1.prisma.meetup.findUnique({
        where: { id: meetupId },
        include: {
            organizer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                    visibility: true,
                },
            },
            locationRel: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true,
                    latitude: true,
                    longitude: true,
                },
            },
            _count: {
                select: {
                    invitations: true,
                },
            },
        },
    });
    if (!meetup) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Meetup not found.");
    }
    // Check read permission (plan visibility + membership)
    yield assertCanViewPlan(authUser, meetup.planId);
    return {
        id: meetup.id,
        planId: meetup.planId,
        organizerId: meetup.organizerId,
        scheduledAt: meetup.scheduledAt,
        location: meetup.location,
        locationId: meetup.locationId,
        status: meetup.status,
        maxParticipants: meetup.maxParticipants,
        videoRoomLink: meetup.videoRoomLink,
        createdAt: meetup.createdAt,
        updatedAt: meetup.updatedAt,
        organizer: meetup.organizer,
        plan: {
            id: meetup.plan.id,
            title: meetup.plan.title,
            destination: meetup.plan.destination,
        },
        locationRel: meetup.locationRel,
        invitationCount: meetup._count.invitations,
    };
});
const getMeetups = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const filters = (0, pick_1.default)(query, meetup_constant_1.meetupFilterableFields);
    const options = {
        page: (_a = query.page) !== null && _a !== void 0 ? _a : 1,
        limit: (_b = query.limit) !== null && _b !== void 0 ? _b : 10,
        sortBy: (_c = query.sortBy) !== null && _c !== void 0 ? _c : "scheduledAt",
        sortOrder: (_d = query.sortOrder) !== null && _d !== void 0 ? _d : "asc",
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const _e = filters, { searchTerm } = _e, restFilters = __rest(_e, ["searchTerm"]);
    const andConditions = [];
    // Search in location
    if (searchTerm) {
        andConditions.push({
            OR: meetup_constant_1.meetupSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    // Apply filters
    if (Object.keys(restFilters).length > 0) {
        andConditions.push({
            AND: Object.keys(restFilters).map((key) => ({
                [key]: {
                    equals: restFilters[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.prisma.meetup.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            organizer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                },
            },
            locationRel: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true,
                    latitude: true,
                    longitude: true,
                },
            },
            _count: {
                select: {
                    invitations: true,
                },
            },
        },
    });
    const total = yield prisma_1.prisma.meetup.count({
        where: whereConditions,
    });
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result.map((meetup) => ({
            id: meetup.id,
            planId: meetup.planId,
            organizerId: meetup.organizerId,
            scheduledAt: meetup.scheduledAt,
            location: meetup.location,
            locationId: meetup.locationId,
            status: meetup.status,
            maxParticipants: meetup.maxParticipants,
            videoRoomLink: meetup.videoRoomLink,
            createdAt: meetup.createdAt,
            updatedAt: meetup.updatedAt,
            organizer: meetup.organizer,
            plan: {
                id: meetup.plan.id,
                title: meetup.plan.title,
                destination: meetup.plan.destination,
            },
            locationRel: meetup.locationRel,
            invitationCount: meetup._count.invitations,
        })),
    };
});
const updateMeetup = (authUser, meetupId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Load meetup and check permission
    const meetup = yield assertMeetupPermission(authUser, meetupId, "update");
    // Validate location and locationId are not both provided
    if (payload.location && payload.locationId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot provide both location and locationId. Provide only one.");
    }
    const updateData = {};
    if (payload.scheduledAt !== undefined) {
        const scheduledAt = new Date(payload.scheduledAt);
        const now = new Date();
        if (isNaN(scheduledAt.getTime()) || scheduledAt <= now) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Scheduled date must be a valid future date.");
        }
        // Validate within plan date range
        const plan = yield prisma_1.prisma.travelPlan.findUnique({
            where: { id: meetup.planId },
            select: { startDate: true, endDate: true },
        });
        if (plan && (scheduledAt < plan.startDate || scheduledAt > plan.endDate)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Scheduled date must be within the plan's date range.");
        }
        updateData.scheduledAt = scheduledAt;
    }
    if (payload.location !== undefined) {
        updateData.location = payload.location || null;
        // Clear locationId if location is provided
        if (payload.location) {
            updateData.locationRel = { disconnect: true };
        }
    }
    if (payload.locationId !== undefined) {
        if (payload.locationId) {
            updateData.locationRel = { connect: { id: payload.locationId } };
            updateData.location = null;
        }
        else {
            updateData.locationRel = { disconnect: true };
        }
    }
    if (payload.maxParticipants !== undefined) {
        if (payload.maxParticipants !== null && payload.maxParticipants <= 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Max participants must be a positive number.");
        }
        updateData.maxParticipants = payload.maxParticipants || null;
    }
    if (payload.videoRoomLink !== undefined) {
        updateData.videoRoomLink = payload.videoRoomLink || null;
    }
    // Update meetup
    const updated = yield prisma_1.prisma.meetup.update({
        where: { id: meetupId },
        data: updateData,
        include: {
            organizer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                },
            },
            locationRel: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true,
                    latitude: true,
                    longitude: true,
                },
            },
            _count: {
                select: {
                    invitations: true,
                },
            },
        },
    });
    // Notify plan members if significant changes (MEETUP_UPDATED)
    notification_service_1.NotificationService.notifyPlanMembers(meetup.planId, authUser.userId, {
        type: client_1.NotificationType.MEETUP_UPDATED,
        title: "Meetup updated",
        message: `A meetup has been updated in ${updated.plan.title}`,
        data: {
            planId: meetup.planId,
            meetupId: updated.id,
        },
    }).catch((error) => {
        console.error("Failed to send notification for meetup update:", error);
    });
    return {
        id: updated.id,
        planId: updated.planId,
        organizerId: updated.organizerId,
        scheduledAt: updated.scheduledAt,
        location: updated.location,
        locationId: updated.locationId,
        status: updated.status,
        maxParticipants: updated.maxParticipants,
        videoRoomLink: updated.videoRoomLink,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        organizer: updated.organizer,
        plan: {
            id: updated.plan.id,
            title: updated.plan.title,
            destination: updated.plan.destination,
        },
        locationRel: updated.locationRel,
        invitationCount: updated._count.invitations,
    };
});
const updateMeetupStatus = (authUser, meetupId, status) => __awaiter(void 0, void 0, void 0, function* () {
    // Load meetup and check permission
    const meetup = yield assertMeetupPermission(authUser, meetupId, "status");
    // Validate status transition
    validateStatusTransition(meetup.status, status);
    // Update status
    const updated = yield prisma_1.prisma.meetup.update({
        where: { id: meetupId },
        data: { status },
        include: {
            organizer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                },
            },
            locationRel: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true,
                    latitude: true,
                    longitude: true,
                },
            },
            _count: {
                select: {
                    invitations: true,
                },
            },
        },
    });
    // Notify participants if status changes to CONFIRMED
    if (status === client_1.MeetupStatus.CONFIRMED) {
        // Get all accepted invitations
        const acceptedInvitations = yield prisma_1.prisma.invitation.findMany({
            where: {
                meetupId: meetupId,
                status: "ACCEPTED",
            },
            select: {
                toUserId: true,
            },
        });
        // Notify each participant
        yield Promise.all(acceptedInvitations.map((invitation) => notification_service_1.NotificationService.notifyUser(invitation.toUserId, {
            type: client_1.NotificationType.MEETUP_UPDATED,
            title: "Meetup confirmed",
            message: `The meetup "${updated.plan.title}" has been confirmed`,
            data: {
                planId: meetup.planId,
                meetupId: updated.id,
            },
        }))).catch((error) => {
            console.error("Failed to send notification for meetup status change:", error);
        });
    }
    return {
        id: updated.id,
        planId: updated.planId,
        organizerId: updated.organizerId,
        scheduledAt: updated.scheduledAt,
        location: updated.location,
        locationId: updated.locationId,
        status: updated.status,
        maxParticipants: updated.maxParticipants,
        videoRoomLink: updated.videoRoomLink,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        organizer: updated.organizer,
        plan: {
            id: updated.plan.id,
            title: updated.plan.title,
            destination: updated.plan.destination,
        },
        locationRel: updated.locationRel,
        invitationCount: updated._count.invitations,
    };
});
const deleteMeetup = (authUser, meetupId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load meetup and check permission
    yield assertMeetupPermission(authUser, meetupId, "delete");
    // Delete meetup (cascade deletes invitations, chat thread)
    yield prisma_1.prisma.meetup.delete({
        where: { id: meetupId },
    });
});
const enforceMaxParticipants = (meetupId) => __awaiter(void 0, void 0, void 0, function* () {
    const meetup = yield prisma_1.prisma.meetup.findUnique({
        where: { id: meetupId },
        select: {
            id: true,
            maxParticipants: true,
            _count: {
                select: {
                    invitations: {
                        where: {
                            status: client_1.InvitationStatus.ACCEPTED,
                        },
                    },
                },
            },
        },
    });
    if (!meetup) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Meetup not found.");
    }
    if (meetup.maxParticipants !== null) {
        const acceptedCount = meetup._count.invitations;
        if (acceptedCount >= meetup.maxParticipants) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Meetup has reached maximum participants limit (${meetup.maxParticipants}).`);
        }
    }
});
const rsvp = (authUser, meetupId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify user is plan member
    const meetup = yield prisma_1.prisma.meetup.findUnique({
        where: { id: meetupId },
        include: {
            plan: {
                select: {
                    id: true,
                    title: true,
                    visibility: true,
                },
            },
            organizer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    });
    if (!meetup) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Meetup not found.");
    }
    // Check meetup is not CANCELLED/COMPLETED
    if (meetup.status === client_1.MeetupStatus.CANCELLED ||
        meetup.status === client_1.MeetupStatus.COMPLETED) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Cannot RSVP to a meetup that is ${meetup.status.toLowerCase()}.`);
    }
    // Check if user is a plan member
    const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, meetup.planId);
    if (!member && meetup.plan.visibility !== client_1.PlanVisibility.PUBLIC) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You must be a member of this plan to RSVP to meetups.");
    }
    // If accepting: Check maxParticipants limit
    if (payload.status === "ACCEPTED") {
        yield enforceMaxParticipants(meetupId);
    }
    // Find existing invitation
    const existingInvitation = yield prisma_1.prisma.invitation.findFirst({
        where: {
            meetupId: meetupId,
            fromUserId: meetup.organizerId,
            toUserId: authUser.userId,
        },
    });
    let invitation;
    if (existingInvitation) {
        // Update existing invitation
        invitation = yield prisma_1.prisma.invitation.update({
            where: { id: existingInvitation.id },
            data: {
                status: payload.status === "ACCEPTED"
                    ? client_1.InvitationStatus.ACCEPTED
                    : client_1.InvitationStatus.DECLINED,
                respondedAt: new Date(),
            },
        });
    }
    else {
        // Create new invitation
        invitation = yield prisma_1.prisma.invitation.create({
            data: {
                fromUserId: meetup.organizerId,
                toUserId: authUser.userId,
                meetupId: meetupId,
                planId: meetup.planId,
                status: payload.status === "ACCEPTED"
                    ? client_1.InvitationStatus.ACCEPTED
                    : client_1.InvitationStatus.DECLINED,
                respondedAt: new Date(),
            },
        });
    }
    // Notify organizer
    const notificationType = payload.status === "ACCEPTED"
        ? client_1.NotificationType.MEETUP_RSVP_ACCEPTED
        : client_1.NotificationType.MEETUP_UPDATED;
    notification_service_1.NotificationService.notifyUser(meetup.organizerId, {
        type: notificationType,
        title: payload.status === "ACCEPTED"
            ? "Meetup RSVP accepted"
            : "Meetup RSVP declined",
        message: `User has ${payload.status.toLowerCase()} the RSVP for meetup in ${meetup.plan.title}`,
        data: {
            planId: meetup.planId,
            meetupId: meetup.id,
            invitationId: invitation.id,
        },
    }).catch((error) => {
        console.error("Failed to send notification for RSVP:", error);
    });
    return invitation;
});
exports.MeetupService = {
    createMeetup,
    getMeetup,
    getMeetups,
    updateMeetup,
    updateMeetupStatus,
    deleteMeetup,
    rsvp,
};
