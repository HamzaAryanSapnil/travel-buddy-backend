"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatValidation = void 0;
const zod_1 = require("zod");
const chat_constant_1 = require("./chat.constant");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
/**
 * Create thread validation
 */
const createThreadSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.literal("PLAN", {
            error: () => 'Thread type must be "PLAN".'
        }),
        refId: stringRequired("Reference ID (planId) is required."),
        title: stringRequired("Title must be a string.")
            .max(200, { message: "Title cannot exceed 200 characters." })
            .optional()
    })
});
/**
 * Get thread validation
 */
const getThreadSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Thread ID is required.")
    })
});
/**
 * Add member validation
 */
const addMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Thread ID is required.")
    }),
    body: zod_1.z.object({
        userId: stringRequired("User ID is required."),
        role: zod_1.z.enum(chat_constant_1.CHAT_THREAD_ROLES, {
            error: () => `Role must be one of: ${chat_constant_1.CHAT_THREAD_ROLES.join(", ")}.`
        })
    })
});
/**
 * Get messages validation (cursor pagination)
 */
const getMessagesSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Thread ID is required.")
    }),
    query: zod_1.z.object({
        cursor: stringRequired("Cursor must be a string.")
            .datetime({ message: "Cursor must be a valid ISO datetime string." })
            .optional(),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined))
            .pipe(zod_1.z
            .number()
            .int({ message: "Limit must be an integer." })
            .min(1, { message: "Limit must be at least 1." })
            .max(chat_constant_1.MESSAGE_MAX_PAGE_SIZE, {
            message: `Limit cannot exceed ${chat_constant_1.MESSAGE_MAX_PAGE_SIZE}.`
        })
            .optional())
    })
});
/**
 * Send message validation
 */
const sendMessageSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Thread ID is required.")
    }),
    body: zod_1.z.object({
        content: stringRequired("Content is required.")
            .min(1, { message: "Content cannot be empty." })
            .max(5000, { message: "Content cannot exceed 5000 characters." }),
        attachments: zod_1.z
            .array(zod_1.z.object({
            url: stringRequired("Attachment URL is required.")
                .url({ message: "Attachment URL must be a valid URL." }),
            type: stringRequired("Attachment type must be a string.")
                .max(50, { message: "Attachment type cannot exceed 50 characters." })
                .optional()
        }))
            .max(10, { message: "Cannot attach more than 10 files." })
            .optional()
    })
});
/**
 * Edit message validation
 */
const editMessageSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Message ID is required.")
    }),
    body: zod_1.z.object({
        content: stringRequired("Content is required.")
            .min(1, { message: "Content cannot be empty." })
            .max(5000, { message: "Content cannot exceed 5000 characters." })
    })
});
/**
 * Delete message validation
 */
const deleteMessageSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Message ID is required.")
    })
});
/**
 * Find thread by plan validation
 */
const findThreadByPlanSchema = zod_1.z.object({
    query: zod_1.z.object({
        planId: stringRequired("Plan ID is required.")
    })
});
exports.ChatValidation = {
    createThread: createThreadSchema,
    getThread: getThreadSchema,
    addMember: addMemberSchema,
    getMessages: getMessagesSchema,
    sendMessage: sendMessageSchema,
    editMessage: editMessageSchema,
    deleteMessage: deleteMessageSchema,
    findThreadByPlan: findThreadByPlanSchema
};
