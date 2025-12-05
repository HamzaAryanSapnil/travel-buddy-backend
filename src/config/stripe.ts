import Stripe from "stripe";
import config from "./index";

if (!config.stripe.secret_key) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

// Initialize Stripe client
export const stripe = new Stripe(config.stripe.secret_key, {
  apiVersion: "2025-11-17.clover", // Latest Stripe API version
  typescript: true,
});

// Export Stripe types for use in other modules
export type { Stripe };

// Helper to get webhook secret
export const getWebhookSecret = (): string => {
  if (!config.stripe.webhook_secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not defined in environment variables");
  }
  return config.stripe.webhook_secret;
};

// Helper to get publishable key (for frontend reference)
export const getPublishableKey = (): string => {
  if (!config.stripe.publishable_key) {
    throw new Error("STRIPE_PUBLISHABLE_KEY is not defined in environment variables");
  }
  return config.stripe.publishable_key;
};

