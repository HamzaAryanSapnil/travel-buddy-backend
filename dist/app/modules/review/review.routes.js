"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const review_controller_1 = require("./review.controller");
const review_validation_1 = require("./review.validation");
const router = express_1.default.Router();
// Create review
router.post("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.createReview), review_controller_1.ReviewController.createReview);
// Get review statistics
router.get("/statistics", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.getReviewStatistics), review_controller_1.ReviewController.getReviewStatistics);
// Get single review
router.get("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.getReview), review_controller_1.ReviewController.getReview);
// Get reviews list
router.get("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.getReviews), review_controller_1.ReviewController.getReviews);
// Update review
router.patch("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.updateReview), review_controller_1.ReviewController.updateReview);
// Delete review
router.delete("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.deleteReview), review_controller_1.ReviewController.deleteReview);
exports.ReviewRoutes = router;
