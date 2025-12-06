"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const planner_controller_1 = require("./planner.controller");
const planner_validation_1 = require("./planner.validation");
const router = express_1.default.Router();
// Create planner session
router.post("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(planner_validation_1.PlannerValidation.createSession), planner_controller_1.PlannerController.createSession);
// Add step to session
router.post("/:id/step", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(planner_validation_1.PlannerValidation.addStep), planner_controller_1.PlannerController.addStep);
// Complete session and create TravelPlan
router.post("/:id/complete", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(planner_validation_1.PlannerValidation.completeSession), planner_controller_1.PlannerController.completeSession);
// Get single session
router.get("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(planner_validation_1.PlannerValidation.getSession), planner_controller_1.PlannerController.getSession);
// Get my sessions (with pagination)
router.get("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(planner_validation_1.PlannerValidation.getMySessions), planner_controller_1.PlannerController.getMySessions);
exports.PlannerRoutes = router;
