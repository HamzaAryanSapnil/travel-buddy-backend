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
exports.TravelPlanService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const promises_1 = __importDefault(require("fs/promises"));
const cloudinary_config_1 = __importDefault(require("../../config/cloudinary.config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const prisma_1 = require("../../shared/prisma");
const pick_1 = __importDefault(require("../../shared/pick"));
const tripMember_service_1 = require("../tripMember/tripMember.service");
const notification_service_1 = require("../notification/notification.service");
const travelPlan_constant_1 = require("./travelPlan.constant");
const getTotalDays = (startDate, endDate) => {
    const diff = endDate.getTime() - startDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};
const assertCanModifyPlan = (authUser, planId) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    yield tripMember_service_1.TripMemberService.assertTripMemberPermission(authUser, planId, "canEditPlan", "You are not allowed to modify this plan.");
    return plan;
});
const assertCanViewPlan = (authUser, planId) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check if plan is PUBLIC - anyone can view (even without auth)
    if (plan.visibility === client_1.PlanVisibility.PUBLIC) {
        return plan;
    }
    // For PRIVATE/UNLISTED plans, require authentication
    if (!authUser) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Authentication required to view this plan.");
    }
    // Check if user is a member
    const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, planId);
    if (!member) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to view this plan.");
    }
    return plan;
});
const createTravelPlan = (authUser, payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);
    const now = new Date();
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid date format.");
    }
    if (startDate <= now) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Start date must be a future date. Past dates are not allowed.");
    }
    if (endDate < startDate) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "endDate must be greater than or equal to startDate.");
    }
    let coverPhotoUrl = payload.coverPhoto;
    const galleryUrls = [];
    // Upload files to Cloudinary
    if (files && files.length > 0) {
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const uploadResult = yield cloudinary_config_1.default.uploader.upload(file.path, {
                    folder: `travel-buddy/plans`,
                    resource_type: "image",
                });
                // First file is coverPhoto
                if (i === 0) {
                    coverPhotoUrl = uploadResult.secure_url;
                }
                else {
                    galleryUrls.push(uploadResult.secure_url);
                }
                // Clean up temp file
                try {
                    yield promises_1.default.unlink(file.path);
                }
                catch (err) {
                    // Ignore cleanup errors
                }
            }
        }
        catch (error) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Image upload failed: ${error.message}`);
        }
    }
    const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const plan = yield tx.travelPlan.create({
            data: {
                ownerId: authUser.userId,
                title: payload.title,
                destination: payload.destination,
                origin: payload.origin,
                startDate,
                endDate,
                budgetMin: Number(payload.budgetMin),
                budgetMax: Number(payload.budgetMax),
                travelType: payload.travelType,
                visibility: (_a = payload.visibility) !== null && _a !== void 0 ? _a : client_1.PlanVisibility.PRIVATE,
                description: payload.description,
                coverPhoto: coverPhotoUrl,
            },
        });
        yield tx.tripMember.create({
            data: {
                planId: plan.id,
                userId: authUser.userId,
                role: client_1.TripRole.OWNER,
                status: client_1.TripStatus.JOINED,
                addedBy: authUser.userId,
            },
        });
        // Auto-create chat thread for the plan
        const chatThread = yield tx.chatThread.create({
            data: {
                type: client_1.ChatThreadType.PLAN,
                refId: plan.id,
                title: `Chat: ${plan.title}`
            }
        });
        // Add plan owner as thread owner
        yield tx.chatThreadMember.create({
            data: {
                threadId: chatThread.id,
                userId: authUser.userId,
                role: "owner"
            }
        });
        // Create media records for gallery images
        if (galleryUrls.length > 0) {
            yield tx.media.createMany({
                data: galleryUrls.map(url => ({
                    ownerId: authUser.userId,
                    planId: plan.id,
                    url,
                    provider: "cloudinary",
                    type: "photo",
                })),
            });
        }
        return plan;
    }));
    return Object.assign(Object.assign({}, result), { totalDays: getTotalDays(result.startDate, result.endDate) });
});
const getMyTravelPlans = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const filters = (0, pick_1.default)(query, travelPlan_constant_1.travelPlanFilterableFields);
    const options = {
        page: (_a = query.page) !== null && _a !== void 0 ? _a : 1,
        limit: (_b = query.limit) !== null && _b !== void 0 ? _b : 10,
        sortBy: (_c = query.sortBy) !== null && _c !== void 0 ? _c : "startDate",
        sortOrder: (_d = query.sortOrder) !== null && _d !== void 0 ? _d : "asc",
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const _e = filters, { searchTerm } = _e, restFilters = __rest(_e, ["searchTerm"]);
    const andConditions = [];
    // Only plans where user is a member (includes owner)
    andConditions.push({
        tripMembers: {
            some: {
                userId: authUser.userId,
                status: client_1.TripStatus.JOINED,
            },
        },
    });
    if (searchTerm) {
        andConditions.push({
            OR: travelPlan_constant_1.travelPlanSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (restFilters.travelType) {
        andConditions.push({
            travelType: restFilters.travelType,
        });
    }
    if (restFilters.visibility) {
        andConditions.push({
            visibility: restFilters.visibility,
        });
    }
    if (restFilters.isFeatured) {
        const isFeatured = restFilters.isFeatured === "true";
        andConditions.push({
            isFeatured,
        });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const plans = yield prisma_1.prisma.travelPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            _count: {
                select: {
                    itineraryItems: true,
                    tripMembers: true,
                },
            },
        },
    });
    const total = yield prisma_1.prisma.travelPlan.count({
        where,
    });
    const dataWithTotalDays = plans.map((plan) => (Object.assign(Object.assign({}, plan), { totalDays: getTotalDays(plan.startDate, plan.endDate) })));
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: dataWithTotalDays,
    };
});
const getPublicTravelPlans = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const filters = (0, pick_1.default)(query, travelPlan_constant_1.travelPlanFilterableFields);
    const options = {
        page: (_a = query.page) !== null && _a !== void 0 ? _a : 1,
        limit: (_b = query.limit) !== null && _b !== void 0 ? _b : 10,
        sortBy: (_c = query.sortBy) !== null && _c !== void 0 ? _c : "startDate",
        sortOrder: (_d = query.sortOrder) !== null && _d !== void 0 ? _d : "asc",
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const _e = filters, { searchTerm } = _e, restFilters = __rest(_e, ["searchTerm"]);
    const andConditions = [];
    // Only PUBLIC plans
    andConditions.push({
        visibility: client_1.PlanVisibility.PUBLIC,
    });
    if (searchTerm) {
        andConditions.push({
            OR: travelPlan_constant_1.travelPlanSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (restFilters.travelType) {
        andConditions.push({
            travelType: restFilters.travelType,
        });
    }
    if (restFilters.isFeatured) {
        const isFeatured = restFilters.isFeatured === "true";
        andConditions.push({
            isFeatured,
        });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const plans = yield prisma_1.prisma.travelPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            owner: {
                select: {
                    id: true,
                    fullName: true,
                    profileImage: true,
                },
            },
            _count: {
                select: {
                    itineraryItems: true,
                    tripMembers: true,
                },
            },
        },
    });
    const total = yield prisma_1.prisma.travelPlan.count({
        where,
    });
    const dataWithTotalDays = plans.map((plan) => (Object.assign(Object.assign({}, plan), { totalDays: getTotalDays(plan.startDate, plan.endDate) })));
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: dataWithTotalDays,
    };
});
const getSingleTravelPlan = (authUser, id) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield assertCanViewPlan(authUser, id);
    const fullPlan = yield prisma_1.prisma.travelPlan.findUniqueOrThrow({
        where: { id: plan.id },
        include: {
            owner: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            tripMembers: {
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            profileImage: true,
                        },
                    },
                },
            },
            itineraryItems: {
                orderBy: [{ dayIndex: "asc" }, { order: "asc" }],
            },
        },
    });
    return Object.assign(Object.assign({}, fullPlan), { totalDays: getTotalDays(fullPlan.startDate, fullPlan.endDate) });
});
const updateTravelPlan = (authUser, id, payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield assertCanModifyPlan(authUser, id);
    // Get user's capabilities to enforce EDITOR restrictions
    const { capabilities } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, id);
    const data = {};
    // EDITOR can only edit description and coverPhoto
    if (!capabilities.canEditPlan) {
        // This should not happen due to assertCanModifyPlan, but double-check
        if (payload.title !== undefined ||
            payload.destination !== undefined ||
            payload.origin !== undefined ||
            payload.budgetMin !== undefined ||
            payload.budgetMax !== undefined ||
            payload.travelType !== undefined ||
            payload.visibility !== undefined ||
            payload.startDate !== undefined ||
            payload.endDate !== undefined) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Editors can only modify description and cover photo.");
        }
    }
    // Upload files to Cloudinary if provided
    if (files && files.length > 0) {
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const uploadResult = yield cloudinary_config_1.default.uploader.upload(file.path, {
                    folder: `travel-buddy/plans`,
                    resource_type: "image",
                });
                // First file is coverPhoto
                if (i === 0) {
                    data.coverPhoto = uploadResult.secure_url;
                }
                else {
                    // Additional images are added to media/gallery
                    yield prisma_1.prisma.media.create({
                        data: {
                            ownerId: authUser.userId,
                            planId: id,
                            url: uploadResult.secure_url,
                            provider: "cloudinary",
                            type: "photo",
                        },
                    });
                }
                // Clean up temp file
                try {
                    yield promises_1.default.unlink(file.path);
                }
                catch (err) {
                    // Ignore cleanup errors
                }
            }
        }
        catch (error) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Image upload failed: ${error.message}`);
        }
    }
    if (payload.title !== undefined)
        data.title = payload.title;
    if (payload.destination !== undefined)
        data.destination = payload.destination;
    if (payload.origin !== undefined)
        data.origin = payload.origin;
    if (payload.description !== undefined)
        data.description = payload.description;
    if (payload.coverPhoto !== undefined && !files)
        data.coverPhoto = payload.coverPhoto;
    if (payload.budgetMin !== undefined)
        data.budgetMin = Number(payload.budgetMin);
    if (payload.budgetMax !== undefined)
        data.budgetMax = Number(payload.budgetMax);
    if (payload.travelType !== undefined) {
        data.travelType = payload.travelType;
    }
    if (payload.visibility !== undefined) {
        data.visibility = payload.visibility;
    }
    if (payload.startDate !== undefined || payload.endDate !== undefined) {
        const start = payload.startDate
            ? new Date(payload.startDate)
            : existing.startDate;
        const end = payload.endDate ? new Date(payload.endDate) : existing.endDate;
        const now = new Date();
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid date format.");
        }
        // If startDate is being updated, it must be a future date
        if (payload.startDate !== undefined && start <= now) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Start date must be a future date. Past dates are not allowed.");
        }
        if (end < start) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid dates. endDate must be greater than or equal to startDate.");
        }
        data.startDate = start;
        data.endDate = end;
    }
    const updated = yield prisma_1.prisma.travelPlan.update({
        where: { id },
        data,
    });
    // Notify all plan members except updater (async, don't wait)
    notification_service_1.NotificationService.notifyPlanMembers(id, authUser.userId, {
        type: client_1.NotificationType.PLAN_UPDATED,
        title: "Travel plan updated",
        message: `"${updated.title}" has been updated`,
        data: {
            planId: id
        }
    }).catch((error) => {
        // Log error but don't fail the update
        console.error("Failed to send notification for plan update:", error);
    });
    return Object.assign(Object.assign({}, updated), { totalDays: getTotalDays(updated.startDate, updated.endDate) });
});
const deleteTravelPlan = (authUser, id) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check permission to delete (requires canDeletePlan capability)
    yield tripMember_service_1.TripMemberService.assertTripMemberPermission(authUser, id, "canDeletePlan", "You are not allowed to delete this plan.");
    const deleted = yield prisma_1.prisma.travelPlan.delete({
        where: { id },
    });
    return deleted;
});
exports.TravelPlanService = {
    createTravelPlan,
    getMyTravelPlans,
    getPublicTravelPlans,
    getSingleTravelPlan,
    updateTravelPlan,
    deleteTravelPlan,
};
