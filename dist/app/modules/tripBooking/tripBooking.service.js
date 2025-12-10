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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripBookingService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = require("../../shared/prisma");
const notification_service_1 = require("../notification/notification.service");
const tripMember_service_1 = require("../tripMember/tripMember.service");
/**
 * User sends a join request to a travel plan
 */
const createBookingRequest = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate plan exists and is PUBLIC or UNLISTED
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: payload.planId },
        select: {
            id: true,
            title: true,
            visibility: true,
            ownerId: true,
            owner: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check plan visibility (must be PUBLIC or UNLISTED)
    if (plan.visibility === client_1.PlanVisibility.PRIVATE) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Cannot request to join a private plan. You must receive an invitation.");
    }
    // Check if user is already a member
    const existingMember = yield prisma_1.prisma.tripMember.findFirst({
        where: {
            planId: payload.planId,
            userId: authUser.userId,
            status: client_1.TripStatus.JOINED,
        },
    });
    if (existingMember) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You are already a member of this plan.");
    }
    // Check if there's already a pending request
    const existingRequest = yield prisma_1.prisma.tripBooking.findFirst({
        where: {
            planId: payload.planId,
            userId: authUser.userId,
            status: client_1.BookingStatus.PENDING,
        },
    });
    if (existingRequest) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You already have a pending request for this plan.");
    }
    // Create the booking request
    const booking = yield prisma_1.prisma.tripBooking.create({
        data: {
            planId: payload.planId,
            userId: authUser.userId,
            message: payload.message,
            status: client_1.BookingStatus.PENDING,
        },
        include: {
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                    startDate: true,
                    coverPhoto: true,
                },
            },
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
        },
    });
    // Notify plan owner
    notification_service_1.NotificationService.notifyUser(plan.ownerId, {
        type: client_1.NotificationType.INVITATION_RECEIVED,
        title: "New join request for your travel plan",
        message: `${booking.user.fullName || booking.user.email} wants to join "${plan.title}"`,
        data: {
            planId: payload.planId,
            bookingId: booking.id,
            userId: authUser.userId,
        },
    }).catch((error) => {
        console.error("Failed to send booking request notification:", error);
    });
    // Also notify plan admins
    const planAdmins = yield prisma_1.prisma.tripMember.findMany({
        where: {
            planId: payload.planId,
            role: client_1.TripRole.ADMIN,
            status: client_1.TripStatus.JOINED,
        },
        select: { userId: true },
    });
    for (const admin of planAdmins) {
        notification_service_1.NotificationService.notifyUser(admin.userId, {
            type: client_1.NotificationType.INVITATION_RECEIVED,
            title: "New join request for your travel plan",
            message: `${booking.user.fullName || booking.user.email} wants to join "${plan.title}"`,
            data: {
                planId: payload.planId,
                bookingId: booking.id,
                userId: authUser.userId,
            },
        }).catch((error) => {
            console.error("Failed to send booking request notification:", error);
        });
    }
    return booking;
});
/**
 * User views their outgoing requests
 */
const getMyRequests = (authUser) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield prisma_1.prisma.tripBooking.findMany({
        where: {
            userId: authUser.userId,
        },
        include: {
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                    startDate: true,
                    endDate: true,
                    coverPhoto: true,
                    visibility: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return bookings;
});
/**
 * Plan owner/admin views incoming requests
 */
const getBookingsByPlan = (authUser, planId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if plan exists
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId },
        select: { id: true, title: true },
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check if user has permission to manage members (owner or admin)
    const { capabilities } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, planId);
    if (!capabilities.canManageMembers) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You do not have permission to view booking requests for this plan.");
    }
    // Get all pending requests for this plan
    const bookings = yield prisma_1.prisma.tripBooking.findMany({
        where: {
            planId,
            status: client_1.BookingStatus.PENDING,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                    bio: true,
                    location: true,
                    interests: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    return bookings;
});
/**
 * Owner/Admin approves or rejects a booking request
 */
const respondToBooking = (authUser, bookingId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Find booking
    const booking = yield prisma_1.prisma.tripBooking.findUnique({
        where: { id: bookingId },
        include: {
            plan: {
                select: {
                    id: true,
                    title: true,
                    ownerId: true,
                },
            },
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    });
    if (!booking) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Booking request not found.");
    }
    // Check if booking is still pending
    if (booking.status !== client_1.BookingStatus.PENDING) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `This booking has already been ${booking.status.toLowerCase()}.`);
    }
    // Check permission
    const { capabilities } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, booking.planId);
    if (!capabilities.canManageMembers) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You do not have permission to respond to booking requests.");
    }
    // Handle approval or rejection
    if (payload.status === "APPROVED") {
        // Use transaction to update booking and create member
        const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update booking status
            const updatedBooking = yield tx.tripBooking.update({
                where: { id: bookingId },
                data: { status: client_1.BookingStatus.APPROVED },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                    plan: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            });
            // Add user as trip member with VIEWER role
            const newMember = yield tx.tripMember.create({
                data: {
                    planId: booking.planId,
                    userId: booking.userId,
                    role: client_1.TripRole.VIEWER,
                    status: client_1.TripStatus.JOINED,
                    addedBy: authUser.userId,
                },
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
            });
            return { booking: updatedBooking, member: newMember };
        }));
        // Notify user about approval
        notification_service_1.NotificationService.notifyUser(booking.userId, {
            type: client_1.NotificationType.INVITATION_ACCEPTED,
            title: "Your join request was approved!",
            message: `You are now a member of "${booking.plan.title}"`,
            data: {
                planId: booking.planId,
                bookingId: booking.id,
            },
        }).catch((error) => {
            console.error("Failed to send approval notification:", error);
        });
        return result;
    }
    else {
        // REJECTED
        const updatedBooking = yield prisma_1.prisma.tripBooking.update({
            where: { id: bookingId },
            data: { status: client_1.BookingStatus.REJECTED },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                plan: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        // Notify user about rejection
        notification_service_1.NotificationService.notifyUser(booking.userId, {
            type: client_1.NotificationType.INVITATION_RECEIVED,
            title: "Join request declined",
            message: `Your request to join "${booking.plan.title}" was declined`,
            data: {
                planId: booking.planId,
                bookingId: booking.id,
            },
        }).catch((error) => {
            console.error("Failed to send rejection notification:", error);
        });
        return { booking: updatedBooking };
    }
});
/**
 * User cancels their own pending request
 */
const cancelBookingRequest = (authUser, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find booking
    const booking = yield prisma_1.prisma.tripBooking.findUnique({
        where: { id: bookingId },
        select: {
            id: true,
            userId: true,
            status: true,
            planId: true,
        },
    });
    if (!booking) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Booking request not found.");
    }
    // Check ownership
    if (booking.userId !== authUser.userId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only cancel your own booking requests.");
    }
    // Check if still pending
    if (booking.status !== client_1.BookingStatus.PENDING) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Only pending requests can be cancelled.");
    }
    // Delete the booking request
    yield prisma_1.prisma.tripBooking.delete({
        where: { id: bookingId },
    });
    return { message: "Booking request cancelled successfully." };
});
exports.TripBookingService = {
    createBookingRequest,
    getMyRequests,
    getBookingsByPlan,
    respondToBooking,
    cancelBookingRequest,
};
