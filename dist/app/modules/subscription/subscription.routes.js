"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const subscription_controller_1 = require("./subscription.controller");
const subscription_validation_1 = require("./subscription.validation");
const router = express_1.default.Router();
// Get subscription status (current user)
router.get("/status", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(subscription_validation_1.SubscriptionValidation.getSubscriptionStatus), subscription_controller_1.SubscriptionController.getSubscriptionStatus);
// Create subscription
router.post("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(subscription_validation_1.SubscriptionValidation.createSubscription), subscription_controller_1.SubscriptionController.createSubscription);
// Get subscriptions (admin only - with pagination, filters)
router.get("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(subscription_validation_1.SubscriptionValidation.getSubscriptions), subscription_controller_1.SubscriptionController.getSubscriptions);
// Get single subscription
router.get("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(subscription_validation_1.SubscriptionValidation.getSubscription), subscription_controller_1.SubscriptionController.getSubscription);
// Update subscription
router.patch("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(subscription_validation_1.SubscriptionValidation.updateSubscription), subscription_controller_1.SubscriptionController.updateSubscription);
// Cancel subscription
router.delete("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(subscription_validation_1.SubscriptionValidation.cancelSubscription), subscription_controller_1.SubscriptionController.cancelSubscription);
// Stripe webhook endpoint (no auth, raw body required)
router.post("/webhook", express_1.default.raw({ type: "application/json" }), // Raw body middleware for Stripe signature verification
(req, res, next) => {
    // Store raw body in request for controller access
    req.rawBody = req.body;
    next();
}, (0, validateRequest_1.default)(subscription_validation_1.SubscriptionValidation.stripeWebhook), subscription_controller_1.SubscriptionController.handleWebhook);
exports.SubscriptionRoutes = router;
