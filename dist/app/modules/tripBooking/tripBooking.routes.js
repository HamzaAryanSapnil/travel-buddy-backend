"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripBookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const tripBooking_controller_1 = require("./tripBooking.controller");
const tripBooking_validation_1 = require("./tripBooking.validation");
const router = express_1.default.Router();
// Send join request
router.post("/request", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(tripBooking_validation_1.TripBookingValidation.createBooking), tripBooking_controller_1.TripBookingController.createBookingRequest);
// Get my outgoing requests
router.get("/my-requests", (0, auth_1.default)("USER", "ADMIN"), tripBooking_controller_1.TripBookingController.getMyRequests);
// Get incoming requests for a plan (owner/admin only)
router.get("/plan/:planId", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(tripBooking_validation_1.TripBookingValidation.getBookingsByPlan), tripBooking_controller_1.TripBookingController.getBookingsByPlan);
// Respond to request (approve/reject)
router.patch("/:bookingId/respond", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(tripBooking_validation_1.TripBookingValidation.respondBooking), tripBooking_controller_1.TripBookingController.respondToBooking);
// Cancel own request
router.delete("/:bookingId", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(tripBooking_validation_1.TripBookingValidation.cancelBooking), tripBooking_controller_1.TripBookingController.cancelBookingRequest);
exports.TripBookingRoutes = router;
