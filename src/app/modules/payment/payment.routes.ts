import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = express.Router();

// Get user's own payment history
router.get(
  "/my-payments",
  auth("USER", "ADMIN"),
  validateRequest(PaymentValidation.getMyPayments),
  PaymentController.getMyPayments
);

// Get payment summary
router.get(
  "/summary",
  auth("USER", "ADMIN"),
  validateRequest(PaymentValidation.getPaymentSummary),
  PaymentController.getPaymentSummary
);

// Get payment statistics (admin only) - MUST be before /:id route
router.get(
  "/statistics",
  auth("ADMIN"),
  validateRequest(PaymentValidation.getPaymentStatistics),
  PaymentController.getPaymentStatistics
);

// Get single payment
router.get(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(PaymentValidation.getPayment),
  PaymentController.getPayment
);

// Get all payments (admin only)
router.get(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(PaymentValidation.getPayments),
  PaymentController.getPayments
);

export const PaymentRoutes = router;
