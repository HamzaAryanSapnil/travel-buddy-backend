import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ExpenseService } from "./expense.service";
import { TAuthUser } from "./expense.interface";

const createExpense = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  console.log("Req.body from expense controller '/expense' createExpense: ", req.body);
  const result = await ExpenseService.createExpense(authUser, req.body);


  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Expense created successfully.",
    data: result,
  });
});

const getExpense = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ExpenseService.getExpense(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Expense retrieved successfully.",
    data: result,
  });
});

const getExpenses = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ExpenseService.getExpenses(authUser, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Expenses retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const updateExpense = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ExpenseService.updateExpense(
    authUser,
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Expense updated successfully.",
    data: result,
  });
});

const deleteExpense = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  await ExpenseService.deleteExpense(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Expense deleted successfully.",
    data: null,
  });
});

const settleExpense = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ExpenseService.settleExpense(
    authUser,
    req.params.id,
    req.params.participantId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Expense participant settled successfully.",
    data: result,
  });
});

const getExpenseSummary = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await ExpenseService.getExpenseSummary(
    authUser,
    req.query.planId as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Expense summary retrieved successfully.",
    data: result,
  });
});

export const ExpenseController = {
  createExpense,
  getExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  settleExpense,
  getExpenseSummary,
};

