import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PlannerController } from "./planner.controller";
import { PlannerValidation } from "./planner.validation";

const router = express.Router();

// Create planner session
router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(PlannerValidation.createSession),
  PlannerController.createSession
);

// Add step to session
router.post(
  "/:id/step",
  auth("USER", "ADMIN"),
  validateRequest(PlannerValidation.addStep),
  PlannerController.addStep
);

// Complete session and create TravelPlan
router.post(
  "/:id/complete",
  auth("USER", "ADMIN"),
  validateRequest(PlannerValidation.completeSession),
  PlannerController.completeSession
);

// Get single session
router.get(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(PlannerValidation.getSession),
  PlannerController.getSession
);

// Get my sessions (with pagination)
router.get(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(PlannerValidation.getMySessions),
  PlannerController.getMySessions
);

export const PlannerRoutes = router;

