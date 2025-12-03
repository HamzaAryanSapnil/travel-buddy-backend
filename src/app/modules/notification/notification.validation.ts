import { z } from "zod";
import { NotificationType } from "@prisma/client";

const stringRequired = (message: string) => z.string({ error: () => message });

/**
 * Get notifications validation (with pagination and filters)
 */
const getNotificationsSchema = z.object({
  query: z.object({
    page: stringRequired("Page must be a string.").optional(),
    limit: stringRequired("Limit must be a string.").optional(),
    sortBy: stringRequired("Sort by must be a string.").optional(),
    sortOrder: z.enum(["asc", "desc"] as const, {
      error: () => "Sort order must be 'asc' or 'desc'."
    }).optional(),
    type: z.nativeEnum(NotificationType, {
      error: () => "Invalid notification type."
    }).optional(),
    isRead: z.string().transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }).pipe(z.boolean().optional()).optional(),
    searchTerm: stringRequired("Search term must be a string.").optional()
  })
});

/**
 * Mark notification as read validation
 */
const markReadSchema = z.object({
  params: z.object({
    id: stringRequired("Notification ID is required.")
  })
});

/**
 * Mark all notifications as read validation
 * No params needed - user from auth
 */
const markAllReadSchema = z.object({
  // No params or body needed
});

/**
 * Get unread count validation
 * No params needed - user from auth
 */
const getUnreadCountSchema = z.object({
  // No params or body needed
});

export const NotificationValidation = {
  getNotifications: getNotificationsSchema,
  markRead: markReadSchema,
  markAllRead: markAllReadSchema,
  getUnreadCount: getUnreadCountSchema
};

