"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelPlanRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const optionalAuth_1 = __importDefault(require("../../middlewares/optionalAuth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const travelPlan_controller_1 = require("./travelPlan.controller");
const travelPlan_validation_1 = require("./travelPlan.validation");
const router = express_1.default.Router();
// Public route - Get all PUBLIC travel plans (NO AUTH REQUIRED)
router.get("/public", travelPlan_controller_1.TravelPlanController.getPublicTravelPlans);
router.post("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(travelPlan_validation_1.TravelPlanValidation.createTravelPlan), travelPlan_controller_1.TravelPlanController.createTravelPlan);
router.get("/", (0, auth_1.default)("USER", "ADMIN"), travelPlan_controller_1.TravelPlanController.getMyTravelPlans);
// Public route with optional auth - Get single plan (PUBLIC plans accessible without auth)
router.get("/:id", (0, optionalAuth_1.default)(), (0, validateRequest_1.default)(travelPlan_validation_1.TravelPlanValidation.getSingleTravelPlan), travelPlan_controller_1.TravelPlanController.getSingleTravelPlan);
router.patch("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(travelPlan_validation_1.TravelPlanValidation.updateTravelPlan), travelPlan_controller_1.TravelPlanController.updateTravelPlan);
router.delete("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(travelPlan_validation_1.TravelPlanValidation.getSingleTravelPlan), travelPlan_controller_1.TravelPlanController.deleteTravelPlan);
exports.TravelPlanRoutes = router;
