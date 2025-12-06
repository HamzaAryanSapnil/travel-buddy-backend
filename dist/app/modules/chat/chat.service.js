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
exports.ChatService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = require("../../shared/prisma");
const tripMember_service_1 = require("../tripMember/tripMember.service");
const notification_service_1 = require("../notification/notification.service");
const chat_constant_1 = require("./chat.constant");
/**
 * Helper: Check if user is a member of the thread
 * For PLAN threads, checks both ChatThreadMember and TripMember
 */
const assertThreadMember = (authUser, threadId) => __awaiter(void 0, void 0, void 0, function* () {
    const thread = yield prisma_1.prisma.chatThread.findUnique({
        where: { id: threadId },
        select: {
            id: true,
            type: true,
            refId: true
        }
    });
    if (!thread) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Chat thread not found.");
    }
    // For PLAN threads, check TripMember membership
    if (thread.type === client_1.ChatThreadType.PLAN && thread.refId) {
        const { capabilities } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, thread.refId);
        // If user has any capability (not VIEWER with no permissions), they're a member
        // For chat, even VIEWER can read/write messages
        const plan = yield prisma_1.prisma.travelPlan.findUnique({
            where: { id: thread.refId },
            select: { visibility: true, ownerId: true }
        });
        if (!plan) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
        }
        // If plan is PUBLIC, anyone can read (but we require auth)
        if (plan.visibility === client_1.PlanVisibility.PUBLIC) {
            return;
        }
        // For PRIVATE/UNLISTED, must be a trip member
        if (!capabilities.canEditItinerary && authUser.userId !== plan.ownerId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You must be a member of this travel plan to access the chat.");
        }
        return;
    }
    // For other thread types, check ChatThreadMember
    const member = yield prisma_1.prisma.chatThreadMember.findUnique({
        where: {
            threadId_userId: {
                threadId,
                userId: authUser.userId
            }
        }
    });
    if (!member) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You must be a member of this thread to access it.");
    }
});
/**
 * Helper: Assert thread permission for PLAN threads
 * Uses TripMemberService for permission checks
 */
const assertThreadPermission = (authUser, threadId, action) => __awaiter(void 0, void 0, void 0, function* () {
    const thread = yield prisma_1.prisma.chatThread.findUnique({
        where: { id: threadId },
        select: {
            type: true,
            refId: true
        }
    });
    if (!thread) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Chat thread not found.");
    }
    // For PLAN threads, use TripMember permissions
    if (thread.type === client_1.ChatThreadType.PLAN && thread.refId) {
        if (action === "manage") {
            yield tripMember_service_1.TripMemberService.assertTripMemberPermission(authUser, thread.refId, "canManageMembers", "You do not have permission to manage thread members.");
        }
        else if (action === "write") {
            // For writing messages, just check membership
            yield assertThreadMember(authUser, threadId);
        }
        else {
            // For reading, check plan visibility
            const plan = yield prisma_1.prisma.travelPlan.findUnique({
                where: { id: thread.refId },
                select: { visibility: true }
            });
            if (!plan) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
            }
            if (plan.visibility === client_1.PlanVisibility.PRIVATE) {
                yield assertThreadMember(authUser, threadId);
            }
            // PUBLIC plans: anyone can read (but require auth)
        }
    }
    else {
        // For other thread types, check ChatThreadMember
        yield assertThreadMember(authUser, threadId);
    }
});
/**
 * Sanitize message content (basic XSS prevention)
 */
const sanitizeContent = (content) => {
    // Remove script tags and their content
    return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
};
/**
 * Create a chat thread
 */
const createThread = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // For PLAN threads, check permission
    if (payload.type === "PLAN") {
        // Check if plan exists
        const plan = yield prisma_1.prisma.travelPlan.findUnique({
            where: { id: payload.refId },
            select: { id: true, ownerId: true }
        });
        if (!plan) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
        }
        // Check permission: owner OR admin OR member with canManageMembers
        if (plan.ownerId !== authUser.userId && authUser.role !== "ADMIN") {
            yield tripMember_service_1.TripMemberService.assertTripMemberPermission(authUser, payload.refId, "canManageMembers", "You do not have permission to create a chat thread for this plan.");
        }
        // Check if thread already exists
        const existing = yield prisma_1.prisma.chatThread.findFirst({
            where: {
                type: client_1.ChatThreadType.PLAN,
                refId: payload.refId
            }
        });
        if (existing) {
            throw new ApiError_1.default(http_status_1.default.CONFLICT, "A chat thread already exists for this travel plan.");
        }
    }
    // Create thread and add creator as owner
    const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const thread = yield tx.chatThread.create({
            data: {
                type: payload.type,
                refId: payload.refId,
                title: payload.title || null
            }
        });
        // Add creator as owner
        yield tx.chatThreadMember.create({
            data: {
                threadId: thread.id,
                userId: authUser.userId,
                role: "owner"
            }
        });
        return thread;
    }));
    // Fetch thread with members
    const thread = yield prisma_1.prisma.chatThread.findUnique({
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
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to create thread.");
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
});
/**
 * Get a chat thread with members
 */
const getThread = (authUser, threadId) => __awaiter(void 0, void 0, void 0, function* () {
    const thread = yield prisma_1.prisma.chatThread.findUnique({
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Chat thread not found.");
    }
    // Check read permission
    yield assertThreadPermission(authUser, threadId, "read");
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
});
/**
 * Add a member to a chat thread
 */
const addMember = (authUser, threadId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check permission to manage members
    yield assertThreadPermission(authUser, threadId, "manage");
    // Check if target user exists
    const targetUser = yield prisma_1.prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true }
    });
    if (!targetUser) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Target user not found.");
    }
    // Check if user is already a member
    const existing = yield prisma_1.prisma.chatThreadMember.findUnique({
        where: {
            threadId_userId: {
                threadId,
                userId: payload.userId
            }
        }
    });
    if (existing) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, "User is already a member of this thread.");
    }
    // Create member
    const member = yield prisma_1.prisma.chatThreadMember.create({
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
});
/**
 * Send a message to a thread
 */
