import { ChatThreadType, NotificationType, PlanVisibility, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { TripMemberService } from "../tripMember/tripMember.service";
import { TAuthUser } from "../tripMember/tripMember.interface";
import { NotificationService } from "../notification/notification.service";
import { EDIT_WINDOW_MS, MESSAGE_PAGE_SIZE } from "./chat.constant";
import {
  TCreateThreadPayload,
  TAddMemberPayload,
  TSendMessagePayload,
  TEditMessagePayload,
  TMessageQuery,
  TFindThreadByPlanQuery,
  TThreadResponse,
  TThreadMemberResponse,
  TMessageResponse,
  TMessagesResponse
} from "./chat.interface";

/**
 * Helper: Check if user is a member of the thread
 * For PLAN threads, checks both ChatThreadMember and TripMember
 */
const assertThreadMember = async (
  authUser: TAuthUser,
  threadId: string
): Promise<void> => {
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      type: true,
      refId: true
    }
  });

  if (!thread) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chat thread not found.");
  }

  // For PLAN threads, check TripMember membership
  if (thread.type === ChatThreadType.PLAN && thread.refId) {
    const { capabilities } = await TripMemberService.getTripMemberPermission(
      authUser,
      thread.refId
    );

    // If user has any capability (not VIEWER with no permissions), they're a member
    // For chat, even VIEWER can read/write messages
    const plan = await prisma.travelPlan.findUnique({
      where: { id: thread.refId },
      select: { visibility: true, ownerId: true }
    });

    if (!plan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
    }

    // If plan is PUBLIC, anyone can read (but we require auth)
    if (plan.visibility === PlanVisibility.PUBLIC) {
      return;
    }

    // For PRIVATE/UNLISTED, must be a trip member
    if (!capabilities.canEditItinerary && authUser.userId !== plan.ownerId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You must be a member of this travel plan to access the chat."
      );
    }

    return;
  }

  // For other thread types, check ChatThreadMember
  const member = await prisma.chatThreadMember.findUnique({
    where: {
      threadId_userId: {
        threadId,
        userId: authUser.userId
      }
    }
  });

  if (!member) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You must be a member of this thread to access it."
    );
  }
};

/**
 * Helper: Assert thread permission for PLAN threads
 * Uses TripMemberService for permission checks
 */
const assertThreadPermission = async (
  authUser: TAuthUser,
  threadId: string,
  action: "read" | "write" | "manage"
): Promise<void> => {
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: {
      type: true,
      refId: true
    }
  });

  if (!thread) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chat thread not found.");
  }

  // For PLAN threads, use TripMember permissions
  if (thread.type === ChatThreadType.PLAN && thread.refId) {
    if (action === "manage") {
      await TripMemberService.assertTripMemberPermission(
        authUser,
        thread.refId,
        "canManageMembers",
        "You do not have permission to manage thread members."
      );
    } else if (action === "write") {
      // For writing messages, just check membership
      await assertThreadMember(authUser, threadId);
    } else {
      // For reading, check plan visibility
      const plan = await prisma.travelPlan.findUnique({
        where: { id: thread.refId },
        select: { visibility: true }
      });

      if (!plan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
      }

      if (plan.visibility === PlanVisibility.PRIVATE) {
        await assertThreadMember(authUser, threadId);
      }
      // PUBLIC plans: anyone can read (but require auth)
    }
  } else {
    // For other thread types, check ChatThreadMember
    await assertThreadMember(authUser, threadId);
  }
};

/**
 * Sanitize message content (basic XSS prevention)
 */
const sanitizeContent = (content: string): string => {
  // Remove script tags and their content
  return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
};

/**
 * Create a chat thread
 */
const createThread = async (
  authUser: TAuthUser,
  payload: TCreateThreadPayload
): Promise<TThreadResponse> => {
  // For PLAN threads, check permission
  if (payload.type === "PLAN") {
    // Check if plan exists
    const plan = await prisma.travelPlan.findUnique({
      where: { id: payload.refId },
      select: { id: true, ownerId: true }
    });

    if (!plan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
    }

    // Check permission: owner OR admin OR member with canManageMembers
    if (plan.ownerId !== authUser.userId && authUser.role !== "ADMIN") {
      await TripMemberService.assertTripMemberPermission(
        authUser,
        payload.refId,
        "canManageMembers",
        "You do not have permission to create a chat thread for this plan."
      );
    }

    // Check if thread already exists
    const existing = await prisma.chatThread.findFirst({
      where: {
        type: ChatThreadType.PLAN,
        refId: payload.refId
      }
    });

    if (existing) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "A chat thread already exists for this travel plan."
      );
    }
  }

  // Create thread and add creator as owner
  const result = await prisma.$transaction(async (tx) => {
    const thread = await tx.chatThread.create({
      data: {
        type: payload.type,
        refId: payload.refId,
        title: payload.title || null
      }
    });

    // Add creator as owner
    await tx.chatThreadMember.create({
      data: {
        threadId: thread.id,
        userId: authUser.userId,
        role: "owner"
      }
    });

    return thread;
  });

  // Fetch thread with members
  const thread = await prisma.chatThread.findUnique({
    where: { id: result.id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true
            }
          }
        },
        orderBy: {
          joinedAt: "asc"
        }
      }
    }
  });

  if (!thread) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create thread.");
  }

  return {
    id: thread.id,
    type: thread.type,
    refId: thread.refId,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    members: thread.members.map((m) => ({
      id: m.id,
      threadId: m.threadId,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user
    }))
  };
};

