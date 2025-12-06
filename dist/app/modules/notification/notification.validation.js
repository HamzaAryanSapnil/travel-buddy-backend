"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
/**
 * Get notifications validation (with pagination and filters)
 */
const getNotificationsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: stringRequired("Page must be a string.").optional(),
        limit: stringRequired("Limit must be a string.").optional(),
        sortBy: stringRequired("Sort by must be a string.").optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"], {
            error: () => "Sort order must be 'asc' or 'desc'."
        }).optional(),
        type: zod_1.z.nativeEnum(client_1.NotificationType, {
            error: () => "Invalid notification type."
        }).optional(),
        isRead: zod_1.z.string().transform((val) => {
            if (val === "true")
                return true;
            if (val === "false")
                return false;
            return undefined;
        }).pipe(zod_1.z.boolean().optional()).optional(),
        searchTerm: stringRequired("Search term must be a string.").optional()
    })
});
/**
 * Mark notification as read validation
 */
const markReadSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Notification ID is required.")
    })
});
/**
 * Mark all notifications as read validation
 * No params needed - user from auth
 */
const markAllReadSchema = zod_1.z.object({
// No params or body needed
});
/**
 * Get unread count validation
 * No params needed - user from auth
 */
const getUnreadCountSchema = zod_1.z.object({
// No params or body needed
});
exports.NotificationValidation = {
    getNotifications: getNotificationsSchema,
    markRead: markReadSchema,
    markAllRead: markAllReadSchema,
    getUnreadCount: getUnreadCountSchema
};
