"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const expense_controller_1 = require("./expense.controller");
const expense_validation_1 = require("./expense.validation");
const router = express_1.default.Router();
// Create expense
router.post("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(expense_validation_1.ExpenseValidation.createExpense), expense_controller_1.ExpenseController.createExpense);
// Get expenses (with pagination, filters)
router.get("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(expense_validation_1.ExpenseValidation.getExpenses), expense_controller_1.ExpenseController.getExpenses);
// Get single expense
router.get("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(expense_validation_1.ExpenseValidation.getExpense), expense_controller_1.ExpenseController.getExpense);
// Update expense
router.patch("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(expense_validation_1.ExpenseValidation.updateExpense), expense_controller_1.ExpenseController.updateExpense);
// Delete expense
router.delete("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(expense_validation_1.ExpenseValidation.deleteExpense), expense_controller_1.ExpenseController.deleteExpense);
// Settle expense participant
router.patch("/:id/settle/:participantId", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(expense_validation_1.ExpenseValidation.settleExpense), expense_controller_1.ExpenseController.settleExpense);
// Get expense summary for plan
router.get("/summary", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(expense_validation_1.ExpenseValidation.getExpenseSummary), expense_controller_1.ExpenseController.getExpenseSummary);
exports.ExpenseRoutes = router;
