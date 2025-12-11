import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionValidation } from "./subscription.validation";

const router = express.Router();

// Get subscription status (current user)
router.get(
  "/status",
  auth("USER", "ADMIN"),
  validateRequest(SubscriptionValidation.getSubscriptionStatus),
  SubscriptionController.getSubscriptionStatus
);

// Create subscription
router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(SubscriptionValidation.createSubscription),
  SubscriptionController.createSubscription
);

// Get subscriptions (admin only - with pagination, filters)
router.get(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(SubscriptionValidation.getSubscriptions),
  SubscriptionController.getSubscriptions
);

// Get single subscription
router.get(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(SubscriptionValidation.getSubscription),
  SubscriptionController.getSubscription
);

// Update subscription
router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(SubscriptionValidation.updateSubscription),
  SubscriptionController.updateSubscription
);

// Cancel subscription
router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(SubscriptionValidation.cancelSubscription),
  SubscriptionController.cancelSubscription
);

// Sync subscription from Stripe (manual sync - for missing webhook data)
router.post(
  "/sync/:stripeSubscriptionId",
  auth("USER", "ADMIN"),
  validateRequest(SubscriptionValidation.syncSubscription),
  SubscriptionController.syncSubscription
);

// Stripe webhook endpoint (no auth, raw body required)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Raw body middleware for Stripe signature verification
  (req, res, next) => {
    // Store raw body in request for controller access
    (req as any).rawBody = req.body;
    next();
  },
  validateRequest(SubscriptionValidation.stripeWebhook),
  SubscriptionController.handleWebhook
);

export const SubscriptionRoutes = router;