/**
 * Get a chat thread with members
 */
const getThread = async (
  authUser: TAuthUser,
  threadId: string
): Promise<TThreadResponse> => {
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true
            }
          }
        },
        orderBy: {
          joinedAt: "asc"
        }
      }
    }
  });

  if (!thread) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chat thread not found.");
  }

  // Check read permission
  await assertThreadPermission(authUser, threadId, "read");

  return {
    id: thread.id,
    type: thread.type,
    refId: thread.refId,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    members: thread.members.map((m) => ({
      id: m.id,
      threadId: m.threadId,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user
    }))
  };
};

/**
 * Add a member to a chat thread
 */
const addMember = async (
  authUser: TAuthUser,
  threadId: string,
  payload: TAddMemberPayload
): Promise<TThreadMemberResponse> => {
  // Check permission to manage members
  await assertThreadPermission(authUser, threadId, "manage");

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true }
  });

  if (!targetUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Target user not found.");
  }

  // Check if user is already a member
  const existing = await prisma.chatThreadMember.findUnique({
    where: {
      threadId_userId: {
        threadId,
        userId: payload.userId
      }
    }
  });

  if (existing) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User is already a member of this thread."
    );
  }

  // Create member
  const member = await prisma.chatThreadMember.create({
    data: {
      threadId,
      userId: payload.userId,
      role: payload.role
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true
        }
      }
    }
  });

  return {
    id: member.id,
    threadId: member.threadId,
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt,
    user: member.user
  };
};

/**
 * Send a message to a thread
 */
const sendMessage = async (
  authUser: TAuthUser,
  threadId: string,
  payload: TSendMessagePayload
): Promise<TMessageResponse> => {
  // Check write permission (membership)
  await assertThreadPermission(authUser, threadId, "write");

  // Sanitize content
  const sanitizedContent = sanitizeContent(payload.content);

  // Create message
  const message = await prisma.message.create({
    data: {
      threadId,
      senderId: authUser.userId,
      content: sanitizedContent,
      attachments: payload.attachments
        ? (payload.attachments as Prisma.InputJsonValue)
        : Prisma.JsonNull
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true
        }
      }
    }
  });

  // Notify all thread members except sender (async, don't wait)
  NotificationService.notifyThreadMembers(
    threadId,
    authUser.userId,
    {
      type: NotificationType.NEW_MESSAGE,
      title: "New message in chat",
      message: sanitizedContent.length > 100 
        ? sanitizedContent.substring(0, 100) + "..." 
        : sanitizedContent,
      data: {
        threadId,
        messageId: message.id,
        senderId: authUser.userId
      }
    }
  ).catch((error) => {
    // Log error but don't fail the message send
    console.error("Failed to send notification for new message:", error);
  });

  return {
    id: message.id,
    threadId: message.threadId,
    senderId: message.senderId,
    content: message.content,
    attachments: message.attachments as any,
    isSystem: message.isSystem,
    isEdited: message.isEdited,
    isDeleted: message.isDeleted,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    sender: message.sender
  };
};

/**
 * Get messages from a thread (cursor pagination)
 */
const getMessages = async (
  authUser: TAuthUser,
  threadId: string,
  query: TMessageQuery
): Promise<TMessagesResponse> => {
  // Check read permission
  await assertThreadPermission(authUser, threadId, "read");

  const limit = query.limit ? Number(query.limit) : MESSAGE_PAGE_SIZE;
  const cursor = query.cursor ? new Date(query.cursor) : undefined;

  // Build where clause
  const where: Prisma.MessageWhereInput = {
    threadId,
    isDeleted: false
  };

  if (cursor) {
    where.createdAt = {
      lt: cursor
    };
  }

  // Fetch one extra to determine if there's a next page
  const messages = await prisma.message.findMany({
    where,
    take: Number(limit) + 1,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true
        }
      }
    }
  });

  // Check if there's a next page
  const hasNext = messages.length > limit;
  const items = hasNext ? messages.slice(0, limit) : messages;

  // Get next cursor (oldest message's createdAt)
  const nextCursor = hasNext && items.length > 0
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  return {
    items: items.map((msg) => ({
      id: msg.id,
      threadId: msg.threadId,
      senderId: msg.senderId,
      content: msg.content,
      attachments: msg.attachments as any,
      isSystem: msg.isSystem,
      isEdited: msg.isEdited,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      sender: msg.sender
    })),
    nextCursor
  };
};

