"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionValidation = void 0;
const zod_1 = require("zod");
const subscription_constant_1 = require("./subscription.constant");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
const createSubscriptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        planType: zod_1.z.enum(subscription_constant_1.subscriptionPlanTypeEnum, {
            error: () => "Invalid plan type. Must be MONTHLY or YEARLY.",
        }),
    }),
});
const getSubscriptionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Subscription ID is required.").uuid({
            message: "Subscription ID must be a valid UUID.",
        }),
    }),
});
const getSubscriptionsSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z
            .enum(subscription_constant_1.subscriptionStatusEnum, {
            error: () => "Invalid status.",
        })
            .optional(),
        planType: zod_1.z
            .enum(subscription_constant_1.subscriptionPlanTypeEnum, {
            error: () => "Invalid plan type.",
        })
            .optional(),
        planName: stringRequired("Plan name must be a string.").optional(),
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
const updateSubscriptionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Subscription ID is required.").uuid({
            message: "Subscription ID must be a valid UUID.",
        }),
    }),
    body: zod_1.z.object({
        cancelAtPeriodEnd: zod_1.z.boolean().optional(),
    }),
});
const cancelSubscriptionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Subscription ID is required.").uuid({
            message: "Subscription ID must be a valid UUID.",
        }),
    }),
});
const getSubscriptionStatusSchema = zod_1.z.object({
// No params or query needed - uses auth user
});
const stripeWebhookSchema = zod_1.z.object({
    headers: zod_1.z.object({
        "stripe-signature": stringRequired("Stripe signature is required."),
    }),
    // Body will be raw buffer, validated in service
});
const syncSubscriptionSchema = zod_1.z.object({
    params: zod_1.z.object({
        stripeSubscriptionId: stringRequired("Stripe subscription ID is required."),
    }),
});
exports.SubscriptionValidation = {
    createSubscription: createSubscriptionSchema,
    getSubscription: getSubscriptionSchema,
    getSubscriptions: getSubscriptionsSchema,
    updateSubscription: updateSubscriptionSchema,
    cancelSubscription: cancelSubscriptionSchema,
    getSubscriptionStatus: getSubscriptionStatusSchema,
    stripeWebhook: stripeWebhookSchema,
    syncSubscription: syncSubscriptionSchema,
};
