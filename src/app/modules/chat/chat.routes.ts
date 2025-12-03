import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ChatController } from "./chat.controller";
import { ChatValidation } from "./chat.validation";

const router = express.Router();

// Create thread
router.post(
  "/threads",
  auth("USER", "ADMIN"),
  validateRequest(ChatValidation.createThread),
  ChatController.createThread
);

// Get thread by ID
router.get(
  "/threads/:id",
  auth("USER", "ADMIN"),
  validateRequest(ChatValidation.getThread),
  ChatController.getThread
);

// Find thread by plan ID (optional helper endpoint)
router.get(
  "/threads",
  auth("USER", "ADMIN"),
  validateRequest(ChatValidation.findThreadByPlan),
  ChatController.findThreadByPlan
);

// Add member to thread
router.post(
  "/threads/:id/members",
  auth("USER", "ADMIN"),
  validateRequest(ChatValidation.addMember),
  ChatController.addMember
);

// Get messages from thread (cursor pagination)
router.get(
  "/threads/:id/messages",
  auth("USER", "ADMIN"),
  validateRequest(ChatValidation.getMessages),
  ChatController.getMessages
);

// Send message to thread
router.post(
  "/threads/:id/messages",
  auth("USER", "ADMIN"),
  validateRequest(ChatValidation.sendMessage),
  ChatController.sendMessage
);

// Edit message
router.patch(
  "/messages/:id",
  auth("USER", "ADMIN"),
  validateRequest(ChatValidation.editMessage),
  ChatController.editMessage
);

// Delete message (soft delete)
router.delete(
  "/messages/:id",
  auth("USER", "ADMIN"),
  validateRequest(ChatValidation.deleteMessage),
  ChatController.deleteMessage
);

export const ChatRoutes = router;

