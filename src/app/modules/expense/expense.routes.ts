import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ExpenseController } from "./expense.controller";
import { ExpenseValidation } from "./expense.validation";

const router = express.Router();

// Create expense
router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(ExpenseValidation.createExpense),
  ExpenseController.createExpense
);

// Get expenses (with pagination, filters)
router.get(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(ExpenseValidation.getExpenses),
  ExpenseController.getExpenses
);

// Get single expense
router.get(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(ExpenseValidation.getExpense),
  ExpenseController.getExpense
);

// Update expense
router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(ExpenseValidation.updateExpense),
  ExpenseController.updateExpense
);

// Delete expense
router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(ExpenseValidation.deleteExpense),
  ExpenseController.deleteExpense
);

// Settle expense participant
router.patch(
  "/:id/settle/:participantId",
  auth("USER", "ADMIN"),
  validateRequest(ExpenseValidation.settleExpense),
  ExpenseController.settleExpense
);

// Get expense summary for plan
router.get(
  "/summary",
  auth("USER", "ADMIN"),
  validateRequest(ExpenseValidation.getExpenseSummary),
  ExpenseController.getExpenseSummary
);

export const ExpenseRoutes = router;

