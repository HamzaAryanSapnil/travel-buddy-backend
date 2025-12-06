"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseValidation = void 0;
const zod_1 = require("zod");
const expense_constant_1 = require("./expense.constant");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
const participantSchema = zod_1.z.object({
    userId: stringRequired("User ID is required.").uuid({ message: "User ID must be a valid UUID." }),
    amount: zod_1.z.number().positive({ message: "Amount must be positive." }).optional(),
    percentage: zod_1.z.number().min(0, { message: "Percentage must be >= 0." }).max(100, { message: "Percentage must be <= 100." }).optional(),
});
const createExpenseSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        planId: stringRequired("Plan ID is required.").uuid({ message: "Plan ID must be a valid UUID." }),
        payerId: stringRequired("Payer ID is required.").uuid({ message: "Payer ID must be a valid UUID." }),
        amount: zod_1.z.number().positive({ message: "Amount must be a positive number." }),
        currency: stringRequired("Currency must be a string.").max(10, { message: "Currency code cannot exceed 10 characters." }).optional(),
        category: zod_1.z.enum(expense_constant_1.expenseCategoryEnum, {
            error: () => "Invalid category. Must be FOOD, TRANSPORT, ACCOMMODATION, ACTIVITY, SHOPPING, or OTHER.",
        }),
        description: stringRequired("Description must be a string.")
            .max(1000, { message: "Description cannot exceed 1000 characters." })
            .optional(),
        expenseDate: stringRequired("Expense date is required."),
        splitType: zod_1.z.enum(expense_constant_1.expenseSplitTypeEnum, {
            error: () => "Invalid split type. Must be EQUAL, CUSTOM, or PERCENTAGE.",
        }),
        locationId: stringRequired("Location ID must be a string.")
            .uuid({ message: "Location ID must be a valid UUID." })
            .optional(),
        participants: zod_1.z.array(participantSchema).optional(),
    })
        .refine((data) => {
        if (data.splitType === "CUSTOM") {
            if (!data.participants || data.participants.length === 0) {
                return false;
            }
            const totalAmount = data.participants.reduce((sum, p) => sum + (p.amount || 0), 0);
            return Math.abs(totalAmount - data.amount) < 0.01; // Allow small floating point differences
        }
        return true;
    }, {
        message: "For CUSTOM split, participants array is required and sum of amounts must equal total amount.",
        path: ["participants"],
    })
        .refine((data) => {
        if (data.splitType === "PERCENTAGE") {
            if (!data.participants || data.participants.length === 0) {
                return false;
            }
            const totalPercentage = data.participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
            return Math.abs(totalPercentage - 100) < 0.01; // Allow small floating point differences
        }
        return true;
    }, {
        message: "For PERCENTAGE split, participants array is required and sum of percentages must equal 100.",
        path: ["participants"],
    })
        .refine((data) => {
        var _a, _b;
        if (data.splitType === "CUSTOM") {
            return (_a = data.participants) === null || _a === void 0 ? void 0 : _a.every((p) => p.amount !== undefined && p.percentage === undefined);
        }
        if (data.splitType === "PERCENTAGE") {
            return (_b = data.participants) === null || _b === void 0 ? void 0 : _b.every((p) => p.percentage !== undefined && p.amount === undefined);
        }
        return true;
    }, {
        message: "For CUSTOM split, provide amount only. For PERCENTAGE split, provide percentage only.",
        path: ["participants"],
    }),
});
const updateExpenseSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Expense ID is required."),
    }),
    body: zod_1.z.object({
        payerId: stringRequired("Payer ID must be a string.")
            .uuid({ message: "Payer ID must be a valid UUID." })
            .optional(),
        amount: zod_1.z.number().positive({ message: "Amount must be a positive number." }).optional(),
        currency: stringRequired("Currency must be a string.").max(10, { message: "Currency code cannot exceed 10 characters." }).optional(),
        category: zod_1.z
            .enum(expense_constant_1.expenseCategoryEnum, {
            error: () => "Invalid category.",
        })
            .optional(),
        description: stringRequired("Description must be a string.")
            .max(1000, { message: "Description cannot exceed 1000 characters." })
            .optional(),
        expenseDate: stringRequired("Expense date must be a string.").optional(),
        locationId: stringRequired("Location ID must be a string.")
            .uuid({ message: "Location ID must be a valid UUID." })
            .optional(),
    }),
});
const getExpenseSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Expense ID is required."),
    }),
});
const getExpensesSchema = zod_1.z.object({
    query: zod_1.z.object({
        searchTerm: stringRequired("Search term must be a string.").optional(),
        category: zod_1.z
            .enum(expense_constant_1.expenseCategoryEnum, {
            error: () => "Invalid category.",
        })
            .optional(),
        planId: stringRequired("Plan ID must be a string.").optional(),
        payerId: stringRequired("Payer ID must be a string.").optional(),
        splitType: zod_1.z
            .enum(expense_constant_1.expenseSplitTypeEnum, {
            error: () => "Invalid split type.",
        })
            .optional(),
        startDate: stringRequired("Start date must be a string.").optional(),
        endDate: stringRequired("End date must be a string.").optional(),
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        sortBy: stringRequired("Sort by must be a string.").optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
});
const deleteExpenseSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Expense ID is required."),
    }),
});
const settleExpenseSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Expense ID is required."),
        participantId: stringRequired("Participant ID is required."),
    }),
});
const getExpenseSummarySchema = zod_1.z.object({
    query: zod_1.z.object({
        planId: stringRequired("Plan ID is required."),
    }),
});
exports.ExpenseValidation = {
    createExpense: createExpenseSchema,
    updateExpense: updateExpenseSchema,
    getExpense: getExpenseSchema,
    getExpenses: getExpensesSchema,
    deleteExpense: deleteExpenseSchema,
    settleExpense: settleExpenseSchema,
    getExpenseSummary: getExpenseSummarySchema,
};