/**
 * Edit a message
 * Only sender within EDIT_WINDOW_MS or admin/owner can edit
 */
const editMessage = async (
  authUser: TAuthUser,
  messageId: string,
  payload: TEditMessagePayload
): Promise<TMessageResponse> => {
  // Load message with thread
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      thread: {
        select: {
          id: true,
          type: true,
          refId: true
        }
      },
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true
        }
      }
    }
  });

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, "Message not found.");
  }

  // Check if message is deleted
  if (message.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot edit a deleted message.");
  }

  // Check permission: sender within time window OR admin/owner
  const isSender = message.senderId === authUser.userId;
  const timeSinceCreation = Date.now() - message.createdAt.getTime();
  const withinTimeWindow = timeSinceCreation <= EDIT_WINDOW_MS;

  let canEdit = false;

  if (isSender && withinTimeWindow) {
    canEdit = true;
  } else if (authUser.role === "ADMIN") {
    canEdit = true;
  } else if (message.thread.type === ChatThreadType.PLAN && message.thread.refId) {
    // Check if user is owner/admin of the plan
    const { capabilities } = await TripMemberService.getTripMemberPermission(
      authUser,
      message.thread.refId
    );

    // Owner/Admin can edit any message
    if (capabilities.canManageMembers) {
      canEdit = true;
    }
  }

  if (!canEdit) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only edit your own messages within 15 minutes, or you must be an admin/owner."
    );
  }

  // Sanitize content
  const sanitizedContent = sanitizeContent(payload.content);

  // Update message
  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: sanitizedContent,
      isEdited: true
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true
        }
      }
    }
  });

  return {
    id: updated.id,
    threadId: updated.threadId,
    senderId: updated.senderId,
    content: updated.content,
    attachments: updated.attachments as any,
    isSystem: updated.isSystem,
    isEdited: updated.isEdited,
    isDeleted: updated.isDeleted,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    sender: updated.sender
  };
};

/**
 * Delete a message (soft delete)
 * Only sender OR admin/owner can delete
 */
const deleteMessage = async (
  authUser: TAuthUser,
  messageId: string
): Promise<void> => {
  // Load message with thread
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      thread: {
        select: {
          id: true,
          type: true,
          refId: true
        }
      }
    }
  });

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, "Message not found.");
  }

  // Check if already deleted
  if (message.isDeleted) {
    return; // Already deleted, no-op
  }

  // Check permission: sender OR admin/owner
  const isSender = message.senderId === authUser.userId;
  let canDelete = false;

  if (isSender) {
    canDelete = true;
  } else if (authUser.role === "ADMIN") {
    canDelete = true;
  } else if (message.thread.type === ChatThreadType.PLAN && message.thread.refId) {
    // Check if user is owner/admin of the plan
    const { capabilities } = await TripMemberService.getTripMemberPermission(
      authUser,
      message.thread.refId
    );

    // Owner/Admin can delete any message
    if (capabilities.canManageMembers) {
      canDelete = true;
    }
  }

  if (!canDelete) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only delete your own messages, or you must be an admin/owner."
    );
  }

  // Soft delete: set isDeleted=true and mask content
  await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      content: "[deleted]"
    }
  });
};

/**
 * Find thread by plan ID
 */
const findThreadByPlan = async (
  authUser: TAuthUser,
  query: TFindThreadByPlanQuery
): Promise<TThreadResponse | null> => {
  // Check if plan exists and user has access
  const plan = await prisma.travelPlan.findUnique({
    where: { id: query.planId },
    select: {
      id: true,
      visibility: true,
      ownerId: true
    }
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check read permission
  if (plan.visibility === PlanVisibility.PRIVATE) {
    const { capabilities } = await TripMemberService.getTripMemberPermission(
      authUser,
      query.planId
    );

    // Must be a member (not just VIEWER with no permissions)
    if (!capabilities.canEditItinerary && authUser.userId !== plan.ownerId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have access to this travel plan's chat."
      );
    }
  }

  // Find thread
  const thread = await prisma.chatThread.findFirst({
    where: {
      type: ChatThreadType.PLAN,
      refId: query.planId
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true
            }
          }
        },
        orderBy: {
          joinedAt: "asc"
        }
      }
    }
  });

  if (!thread) {
    return null;
  }

  return {
    id: thread.id,
    type: thread.type,
    refId: thread.refId,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    members: thread.members.map((m) => ({
      id: m.id,
      threadId: m.threadId,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user
    }))
  };
};

export const ChatService = {
  assertThreadMember,
  assertThreadPermission,
  createThread,
  getThread,
  addMember,
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  findThreadByPlan
};

