"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const notification_controller_1 = require("./notification.controller");
const notification_validation_1 = require("./notification.validation");
const router = express_1.default.Router();
// Get notifications (with pagination and filters)
router.get("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(notification_validation_1.NotificationValidation.getNotifications), notification_controller_1.NotificationController.getNotifications);
// Mark single notification as read
router.patch("/:id/read", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(notification_validation_1.NotificationValidation.markRead), notification_controller_1.NotificationController.markAsRead);
// Mark all notifications as read
router.patch("/read-all", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(notification_validation_1.NotificationValidation.markAllRead), notification_controller_1.NotificationController.markAllAsRead);
// Get unread count
router.get("/unread-count", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(notification_validation_1.NotificationValidation.getUnreadCount), notification_controller_1.NotificationController.getUnreadCount);
exports.NotificationRoutes = router;
