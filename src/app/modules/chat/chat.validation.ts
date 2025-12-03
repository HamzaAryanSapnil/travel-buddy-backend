import { z } from "zod";
import { CHAT_THREAD_ROLES, MESSAGE_MAX_PAGE_SIZE } from "./chat.constant";

const stringRequired = (message: string) => z.string({ error: () => message });

/**
 * Create thread validation
 */
const createThreadSchema = z.object({
  body: z.object({
    type: z.literal("PLAN", {
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
const getThreadSchema = z.object({
  params: z.object({
    id: stringRequired("Thread ID is required.")
  })
});

/**
 * Add member validation
 */
const addMemberSchema = z.object({
  params: z.object({
    id: stringRequired("Thread ID is required.")
  }),
  body: z.object({
    userId: stringRequired("User ID is required."),
    role: z.enum(CHAT_THREAD_ROLES as [string, ...string[]], {
      error: () => `Role must be one of: ${CHAT_THREAD_ROLES.join(", ")}.`
    })
  })
});

/**
 * Get messages validation (cursor pagination)
 */
const getMessagesSchema = z.object({
  params: z.object({
    id: stringRequired("Thread ID is required.")
  }),
  query: z.object({
    cursor: stringRequired("Cursor must be a string.")
      .datetime({ message: "Cursor must be a valid ISO datetime string." })
      .optional(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .pipe(
        z
          .number()
          .int({ message: "Limit must be an integer." })
          .min(1, { message: "Limit must be at least 1." })
          .max(MESSAGE_MAX_PAGE_SIZE, {
            message: `Limit cannot exceed ${MESSAGE_MAX_PAGE_SIZE}.`
          })
          .optional()
      )
  })
});

/**
 * Send message validation
 */
const sendMessageSchema = z.object({
  params: z.object({
    id: stringRequired("Thread ID is required.")
  }),
  body: z.object({
    content: stringRequired("Content is required.")
      .min(1, { message: "Content cannot be empty." })
      .max(5000, { message: "Content cannot exceed 5000 characters." }),
    attachments: z
      .array(
        z.object({
          url: stringRequired("Attachment URL is required.")
            .url({ message: "Attachment URL must be a valid URL." }),
          type: stringRequired("Attachment type must be a string.")
            .max(50, { message: "Attachment type cannot exceed 50 characters." })
            .optional()
        })
      )
      .max(10, { message: "Cannot attach more than 10 files." })
      .optional()
  })
});

/**
 * Edit message validation
 */
const editMessageSchema = z.object({
  params: z.object({
    id: stringRequired("Message ID is required.")
  }),
  body: z.object({
    content: stringRequired("Content is required.")
      .min(1, { message: "Content cannot be empty." })
      .max(5000, { message: "Content cannot exceed 5000 characters." })
  })
});

/**
 * Delete message validation
 */
const deleteMessageSchema = z.object({
  params: z.object({
    id: stringRequired("Message ID is required.")
  })
});

/**
 * Find thread by plan validation
 */
const findThreadByPlanSchema = z.object({
  query: z.object({
    planId: stringRequired("Plan ID is required.")
  })
});

export const ChatValidation = {
  createThread: createThreadSchema,
  getThread: getThreadSchema,
  addMember: addMemberSchema,
  getMessages: getMessagesSchema,
  sendMessage: sendMessageSchema,
  editMessage: editMessageSchema,
  deleteMessage: deleteMessageSchema,
  findThreadByPlan: findThreadByPlanSchema
};

