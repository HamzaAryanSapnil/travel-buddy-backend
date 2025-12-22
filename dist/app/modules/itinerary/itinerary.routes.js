"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItineraryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const itinerary_controller_1 = require("./itinerary.controller");
const itinerary_validation_1 = require("./itinerary.validation");
const optionalAuth_1 = __importDefault(require("../../middlewares/optionalAuth"));
const router = express_1.default.Router();
// Create itinerary item
router.post("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(itinerary_validation_1.ItineraryValidation.createItem), itinerary_controller_1.ItineraryController.createItem);
// Get all items for a plan (grouped by day)
// Note: For PUBLIC plans, this can be accessed without auth
router.get("/:planId", (0, optionalAuth_1.default)(), (0, validateRequest_1.default)(itinerary_validation_1.ItineraryValidation.getItems), itinerary_controller_1.ItineraryController.getPlanItems);
// Get single item
// Note: For PUBLIC plans, this can be accessed without auth
router.get("/item/:id", (0, optionalAuth_1.default)(), (0, validateRequest_1.default)(itinerary_validation_1.ItineraryValidation.getSingleItem), itinerary_controller_1.ItineraryController.getSingleItem);
// Bulk upsert (for AI Planner) - Specific route, must be before dynamic routes
router.post("/bulk", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(itinerary_validation_1.ItineraryValidation.bulkUpsert), itinerary_controller_1.ItineraryController.bulkUpsert);
// Reorder items - Specific route, MUST be before /:id route
router.patch("/reorder", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(itinerary_validation_1.ItineraryValidation.reorder), itinerary_controller_1.ItineraryController.reorderItems);
// Update item - Dynamic route, must be AFTER specific routes
router.patch("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(itinerary_validation_1.ItineraryValidation.updateItem), itinerary_controller_1.ItineraryController.updateItem);
// Delete item - Dynamic route
router.delete("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(itinerary_validation_1.ItineraryValidation.deleteItem), itinerary_controller_1.ItineraryController.deleteItem);
exports.ItineraryRoutes = router;
