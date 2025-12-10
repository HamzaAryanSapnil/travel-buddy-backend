import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { TripBookingController } from "./tripBooking.controller";
import { TripBookingValidation } from "./tripBooking.validation";

const router = express.Router();

// Send join request
router.post(
  "/request",
  auth("USER", "ADMIN"),
  validateRequest(TripBookingValidation.createBooking),
  TripBookingController.createBookingRequest
);

// Get my outgoing requests
router.get(
  "/my-requests",
  auth("USER", "ADMIN"),
  TripBookingController.getMyRequests
);

// Get incoming requests for a plan (owner/admin only)
router.get(
  "/plan/:planId",
  auth("USER", "ADMIN"),
  validateRequest(TripBookingValidation.getBookingsByPlan),
  TripBookingController.getBookingsByPlan
);

// Respond to request (approve/reject)
router.patch(
  "/:bookingId/respond",
  auth("USER", "ADMIN"),
  validateRequest(TripBookingValidation.respondBooking),
  TripBookingController.respondToBooking
);

// Cancel own request
router.delete(
  "/:bookingId",
  auth("USER", "ADMIN"),
  validateRequest(TripBookingValidation.cancelBooking),
  TripBookingController.cancelBookingRequest
);

export const TripBookingRoutes = router;

