import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ItineraryController } from "./itinerary.controller";
import { ItineraryValidation } from "./itinerary.validation";

const router = express.Router();

// Create itinerary item
router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(ItineraryValidation.createItem),
  ItineraryController.createItem
);

// Get all items for a plan (grouped by day)
// Note: For PUBLIC plans, this can be accessed without auth
router.get(
  "/:planId",
  validateRequest(ItineraryValidation.getItems),
  ItineraryController.getPlanItems
);

// Get single item
// Note: For PUBLIC plans, this can be accessed without auth
router.get(
  "/item/:id",
  validateRequest(ItineraryValidation.getSingleItem),
  ItineraryController.getSingleItem
);

// Update item
router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(ItineraryValidation.updateItem),
  ItineraryController.updateItem
);

// Delete item
router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(ItineraryValidation.deleteItem),
  ItineraryController.deleteItem
);

// Bulk upsert (for AI Planner)
router.post(
  "/bulk",
  auth("USER", "ADMIN"),
  validateRequest(ItineraryValidation.bulkUpsert),
  ItineraryController.bulkUpsert
);

// Reorder items
router.patch(
  "/reorder",
  auth("USER", "ADMIN"),
  validateRequest(ItineraryValidation.reorder),
  ItineraryController.reorderItems
);

export const ItineraryRoutes = router;

