import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = express.Router();

// Create review
router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(ReviewValidation.createReview),
  ReviewController.createReview
);

// Get review statistics
router.get(
  "/statistics",
  auth("USER", "ADMIN"),
  validateRequest(ReviewValidation.getReviewStatistics),
  ReviewController.getReviewStatistics
);

// Get single review
router.get(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(ReviewValidation.getReview),
  ReviewController.getReview
);

// Get reviews list
router.get(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(ReviewValidation.getReviews),
  ReviewController.getReviews
);

// Update review
router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(ReviewValidation.updateReview),
  ReviewController.updateReview
);

// Delete review
router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(ReviewValidation.deleteReview),
  ReviewController.deleteReview
);

export const ReviewRoutes = router;

