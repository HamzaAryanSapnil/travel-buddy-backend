"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const payment_controller_1 = require("./payment.controller");
const payment_validation_1 = require("./payment.validation");
const router = express_1.default.Router();
// Get single payment
router.get("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(payment_validation_1.PaymentValidation.getPayment), payment_controller_1.PaymentController.getPayment);
// Get user's own payment history
router.get("/my-payments", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(payment_validation_1.PaymentValidation.getMyPayments), payment_controller_1.PaymentController.getMyPayments);
// Get payment summary
router.get("/summary", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(payment_validation_1.PaymentValidation.getPaymentSummary), payment_controller_1.PaymentController.getPaymentSummary);
// Get all payments (admin only)
router.get("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(payment_validation_1.PaymentValidation.getPayments), payment_controller_1.PaymentController.getPayments);
// Get payment statistics (admin only)
router.get("/statistics", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(payment_validation_1.PaymentValidation.getPaymentStatistics), payment_controller_1.PaymentController.getPaymentStatistics);
exports.PaymentRoutes = router;
