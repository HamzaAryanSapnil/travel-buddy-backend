import { z } from "zod";
import {
  subscriptionStatusEnum,
  subscriptionPlanTypeEnum,
} from "./subscription.constant";

const stringRequired = (message: string) => z.string({ error: () => message });

const createSubscriptionSchema = z.object({
  body: z.object({
    planType: z.enum(subscriptionPlanTypeEnum as unknown as [string, ...string[]], {
      error: () => "Invalid plan type. Must be MONTHLY or YEARLY.",
    }),
  }),
});

const getSubscriptionSchema = z.object({
  params: z.object({
    id: stringRequired("Subscription ID is required.").uuid({
      message: "Subscription ID must be a valid UUID.",
    }),
  }),
});

const getSubscriptionsSchema = z.object({
  query: z.object({
    status: z
      .enum(subscriptionStatusEnum as unknown as [string, ...string[]], {
        error: () => "Invalid status.",
      })
      .optional(),
    planType: z
      .enum(subscriptionPlanTypeEnum as unknown as [string, ...string[]], {
        error: () => "Invalid plan type.",
      })
      .optional(),
    planName: stringRequired("Plan name must be a string.").optional(),
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

const updateSubscriptionSchema = z.object({
  params: z.object({
    id: stringRequired("Subscription ID is required.").uuid({
      message: "Subscription ID must be a valid UUID.",
    }),
  }),
  body: z.object({
    cancelAtPeriodEnd: z.boolean().optional(),
  }),
});

const cancelSubscriptionSchema = z.object({
  params: z.object({
    id: stringRequired("Subscription ID is required.").uuid({
      message: "Subscription ID must be a valid UUID.",
    }),
  }),
});

const getSubscriptionStatusSchema = z.object({
  // No params or query needed - uses auth user
});

const stripeWebhookSchema = z.object({
  headers: z.object({
    "stripe-signature": stringRequired("Stripe signature is required."),
  }),
  // Body will be raw buffer, validated in service
});

export const SubscriptionValidation = {
  createSubscription: createSubscriptionSchema,
  getSubscription: getSubscriptionSchema,
  getSubscriptions: getSubscriptionsSchema,
  updateSubscription: updateSubscriptionSchema,
  cancelSubscription: cancelSubscriptionSchema,
  getSubscriptionStatus: getSubscriptionStatusSchema,
  stripeWebhook: stripeWebhookSchema,
};

