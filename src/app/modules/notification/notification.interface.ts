import { NotificationType } from "@prisma/client";
import { TAuthUser } from "../tripMember/tripMember.interface";

/**
 * Create notification payload (internal service use)
 */
export type TCreateNotificationPayload = {
  type: NotificationType;
  title: string;
  message?: string;
  data?: {
    planId?: string;
    threadId?: string;
    messageId?: string;
    memberId?: string;
    itemId?: string;
    meetupId?: string;
    invitationId?: string;
    [key: string]: any; // Allow additional metadata
  };
};

/**
 * Notification query (pagination & filters)
 */
export type TNotificationQuery = {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  type?: NotificationType;
  isRead?: string | boolean;
  searchTerm?: string;
};

/**
 * Mark read payload
 */
export type TMarkReadPayload = {
  notificationId: string;
};

/**
 * Notification response
 */
export type TNotificationResponse = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string | null;
  data: any | null;
  isRead: boolean;
  createdAt: Date;
};

/**
 * Notifications response with pagination
 */
export type TNotificationsResponse = {
  data: TNotificationResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Unread count response
 */
export type TUnreadCountResponse = {
  count: number;
};

/**
 * Mark all read response
 */
export type TMarkAllReadResponse = {
  count: number; // Number of notifications marked as read
};

