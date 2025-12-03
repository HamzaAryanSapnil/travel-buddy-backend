/**
 * Chat Module Constants
 */

// Message edit time window (15 minutes in milliseconds)
export const EDIT_WINDOW_MS = 15 * 60 * 1000;

// Default page size for message pagination
export const MESSAGE_PAGE_SIZE = 30;

// Maximum page size for message pagination
export const MESSAGE_MAX_PAGE_SIZE = 100;

// Chat thread member roles
export const CHAT_THREAD_ROLES = ["owner", "admin", "member"];

// Chat thread types (from enum)
export const CHAT_THREAD_TYPES = ["USER", "PLAN", "MEETUP", "SYSTEM"] as const;

