"use strict";
/**
 * Chat Module Constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAT_THREAD_TYPES = exports.CHAT_THREAD_ROLES = exports.MESSAGE_MAX_PAGE_SIZE = exports.MESSAGE_PAGE_SIZE = exports.EDIT_WINDOW_MS = void 0;
// Message edit time window (15 minutes in milliseconds)
exports.EDIT_WINDOW_MS = 15 * 60 * 1000;
// Default page size for message pagination
exports.MESSAGE_PAGE_SIZE = 30;
// Maximum page size for message pagination
exports.MESSAGE_MAX_PAGE_SIZE = 100;
// Chat thread member roles
exports.CHAT_THREAD_ROLES = ["owner", "admin", "member"];
// Chat thread types (from enum)
exports.CHAT_THREAD_TYPES = ["USER", "PLAN", "MEETUP", "SYSTEM"];
