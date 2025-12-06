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
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = require("../../shared/prisma");
const paginationHelper_1 = require("../../helper/paginationHelper");
const notification_constant_1 = require("./notification.constant");
/**
 * Create a notification (internal service function)
 * Used by other modules to create notifications
 */
const createNotification = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate user exists
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    // Create notification
    const notification = yield prisma_1.prisma.notification.create({
        data: {
            userId,
            type: payload.type,
            title: payload.title,
            message: payload.message || null,
            data: payload.data ? payload.data : client_1.Prisma.JsonNull
        }
    });
    return {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        createdAt: notification.createdAt
    };
});
/**
 * Get notifications for a user (with pagination and filters)
 */
const getNotifications = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Calculate pagination
    const paginationOptions = {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    // Build where clause
    const andConditions = [
        {
            userId
        }
    ];
    // Filter by type
    if (query.type) {
        andConditions.push({
            type: query.type
        });
    }
    // Filter by isRead
    if (query.isRead !== undefined) {
        andConditions.push({
            isRead: query.isRead === true || query.isRead === "true"
        });
    }
    // Search in title and message
    if (query.searchTerm) {
        andConditions.push({
            OR: notification_constant_1.notificationSearchableFields.map((field) => ({
                [field]: {
                    contains: query.searchTerm,
                    mode: "insensitive"
                }
            }))
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    // Get notifications and total count
    const [notifications, total] = yield Promise.all([
        prisma_1.prisma.notification.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            }
        }),
        prisma_1.prisma.notification.count({
            where: whereConditions
        })
    ]);
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    return {
        data: notifications.map((notif) => ({
            id: notif.id,
            userId: notif.userId,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            data: notif.data,
            isRead: notif.isRead,
            createdAt: notif.createdAt
        })),
        meta: {
            page,
            limit,
            total,
            totalPages
        }
    };
});
/**
 * Mark a notification as read
 */
const markAsRead = (notificationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load notification
    const notification = yield prisma_1.prisma.notification.findUnique({
        where: { id: notificationId }
    });
    if (!notification) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Notification not found.");
    }
    // Verify notification belongs to user
    if (notification.userId !== userId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You do not have permission to mark this notification as read.");
    }
    // If already read, return as is
    if (notification.isRead) {
        return {
            id: notification.id,
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            isRead: notification.isRead,
            createdAt: notification.createdAt
        };
    }
    // Update to read
    const updated = yield prisma_1.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });
    return {
        id: updated.id,
        userId: updated.userId,
        type: updated.type,
        title: updated.title,
        message: updated.message,
        data: updated.data,
        isRead: updated.isRead,
        createdAt: updated.createdAt
    };
});
/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Update all unread notifications for user
    const result = yield prisma_1.prisma.notification.updateMany({
        where: {
            userId,
            isRead: false
        },
        data: {
            isRead: true
        }
    });
    return {
        count: result.count
    };
});
/**
 * Get unread notification count for a user
 */
const getUnreadCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield prisma_1.prisma.notification.count({
        where: {
            userId,
            isRead: false
        }
    });
    return {
        count
    };
});
/**
 * Helper: Notify all plan members except excludeUserId
 * Used by TravelPlan, Itinerary modules
 */
const notifyPlanMembers = (planId, excludeUserId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all plan members
    const members = yield prisma_1.prisma.tripMember.findMany({
        where: {
            planId,
            status: client_1.TripStatus.JOINED
        },
        select: {
            userId: true
        }
    });
    // Filter out excluded user
    const userIds = members
        .map((m) => m.userId)
        .filter((id) => id !== excludeUserId);
    if (userIds.length === 0) {
        return 0;
    }
    // Create notifications for all members (in parallel)
    const notifications = yield Promise.all(userIds.map((userId) => createNotification(userId, payload)));
    return notifications.length;
});
/**
 * Helper: Notify all thread members except excludeUserId
 * Used by Chat module
 */
const notifyThreadMembers = (threadId, excludeUserId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all thread members
    const members = yield prisma_1.prisma.chatThreadMember.findMany({
        where: {
            threadId
        },
        select: {
            userId: true
        }
    });
    // Filter out excluded user
    const userIds = members
        .map((m) => m.userId)
        .filter((id) => id !== excludeUserId);
    if (userIds.length === 0) {
        return 0;
    }
    // Create notifications for all members (in parallel)
    const notifications = yield Promise.all(userIds.map((userId) => createNotification(userId, payload)));
    return notifications.length;
});
/**
 * Helper: Notify a single user
 * Used for direct notifications (e.g., AI limit reached, invitation received)
 */
const notifyUser = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return createNotification(userId, payload);
});
exports.NotificationService = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    notifyPlanMembers,
    notifyThreadMembers,
    notifyUser
};
