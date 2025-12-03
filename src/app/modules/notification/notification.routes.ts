import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { NotificationController } from "./notification.controller";
import { NotificationValidation } from "./notification.validation";

const router = express.Router();

// Get notifications (with pagination and filters)
router.get(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(NotificationValidation.getNotifications),
  NotificationController.getNotifications
);

// Mark single notification as read
router.patch(
  "/:id/read",
  auth("USER", "ADMIN"),
  validateRequest(NotificationValidation.markRead),
  NotificationController.markAsRead
);

// Mark all notifications as read
router.patch(
  "/read-all",
  auth("USER", "ADMIN"),
  validateRequest(NotificationValidation.markAllRead),
  NotificationController.markAllAsRead
);

// Get unread count
router.get(
  "/unread-count",
  auth("USER", "ADMIN"),
  validateRequest(NotificationValidation.getUnreadCount),
  NotificationController.getUnreadCount
);

export const NotificationRoutes = router;

