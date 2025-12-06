"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidation = void 0;
const zod_1 = require("zod");
const payment_constant_1 = require("./payment.constant");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
const getPaymentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Payment ID is required.").uuid({
            message: "Payment ID must be a valid UUID.",
        }),
    }),
});
const getMyPaymentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z
            .enum(payment_constant_1.paymentStatusEnum, {
            error: () => "Invalid payment status.",
        })
            .optional(),
        subscriptionId: stringRequired("Subscription ID must be a string.")
            .uuid({ message: "Subscription ID must be a valid UUID." })
            .optional(),
        currency: stringRequired("Currency must be a string.").optional(),
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
const getPaymentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z
            .enum(payment_constant_1.paymentStatusEnum, {
            error: () => "Invalid payment status.",
        })
            .optional(),
        userId: stringRequired("User ID must be a string.")
            .uuid({ message: "User ID must be a valid UUID." })
            .optional(),
        subscriptionId: stringRequired("Subscription ID must be a string.")
            .uuid({ message: "Subscription ID must be a valid UUID." })
            .optional(),
        currency: stringRequired("Currency must be a string.").optional(),
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
const getPaymentStatisticsSchema = zod_1.z.object({
    query: zod_1.z.object({
        startDate: stringRequired("Start date must be a string.").optional(),
        endDate: stringRequired("End date must be a string.").optional(),
        subscriptionId: stringRequired("Subscription ID must be a string.")
            .uuid({ message: "Subscription ID must be a valid UUID." })
            .optional(),
        currency: stringRequired("Currency must be a string.").optional(),
    }),
});
const getPaymentSummarySchema = zod_1.z.object({
    query: zod_1.z.object({
        subscriptionId: stringRequired("Subscription ID must be a string.")
            .uuid({ message: "Subscription ID must be a valid UUID." })
            .optional(),
    }),
});
exports.PaymentValidation = {
    getPayment: getPaymentSchema,
    getMyPayments: getMyPaymentsSchema,
    getPayments: getPaymentsSchema,
    getPaymentStatistics: getPaymentStatisticsSchema,
    getPaymentSummary: getPaymentSummarySchema,
};
