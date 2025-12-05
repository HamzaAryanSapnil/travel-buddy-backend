import { z } from "zod";
import { paymentStatusEnum } from "./payment.constant";

const stringRequired = (message: string) => z.string({ error: () => message });

const getPaymentSchema = z.object({
  params: z.object({
    id: stringRequired("Payment ID is required.").uuid({
      message: "Payment ID must be a valid UUID.",
    }),
  }),
});

const getMyPaymentsSchema = z.object({
  query: z.object({
    status: z
      .enum(paymentStatusEnum as unknown as [string, ...string[]], {
        error: () => "Invalid payment status.",
      })
      .optional(),
    subscriptionId: stringRequired("Subscription ID must be a string.")
      .uuid({ message: "Subscription ID must be a valid UUID." })
      .optional(),
    currency: stringRequired("Currency must be a string.").optional(),
    startDate: stringRequired("Start date must be a string.").optional(),
    endDate: stringRequired("End date must be a string.").optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    sortBy: stringRequired("Sort by must be a string.").optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

const getPaymentsSchema = z.object({
  query: z.object({
    status: z
      .enum(paymentStatusEnum as unknown as [string, ...string[]], {
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
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    sortBy: stringRequired("Sort by must be a string.").optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

const getPaymentStatisticsSchema = z.object({
  query: z.object({
    startDate: stringRequired("Start date must be a string.").optional(),
    endDate: stringRequired("End date must be a string.").optional(),
    subscriptionId: stringRequired("Subscription ID must be a string.")
      .uuid({ message: "Subscription ID must be a valid UUID." })
      .optional(),
    currency: stringRequired("Currency must be a string.").optional(),
  }),
});

const getPaymentSummarySchema = z.object({
  query: z.object({
    subscriptionId: stringRequired("Subscription ID must be a string.")
      .uuid({ message: "Subscription ID must be a valid UUID." })
      .optional(),
  }),
});

export const PaymentValidation = {
  getPayment: getPaymentSchema,
  getMyPayments: getMyPaymentsSchema,
  getPayments: getPaymentsSchema,
  getPaymentStatistics: getPaymentStatisticsSchema,
  getPaymentSummary: getPaymentSummarySchema,
};

