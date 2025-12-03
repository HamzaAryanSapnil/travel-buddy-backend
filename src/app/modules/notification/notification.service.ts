import { NotificationType, Prisma, TripStatus } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { paginationHelper, IPaginationOptions } from "../../helper/paginationHelper";
import pick from "../../shared/pick";
import {
  notificationFilterableFields,
  notificationSearchableFields
} from "./notification.constant";
import {
  TCreateNotificationPayload,
  TNotificationQuery,
  TNotificationResponse,
  TNotificationsResponse,
  TUnreadCountResponse,
  TMarkAllReadResponse
} from "./notification.interface";

/**
 * Create a notification (internal service function)
 * Used by other modules to create notifications
 */
const createNotification = async (
  userId: string,
  payload: TCreateNotificationPayload
): Promise<TNotificationResponse> => {
  // Validate user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }

  // Create notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: payload.type,
      title: payload.title,
      message: payload.message || null,
      data: payload.data ? (payload.data as Prisma.InputJsonValue) : Prisma.JsonNull
    }
  });

  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data as any,
    isRead: notification.isRead,
    createdAt: notification.createdAt
  };
};

/**
 * Get notifications for a user (with pagination and filters)
 */
const getNotifications = async (
  userId: string,
  query: TNotificationQuery
): Promise<TNotificationsResponse> => {
  // Calculate pagination
  const paginationOptions: IPaginationOptions = {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder
  };

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  // Build where clause
  const andConditions: Prisma.NotificationWhereInput[] = [
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
      OR: notificationSearchableFields.map((field) => ({
        [field]: {
          contains: query.searchTerm,
          mode: "insensitive" as Prisma.QueryMode
        }
      }))
    });
  }

  const whereConditions: Prisma.NotificationWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Get notifications and total count
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      }
    }),
    prisma.notification.count({
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
      data: notif.data as any,
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
};

/**
 * Mark a notification as read
 */
const markAsRead = async (
  notificationId: string,
  userId: string
): Promise<TNotificationResponse> => {
  // Load notification
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found.");
  }

  // Verify notification belongs to user
  if (notification.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to mark this notification as read."
    );
  }

  // If already read, return as is
  if (notification.isRead) {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data as any,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    };
  }

  // Update to read
  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });

  return {
    id: updated.id,
    userId: updated.userId,
    type: updated.type,
    title: updated.title,
    message: updated.message,
    data: updated.data as any,
    isRead: updated.isRead,
    createdAt: updated.createdAt
  };
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId: string): Promise<TMarkAllReadResponse> => {
  // Update all unread notifications for user
  const result = await prisma.notification.updateMany({
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
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId: string): Promise<TUnreadCountResponse> => {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false
    }
  });

  return {
    count
  };
};

/**
 * Helper: Notify all plan members except excludeUserId
 * Used by TravelPlan, Itinerary modules
 */
const notifyPlanMembers = async (
  planId: string,
  excludeUserId: string | null,
  payload: TCreateNotificationPayload
): Promise<number> => {
  // Get all plan members
  const members = await prisma.tripMember.findMany({
    where: {
      planId,
      status: TripStatus.JOINED
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
  const notifications = await Promise.all(
    userIds.map((userId) => createNotification(userId, payload))
  );

  return notifications.length;
};

/**
 * Helper: Notify all thread members except excludeUserId
 * Used by Chat module
 */
const notifyThreadMembers = async (
  threadId: string,
  excludeUserId: string | null,
  payload: TCreateNotificationPayload
): Promise<number> => {
  // Get all thread members
  const members = await prisma.chatThreadMember.findMany({
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
  const notifications = await Promise.all(
    userIds.map((userId) => createNotification(userId, payload))
  );

  return notifications.length;
};

/**
 * Helper: Notify a single user
 * Used for direct notifications (e.g., AI limit reached, invitation received)
 */
const notifyUser = async (
  userId: string,
  payload: TCreateNotificationPayload
): Promise<TNotificationResponse> => {
  return createNotification(userId, payload);
};

export const NotificationService = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  notifyPlanMembers,
  notifyThreadMembers,
  notifyUser
};

