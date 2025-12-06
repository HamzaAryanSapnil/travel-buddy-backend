"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const chat_controller_1 = require("./chat.controller");
const chat_validation_1 = require("./chat.validation");
const router = express_1.default.Router();
// Create thread
router.post("/threads", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.createThread), chat_controller_1.ChatController.createThread);
// Get thread by ID
router.get("/threads/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.getThread), chat_controller_1.ChatController.getThread);
// Find thread by plan ID (optional helper endpoint)
router.get("/threads", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.findThreadByPlan), chat_controller_1.ChatController.findThreadByPlan);
// Add member to thread
router.post("/threads/:id/members", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.addMember), chat_controller_1.ChatController.addMember);
// Get messages from thread (cursor pagination)
router.get("/threads/:id/messages", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.getMessages), chat_controller_1.ChatController.getMessages);
// Send message to thread
router.post("/threads/:id/messages", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.sendMessage), chat_controller_1.ChatController.sendMessage);
// Edit message
router.patch("/messages/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.editMessage), chat_controller_1.ChatController.editMessage);
// Delete message (soft delete)
router.delete("/messages/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.deleteMessage), chat_controller_1.ChatController.deleteMessage);
exports.ChatRoutes = router;
