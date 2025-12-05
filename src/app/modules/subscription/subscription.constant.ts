import { SubscriptionStatus } from "@prisma/client";

export const subscriptionFilterableFields = [
  "status",
  "planType",
  "planName",
];

export const subscriptionSearchableFields: string[] = []; // No searchable fields

export const subscriptionStatusEnum = [
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
] as const;

export const subscriptionPlanTypeEnum = ["MONTHLY", "YEARLY"] as const;

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: "Monthly Plan",
    price: 9.99,
    interval: "month",
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || "", // Set in .env
  },
  YEARLY: {
    name: "Yearly Plan",
    price: 99.99,
    interval: "year",
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || "", // Set in .env
  },
} as const;

// Re-export enums from Prisma
export { SubscriptionStatus };