const sendMessage = (authUser, threadId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check write permission (membership)
    yield assertThreadPermission(authUser, threadId, "write");
    // Sanitize content
    const sanitizedContent = sanitizeContent(payload.content);
    // Create message
    const message = yield prisma_1.prisma.message.create({
        data: {
            threadId,
            senderId: authUser.userId,
            content: sanitizedContent,
            attachments: payload.attachments
                ? payload.attachments
                : client_1.Prisma.JsonNull
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
    notification_service_1.NotificationService.notifyThreadMembers(threadId, authUser.userId, {
        type: client_1.NotificationType.NEW_MESSAGE,
        title: "New message in chat",
        message: sanitizedContent.length > 100
            ? sanitizedContent.substring(0, 100) + "..."
            : sanitizedContent,
        data: {
            threadId,
            messageId: message.id,
            senderId: authUser.userId
        }
    }).catch((error) => {
        // Log error but don't fail the message send
        console.error("Failed to send notification for new message:", error);
    });
    return {
        id: message.id,
        threadId: message.threadId,
        senderId: message.senderId,
        content: message.content,
        attachments: message.attachments,
        isSystem: message.isSystem,
        isEdited: message.isEdited,
        isDeleted: message.isDeleted,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        sender: message.sender
    };
});
/**
 * Get messages from a thread (cursor pagination)
 */
const getMessages = (authUser, threadId, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Check read permission
    yield assertThreadPermission(authUser, threadId, "read");
    const limit = query.limit || chat_constant_1.MESSAGE_PAGE_SIZE;
    const cursor = query.cursor ? new Date(query.cursor) : undefined;
    // Build where clause
    const where = {
        threadId,
        isDeleted: false
    };
    if (cursor) {
        where.createdAt = {
            lt: cursor
        };
    }
    // Fetch one extra to determine if there's a next page
    const messages = yield prisma_1.prisma.message.findMany({
        where,
        take: limit + 1,
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
            attachments: msg.attachments,
            isSystem: msg.isSystem,
            isEdited: msg.isEdited,
            isDeleted: msg.isDeleted,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
            sender: msg.sender
        })),
        nextCursor
    };
});
/**
 * Edit a message
 * Only sender within EDIT_WINDOW_MS or admin/owner can edit
 */
const editMessage = (authUser, messageId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Load message with thread
    const message = yield prisma_1.prisma.message.findUnique({
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Message not found.");
    }
    // Check if message is deleted
    if (message.isDeleted) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot edit a deleted message.");
    }
    // Check permission: sender within time window OR admin/owner
    const isSender = message.senderId === authUser.userId;
    const timeSinceCreation = Date.now() - message.createdAt.getTime();
    const withinTimeWindow = timeSinceCreation <= chat_constant_1.EDIT_WINDOW_MS;
    let canEdit = false;
    if (isSender && withinTimeWindow) {
        canEdit = true;
    }
    else if (authUser.role === "ADMIN") {
        canEdit = true;
    }
    else if (message.thread.type === client_1.ChatThreadType.PLAN && message.thread.refId) {
        // Check if user is owner/admin of the plan
        const { capabilities } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, message.thread.refId);
        // Owner/Admin can edit any message
        if (capabilities.canManageMembers) {
            canEdit = true;
        }
    }
    if (!canEdit) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only edit your own messages within 15 minutes, or you must be an admin/owner.");
    }
    // Sanitize content
    const sanitizedContent = sanitizeContent(payload.content);
    // Update message
    const updated = yield prisma_1.prisma.message.update({
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
        attachments: updated.attachments,
        isSystem: updated.isSystem,
        isEdited: updated.isEdited,
        isDeleted: updated.isDeleted,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        sender: updated.sender
    };
});
/**
 * Delete a message (soft delete)
 * Only sender OR admin/owner can delete
 */
const deleteMessage = (authUser, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load message with thread
    const message = yield prisma_1.prisma.message.findUnique({
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Message not found.");
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
    }
    else if (authUser.role === "ADMIN") {
        canDelete = true;
    }
    else if (message.thread.type === client_1.ChatThreadType.PLAN && message.thread.refId) {
        // Check if user is owner/admin of the plan
        const { capabilities } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, message.thread.refId);
        // Owner/Admin can delete any message
        if (capabilities.canManageMembers) {
            canDelete = true;
        }
    }
    if (!canDelete) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only delete your own messages, or you must be an admin/owner.");
    }
    // Soft delete: set isDeleted=true and mask content
    yield prisma_1.prisma.message.update({
        where: { id: messageId },
        data: {
            isDeleted: true,
            content: "[deleted]"
        }
    });
});
/**
 * Find thread by plan ID
 */
const findThreadByPlan = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if plan exists and user has access
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: query.planId },
        select: {
            id: true,
            visibility: true,
            ownerId: true
        }
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check read permission
    if (plan.visibility === client_1.PlanVisibility.PRIVATE) {
        const { capabilities } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, query.planId);
        // Must be a member (not just VIEWER with no permissions)
        if (!capabilities.canEditItinerary && authUser.userId !== plan.ownerId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You do not have access to this travel plan's chat.");
        }
    }
    // Find thread
    const thread = yield prisma_1.prisma.chatThread.findFirst({
        where: {
            type: client_1.ChatThreadType.PLAN,
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
});
exports.ChatService = {
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
