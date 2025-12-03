import { TAuthUser } from "../tripMember/tripMember.interface";
import { ChatThreadType } from "@prisma/client";

/**
 * Create thread payload
 */
export type TCreateThreadPayload = {
  type: "PLAN"; // For now, only PLAN threads
  refId: string; // planId
  title?: string;
};

/**
 * Add member payload
 */
export type TAddMemberPayload = {
  userId: string;
  role: "owner" | "admin" | "member";
};

/**
 * Send message payload
 */
export type TSendMessagePayload = {
  content: string;
  attachments?: Array<{
    url: string;
    type?: string;
  }>;
};

/**
 * Edit message payload
 */
export type TEditMessagePayload = {
  content: string;
};

/**
 * Message query (cursor pagination)
 */
export type TMessageQuery = {
  cursor?: string; // ISO datetime string (createdAt)
  limit?: number;
};

/**
 * Find thread by plan query
 */
export type TFindThreadByPlanQuery = {
  planId: string;
};

/**
 * Chat thread member response
 */
export type TThreadMemberResponse = {
  id: string;
  threadId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    profileImage: string | null;
  };
};

/**
 * Chat thread response
 */
export type TThreadResponse = {
  id: string;
  type: ChatThreadType;
  refId: string | null;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  members: TThreadMemberResponse[];
};

/**
 * Message attachment
 */
export type TMessageAttachment = {
  url: string;
  type?: string;
};

/**
 * Message response
 */
export type TMessageResponse = {
  id: string;
  threadId: string;
  senderId: string;
  content: string | null;
  attachments: TMessageAttachment[] | null;
  isSystem: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender: {
    id: string;
    fullName: string | null;
    email: string;
    profileImage: string | null;
  };
};

/**
 * Messages response (with cursor pagination)
 */
export type TMessagesResponse = {
  items: TMessageResponse[];
  nextCursor: string | null; // ISO datetime string or null if no more
};

