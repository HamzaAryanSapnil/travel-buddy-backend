import { SubscriptionStatus, Prisma, Role, NotificationType } from "@prisma/client";
import Stripe from "stripe";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import {
  paginationHelper,
  IPaginationOptions,
} from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import pick from "../../shared/pick";
import { stripe, getWebhookSecret } from "../../../config/stripe";
import { NotificationService } from "../notification/notification.service";
import {
  subscriptionFilterableFields,
  SUBSCRIPTION_PLANS,
} from "./subscription.constant";
import config from "../../../config";
import {
  TAuthUser,
  TSubscriptionCreatePayload,
  TSubscriptionUpdatePayload,
  TSubscriptionQuery,
  TSubscriptionResponse,
  TSubscriptionListResponse,
  TSubscriptionStatusResponse,
  TCheckoutSessionResponse,
} from "./subscription.interface";

/**
 * Helper: Get or create Stripe customer
 * @param userId - User ID
 * @param email - User email
 * @returns Stripe customer ID
 */
const getOrCreateStripeCustomer = async (
  userId: string,
  email: string
): Promise<string> => {
  // Check if user already has a Stripe customer ID stored in metadata or subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
    },
    select: {
      metadata: true,
    },
  });

  // Try to extract customer ID from metadata
  if (existingSubscription?.metadata) {
    const metadata = existingSubscription.metadata as any;
    if (metadata.stripeCustomerId) {
      // Verify customer still exists in Stripe
      try {
        await stripe.customers.retrieve(metadata.stripeCustomerId);
        return metadata.stripeCustomerId;
      } catch (error) {
        // Customer doesn't exist, create new one
      }
    }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  return customer.id;
};

/**
 * Calculate expiration date based on plan type
 * @param planType - MONTHLY or YEARLY
 * @param startDate - Start date
 * @returns Expiration date
 */
const calculateExpirationDate = (
  planType: "MONTHLY" | "YEARLY",
  startDate: Date
): Date => {
  const expiration = new Date(startDate);
  if (planType === "MONTHLY") {
    expiration.setMonth(expiration.getMonth() + 1);
  } else {
    expiration.setFullYear(expiration.getFullYear() + 1);
  }
  return expiration;
};

/**
 * Calculate days remaining until expiration
 * @param expiresAt - Expiration date
 * @returns Days remaining or null if no expiration
 */
const calculateDaysRemaining = (expiresAt: Date | null): number | null => {
  if (!expiresAt) return null;
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

/**
 * Get current subscription status for authenticated user
 * @param authUser - Authenticated user
 * @returns Subscription status with details
 */
const getSubscriptionStatus = async (
  authUser: TAuthUser
): Promise<TSubscriptionStatusResponse> => {
  const now = new Date();

  // Get active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: authUser.userId,
      status: SubscriptionStatus.ACTIVE,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    },
    select: {
      id: true,
      planName: true,
      planType: true,
      status: true,
      startedAt: true,
      expiresAt: true,
      cancelAtPeriodEnd: true,
    },
    orderBy: {
      startedAt: "desc",
    },
  });

  if (!subscription) {
    return {
      hasSubscription: false,
      subscription: null,
    };
  }

  return {
    hasSubscription: true,
    subscription: {
      id: subscription.id,
      planName: subscription.planName,
      planType: subscription.planType,
      status: subscription.status,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      daysRemaining: calculateDaysRemaining(subscription.expiresAt),
    },
  };
};

/**
 * Get single subscription by ID
 * @param authUser - Authenticated user
 * @param subscriptionId - Subscription ID
 * @returns Subscription details
 */
const getSubscription = async (
  authUser: TAuthUser,
  subscriptionId: string
): Promise<TSubscriptionResponse> => {
  // Load subscription with user
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
    },
  }) as any;

  if (!subscription) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Subscription not found."
    );
  }

  // Verify user owns subscription OR is admin
  if (subscription.userId !== authUser.userId && authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this subscription."
    );
  }

  return {
    id: subscription.id,
    userId: subscription.userId,
    planName: subscription.planName,
    planType: subscription.planType,
    status: subscription.status,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    startedAt: subscription.startedAt,
    expiresAt: subscription.expiresAt,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    metadata: subscription.metadata,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
    user: subscription.user,
  };
};

/**
 * Get all subscriptions (admin only) with pagination and filters
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Paginated subscriptions
 */
const getSubscriptions = async (
  authUser: TAuthUser,
  query: TSubscriptionQuery
): Promise<TSubscriptionListResponse> => {
  // Admin only
  if (authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only admins can view all subscriptions."
    );
  }

  // Pagination
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy || "startedAt",
      sortOrder: query.sortOrder || "desc",
    } as IPaginationOptions);

  // Build where clause
  const andConditions: Prisma.SubscriptionWhereInput[] = [];

  // Filter by status
  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  // Filter by planType
  if (query.planType) {
    andConditions.push({
      planType: query.planType,
    });
  }

  // Filter by planName
  if (query.planName) {
    andConditions.push({
      planName: {
        contains: query.planName,
        mode: "insensitive",
      },
    });
  }

  const where: Prisma.SubscriptionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Get subscriptions and total count
  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    }),
    prisma.subscription.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data: subscriptions.map((sub: any) => ({
      id: sub.id,
      userId: sub.userId,
      planName: sub.planName,
      planType: sub.planType,
      status: sub.status,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      metadata: sub.metadata,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      user: sub.user,
    })),
  };
};

/**
 * Create a new subscription checkout session
 * @param authUser - Authenticated user
 * @param payload - Subscription creation payload
 * @returns Checkout session URL
 */
const createSubscription = async (
  authUser: TAuthUser,
  payload: TSubscriptionCreatePayload
): Promise<TCheckoutSessionResponse> => {
  // Check if user already has an active subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId: authUser.userId,
      status: SubscriptionStatus.ACTIVE,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });

  if (existingSubscription) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You already have an active subscription. Please cancel your current subscription before creating a new one."
    );
  }

  // Validate planType
  if (!["MONTHLY", "YEARLY"].includes(payload.planType)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid plan type. Must be MONTHLY or YEARLY."
    );
  }

  // Get plan configuration
  const planConfig = SUBSCRIPTION_PLANS[payload.planType];
  if (!planConfig.priceId) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Stripe price ID not configured for ${payload.planType} plan. Please contact support.`
    );
  }

  // Get or create Stripe customer
  const stripeCustomerId = await getOrCreateStripeCustomer(
    authUser.userId,
    authUser.email
  );

  // Get frontend URL for success/cancel redirects
  const frontendUrl = config.frontend_url || "http://localhost:3000";
  const successUrl = `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${frontendUrl}/subscription/cancel`;

  // Create Stripe Checkout Session
  let checkoutSession: Stripe.Checkout.Session;
  try {
    checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: authUser.userId,
        planType: payload.planType,
      },
      subscription_data: {
        metadata: {
          userId: authUser.userId,
          planType: payload.planType,
        },
      },
      allow_promotion_codes: true,
    });
  } catch (error: any) {
    console.error("Stripe checkout session creation error:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to create checkout session: ${error.message || "Unknown error"}`
    );
  }

  if (!checkoutSession.url) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to generate checkout session URL"
    );
  }

  return {
    sessionId: checkoutSession.id,
    url: checkoutSession.url,
    customerId: stripeCustomerId,
  };
};

/**
 * Update subscription (mainly for cancelAtPeriodEnd flag)
 * @param authUser - Authenticated user
 * @param subscriptionId - Subscription ID
 * @param payload - Update payload
 * @returns Updated subscription
 */
const updateSubscription = async (
  authUser: TAuthUser,
  subscriptionId: string,
  payload: TSubscriptionUpdatePayload
): Promise<TSubscriptionResponse> => {
  // Load subscription
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
    },
  });

  if (!subscription) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Subscription not found."
    );
  }

  // Verify user owns subscription OR is admin
  if (subscription.userId !== authUser.userId && authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to update this subscription."
    );
  }

  // Only allow updating cancelAtPeriodEnd for now
  if (payload.cancelAtPeriodEnd === undefined) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Only cancelAtPeriodEnd can be updated."
    );
  }

  // Update Stripe subscription if stripeSubscriptionId exists
  if (subscription.stripeSubscriptionId) {
    try {
      if (payload.cancelAtPeriodEnd) {
        // Cancel at period end
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        // Reactivate subscription (remove cancel_at_period_end)
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: false,
        });
      }
    } catch (error: any) {
      console.error("Stripe subscription update error:", error);
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Failed to update subscription: ${error.message || "Unknown error"}`
      );
    }
  }

  // Update database
  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
    },
  });

  // Notify user (SUBSCRIPTION_UPDATED)
  NotificationService.notifyUser(
    subscription.userId,
    {
      type: NotificationType.SUBSCRIPTION_UPDATED,
      title: "Subscription updated",
      message: payload.cancelAtPeriodEnd
        ? "Your subscription will be cancelled at the end of the current period."
        : "Your subscription has been reactivated.",
      data: {
        subscriptionId: updated.id,
        cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
      },
    }
  ).catch((error) => {
    console.error("Failed to send notification for subscription update:", error);
  });

  const sub = updated as any;
  return {
    id: sub.id,
    userId: sub.userId,
    planName: sub.planName,
    planType: sub.planType,
    status: sub.status,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    startedAt: sub.startedAt,
    expiresAt: sub.expiresAt,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    metadata: sub.metadata,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
    user: sub.user,
  };
};

/**
 * Cancel subscription immediately
 * @param authUser - Authenticated user
 * @param subscriptionId - Subscription ID
 * @returns Success message
 */
const cancelSubscription = async (
  authUser: TAuthUser,
  subscriptionId: string
): Promise<{ message: string }> => {
  // Load subscription
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Subscription not found."
    );
  }

  // Verify user owns subscription OR is admin
  if (subscription.userId !== authUser.userId && authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to cancel this subscription."
    );
  }

  // Check if already cancelled
  if (subscription.status === SubscriptionStatus.CANCELLED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Subscription is already cancelled."
    );
  }

  // Cancel in Stripe if stripeSubscriptionId exists
  if (subscription.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } catch (error: any) {
      console.error("Stripe subscription cancellation error:", error);
      // Continue with database update even if Stripe fails
      // (webhook will sync later)
    }
  }

  // Update database - mark as CANCELLED
  const now = new Date();
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: SubscriptionStatus.CANCELLED,
      expiresAt: subscription.expiresAt && subscription.expiresAt > now
        ? subscription.expiresAt
        : now, // Keep current period end or set to now
      cancelAtPeriodEnd: false, // Already cancelled
    },
  });

  // Notify user (SUBSCRIPTION_CANCELLED)
  NotificationService.notifyUser(
    subscription.userId,
    {
      type: NotificationType.SUBSCRIPTION_CANCELLED,
      title: "Subscription cancelled",
      message: "Your subscription has been cancelled. You will continue to have access until the end of your current billing period.",
      data: {
        subscriptionId,
      },
    }
  ).catch((error) => {
    console.error("Failed to send notification for subscription cancellation:", error);
  });

  return {
    message: "Subscription cancelled successfully.",
  };
};

/**
 * Handle Stripe webhook events
 * @param rawBody - Raw request body (Buffer)
 * @param signature - Stripe signature from headers
 * @returns Success message
 */
const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string
): Promise<{ received: boolean }> => {
  const webhookSecret = getWebhookSecret();
  let event: Stripe.Event;

  console.log("🔔 Webhook received - Verifying signature...");

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
    console.log(`✅ Webhook verified - Event Type: ${event.type}, Event ID: ${event.id}`);
  } catch (error: any) {
    console.error("❌ Webhook signature verification failed:", error.message);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed: ${error.message}`
    );
  }

  // Handle different event types
  try {
    console.log(`📥 Processing webhook event: ${event.type}`);
    const startTime = Date.now();

    switch (event.type) {
      case "customer.subscription.created":
        console.log("🆕 Handling subscription.created event...");
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        console.log("✅ Subscription created successfully");
        break;

      case "customer.subscription.updated":
        console.log("🔄 Handling subscription.updated event...");
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        console.log("✅ Subscription updated successfully");
        break;

      case "customer.subscription.deleted":
        console.log("🗑️ Handling subscription.deleted event...");
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        console.log("✅ Subscription deleted successfully");
        break;

      case "invoice.payment_succeeded":
        console.log("💳 Handling invoice.payment_succeeded event...");
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        console.log("✅ Payment processed successfully");
        break;

      case "invoice.payment_failed":
        console.log("❌ Handling invoice.payment_failed event...");
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        console.log("✅ Payment failure processed successfully");
        break;

      case "checkout.session.completed":
        console.log("✅ Handling checkout.session.completed event...");
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        console.log("✅ Checkout completed processed successfully");
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Webhook event ${event.type} processed in ${duration}ms`);

    return { received: true };
  } catch (error: any) {
    console.error(`❌ Error handling webhook event ${event.type}:`, {
      error: error.message,
      stack: error.stack,
      eventId: event.id,
      eventType: event.type,
    });
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to process webhook: ${error.message}`
    );
  }
};

/**
 * Handle customer.subscription.created event
 */
const handleSubscriptionCreated = async (
  stripeSubscription: Stripe.Subscription
): Promise<void> => {
  console.log(`🆕 Processing subscription.created for: ${stripeSubscription.id}`);
  const userId = stripeSubscription.metadata?.userId;
  if (!userId) {
    console.warn("⚠️ Subscription created without userId in metadata:", stripeSubscription.id);
    return;
  }

  console.log(`👤 User ID: ${userId}`);

  // Check if subscription already exists
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (existing) {
    console.log(`✅ Subscription already exists in database: ${stripeSubscription.id}`);
    return;
  }

  // Get plan type from metadata or determine from price
  const planType = stripeSubscription.metadata?.planType || "MONTHLY";
  const planConfig = SUBSCRIPTION_PLANS[planType as "MONTHLY" | "YEARLY"] || SUBSCRIPTION_PLANS.MONTHLY;

  // Calculate dates
  const startedAt = new Date((stripeSubscription as any).current_period_start * 1000);
  const expiresAt = new Date((stripeSubscription as any).current_period_end * 1000);

  // Create subscription in database
  console.log(`💾 Creating subscription in database...`);
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planName: planConfig.name,
      planType: planType as string,
      status: stripeSubscription.status === "active" ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PAST_DUE,
      stripeSubscriptionId: stripeSubscription.id,
      startedAt,
      expiresAt,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
      metadata: {
        stripeCustomerId: stripeSubscription.customer as string,
        planType,
      } as Prisma.InputJsonValue,
    },
  });
  console.log(`✅ Subscription created in database: ${subscription.id}`);

  // Update any payments that were created without subscriptionId
  // This handles the case when invoice.payment_succeeded arrives before customer.subscription.created
  try {
    // First, try to update payments with userId and pendingSubscriptionId
    const pendingPayments = await prisma.paymentTransaction.findMany({
      where: {
        OR: [
          { userId, subscriptionId: null },
          { userId: null, subscriptionId: null }, // Also check null userId payments
        ],
      },
    });

    let updatedCount = 0;
    for (const payment of pendingPayments) {
      const gatewayData = payment.gatewayData as any;
      if (gatewayData?.pendingSubscriptionId === stripeSubscription.id) {
        await prisma.paymentTransaction.update({
          where: { id: payment.id },
          data: {
            subscriptionId: subscription.id,
            userId: payment.userId || userId, // Update userId if it was null
          },
        });
        updatedCount++;
        console.log(`Updated payment ${payment.id} with subscription ID:`, subscription.id);
      }
    }

    if (updatedCount > 0) {
      console.log(`Updated ${updatedCount} payment(s) with subscription ID:`, subscription.id);
    }
  } catch (error) {
    console.error("Error updating pending payments:", error);
  }

  // Notify user (SUBSCRIPTION_CREATED)
  NotificationService.notifyUser(
    userId,
    {
      type: NotificationType.SUBSCRIPTION_CREATED,
      title: "Subscription created successfully",
      message: `Your ${planConfig.name} subscription has been activated. You now have unlimited AI access!`,
      data: {
        subscriptionId: subscription.id,
        planType: planType,
        expiresAt: expiresAt.toISOString(),
      },
    }
  ).catch((error) => {
    console.error("Failed to send notification for subscription creation:", error);
  });
};

/**
 * Handle customer.subscription.updated event
 */
const handleSubscriptionUpdated = async (
  stripeSubscription: Stripe.Subscription
): Promise<void> => {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) {
    console.warn("Subscription not found for update:", stripeSubscription.id);
    return;
  }

  // Map Stripe status to our status
  let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
  if (stripeSubscription.status === "past_due") {
    status = SubscriptionStatus.PAST_DUE;
  } else if (stripeSubscription.status === "canceled" || stripeSubscription.status === "unpaid") {
    status = SubscriptionStatus.CANCELLED;
  } else if (stripeSubscription.status === "incomplete_expired") {
    status = SubscriptionStatus.EXPIRED;
  }

  // Update subscription
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status,
      expiresAt: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
    },
  });
};

/**
 * Handle customer.subscription.deleted event
 */
const handleSubscriptionDeleted = async (
  stripeSubscription: Stripe.Subscription
): Promise<void> => {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) {
    console.warn("Subscription not found for deletion:", stripeSubscription.id);
    return;
  }

  // Mark as cancelled
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.CANCELLED,
      expiresAt: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: false,
    },
  });
};

/**
 * Handle invoice.payment_succeeded event
 */
const handlePaymentSucceeded = async (
  invoice: Stripe.Invoice
): Promise<void> => {
  console.log(`💳 Processing payment succeeded for invoice: ${invoice.id}`);
  const inv = invoice as any;
  const subscriptionId = typeof inv.subscription === 'string' 
    ? inv.subscription 
    : inv.subscription?.id;
  
  if (!subscriptionId) {
    console.log("⚠️ Invoice is not a subscription invoice, skipping...");
    return;
  }

  console.log(`📋 Subscription ID: ${subscriptionId}, Invoice ID: ${invoice.id}`);

  // Get payment intent ID
  const paymentIntentId = typeof inv.payment_intent === 'string' 
    ? inv.payment_intent 
    : inv.payment_intent?.id || null;

  console.log(`💳 Payment Intent ID: ${paymentIntentId || 'N/A'}`);

  // Check if payment already exists (avoid duplicates)
  if (paymentIntentId) {
    const existingPayment = await prisma.paymentTransaction.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    
    if (existingPayment) {
      console.log(`✅ Payment already exists in database: ${paymentIntentId}`);
      return; // Already processed
    }
  }

  // Try to find subscription - with retry logic (webhook events might arrive out of order)
  let subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  // If subscription doesn't exist yet, wait a bit and retry
  if (!subscription) {
    console.log("Subscription not found, waiting for subscription creation...", subscriptionId);
    
    // Retry up to 3 times with 2 second delay
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
      });
      
      if (subscription) {
        console.log("Subscription found after retry:", subscription.id);
        break;
      }
    }
  }

  // If still not found, try to get userId from invoice/customer metadata
  if (!subscription) {
    console.warn("Subscription not found after retries, attempting to create payment with metadata:", subscriptionId);
    
    let userId: string | null = null;
    
    try {
      // Try to get from invoice metadata
      if (invoice.metadata?.userId) {
        userId = invoice.metadata.userId;
      } else if (invoice.customer) {
        // Try to get from customer
        const customer = await stripe.customers.retrieve(invoice.customer as string);
        // Check if customer is deleted or has metadata
        if (!customer.deleted && 'metadata' in customer && customer.metadata?.userId) {
          userId = customer.metadata.userId;
        }
      }
    } catch (error) {
      console.error("Error retrieving customer for payment:", error);
    }

    if (!userId) {
      console.error("Cannot create payment: userId not found in invoice or customer metadata");
      // Store in gatewayData for later processing
      await prisma.paymentTransaction.create({
        data: {
          userId: null, // Will be updated later
          subscriptionId: null,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency.toUpperCase(),
          stripePaymentIntentId: paymentIntentId,
          status: "SUCCEEDED",
          gatewayData: {
            ...(invoice as unknown as object),
            pendingSubscriptionId: subscriptionId,
            needsUpdate: true,
          } as Prisma.InputJsonValue,
        },
      });
      return;
    }

    // Create payment with subscriptionId as null (will be updated when subscription is created)
    await prisma.paymentTransaction.create({
      data: {
        userId,
        subscriptionId: null, // Will be updated when subscription is created
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        stripePaymentIntentId: paymentIntentId,
        status: "SUCCEEDED",
        gatewayData: {
          ...(invoice as unknown as object),
          pendingSubscriptionId: subscriptionId, // Store for later update
        } as Prisma.InputJsonValue,
      },
    });

    // Try to notify user if we have userId
    NotificationService.notifyUser(
      userId,
      {
        type: NotificationType.PAYMENT_SUCCEEDED,
        title: "Payment successful",
        message: `Your subscription payment of ${invoice.currency.toUpperCase()} ${(invoice.amount_paid / 100).toFixed(2)} was processed successfully.`,
        data: {
          invoiceId: invoice.id,
        },
      }
    ).catch((error) => {
      console.error("Failed to send payment notification:", error);
    });

    return;
  }

  // Create payment transaction record
  console.log(`💾 Creating payment transaction for subscription: ${subscription.id}`);
  const payment = await prisma.paymentTransaction.create({
    data: {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      stripePaymentIntentId: paymentIntentId,
      status: "SUCCEEDED",
      gatewayData: (invoice as unknown) as Prisma.InputJsonValue,
    },
  });

  console.log(`✅ Payment transaction created successfully: ${payment.id}, Amount: ${payment.amount} ${payment.currency}`);

  // Notify user (PAYMENT_SUCCEEDED)
  NotificationService.notifyUser(
    subscription.userId,
    {
      type: NotificationType.PAYMENT_SUCCEEDED,
      title: "Payment successful",
      message: `Your subscription payment of ${invoice.currency.toUpperCase()} ${(invoice.amount_paid / 100).toFixed(2)} was processed successfully.`,
      data: {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
      },
    }
  ).catch((error) => {
    console.error("❌ Failed to send payment notification:", error);
  });
};

/**
 * Handle invoice.payment_failed event
 */
const handlePaymentFailed = async (
  invoice: Stripe.Invoice
): Promise<void> => {
  const inv = invoice as any;
  const subscriptionId = typeof inv.subscription === 'string' 
    ? inv.subscription 
    : inv.subscription?.id;
  
  if (!subscriptionId) {
    return;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) {
    console.warn("Subscription not found for failed payment:", subscriptionId);
    return;
  }

  // Update subscription status to PAST_DUE
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.PAST_DUE,
    },
  });

  // Create payment transaction record with FAILED status
  await prisma.paymentTransaction.create({
    data: {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      stripePaymentIntentId: typeof inv.payment_intent === 'string' 
        ? inv.payment_intent 
        : inv.payment_intent?.id || null,
      status: "FAILED",
      gatewayData: (invoice as unknown) as Prisma.InputJsonValue,
    },
  });

  // Notify user (PAYMENT_FAILED)
  NotificationService.notifyUser(
    subscription.userId,
    {
      type: NotificationType.PAYMENT_FAILED,
      title: "Payment failed",
      message: `Your subscription payment of ${invoice.currency.toUpperCase()} ${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method.`,
      data: {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
      },
    }
  ).catch((error) => {
    console.error("Failed to send payment failure notification:", error);
  });
};

/**
 * Handle checkout.session.completed event
 */
const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session
): Promise<void> => {
  // When checkout is completed, Stripe creates the subscription
  // We should wait for customer.subscription.created event to handle it
  // But we can verify the session here
  if (session.subscription) {
    const subscriptionId = session.subscription as string;
    
    // Retrieve the subscription from Stripe to get full details
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Check if subscription already exists in our database
      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (!existing) {
        // If subscription doesn't exist yet, it will be created by customer.subscription.created webhook
        // But we can log it here for debugging
        console.log("Checkout completed, subscription will be created via webhook:", subscriptionId);
      } else {
        console.log("Checkout completed for existing subscription:", existing.id);
      }
    } catch (error: any) {
      console.error("Error retrieving subscription from checkout session:", error);
    }
  }
};

/**
 * Manually sync subscription and payment data from Stripe
 * Useful when webhook events are missed or failed
 * @param authUser - Authenticated user (must be admin or subscription owner)
 * @param stripeSubscriptionId - Stripe subscription ID
 * @returns Sync result with counts
 */
const syncSubscriptionFromStripe = async (
  authUser: TAuthUser,
  stripeSubscriptionId: string
): Promise<{
  subscription: TSubscriptionResponse | null;
  paymentsCreated: number;
  paymentsUpdated: number;
  message: string;
}> => {
  console.log(`🔄 Starting manual sync for subscription: ${stripeSubscriptionId}`);

  // Validate and sanitize Stripe subscription ID
  // Stripe subscription IDs start with "sub_" and contain only alphanumeric characters and underscores
  // Decode URL encoding if present
  let sanitizedId = decodeURIComponent(stripeSubscriptionId).trim();
  
  // Remove any whitespace or control characters
  sanitizedId = sanitizedId.replace(/[\s\r\n\t]/g, '');
  
  if (!sanitizedId || !sanitizedId.startsWith('sub_')) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid Stripe subscription ID format. Must start with 'sub_'. Received: ${stripeSubscriptionId}`
    );
  }

  // Validate format: sub_ followed by alphanumeric and underscores only
  if (!/^sub_[a-zA-Z0-9_]+$/.test(sanitizedId)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid Stripe subscription ID format. Contains invalid characters. Received: ${stripeSubscriptionId}`
    );
  }
  
  console.log(`🔍 Sanitized subscription ID: ${sanitizedId} (original: ${stripeSubscriptionId})`);

  try {
    // Fetch subscription from Stripe
    console.log(`📡 Calling Stripe API to retrieve subscription: ${sanitizedId}`);
    const stripeSubscription = await stripe.subscriptions.retrieve(sanitizedId);
    console.log(`✅ Fetched subscription from Stripe: ${stripeSubscription.id}`);

    const userId = stripeSubscription.metadata?.userId;
    if (!userId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Subscription does not have userId in metadata. Cannot sync."
      );
    }

    // Verify user has permission (admin or subscription owner)
    if (authUser.role !== "ADMIN" && authUser.userId !== userId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You don't have permission to sync this subscription."
      );
    }

    // Check if subscription exists in database
    let subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    const planType = stripeSubscription.metadata?.planType || "MONTHLY";
    const planConfig = SUBSCRIPTION_PLANS[planType as "MONTHLY" | "YEARLY"] || SUBSCRIPTION_PLANS.MONTHLY;
    
    // Safely convert Stripe timestamps to Date objects
    const periodStart = (stripeSubscription as any).current_period_start;
    const periodEnd = (stripeSubscription as any).current_period_end;
    const created = (stripeSubscription as any).created;
    
    console.log(`📅 Stripe subscription dates:`, {
      current_period_start: periodStart,
      current_period_end: periodEnd,
      created: created,
      status: stripeSubscription.status,
    });
    
    // Handle dates - use created date as fallback if period dates are not available
    let startedAt: Date;
    let expiresAt: Date | null = null;
    
    if (periodStart) {
      startedAt = new Date(periodStart * 1000);
    } else if (created) {
      // Fallback to created date if period_start is not available
      startedAt = new Date(created * 1000);
      console.log(`⚠️ Using created date as startedAt: ${startedAt.toISOString()}`);
    } else {
      // Last resort: use current date
      startedAt = new Date();
      console.log(`⚠️ Using current date as startedAt: ${startedAt.toISOString()}`);
    }
    
    if (periodEnd) {
      expiresAt = new Date(periodEnd * 1000);
    } else if (periodStart) {
      // Calculate expiration from period start if period_end is missing
      expiresAt = calculateExpirationDate(planType, startedAt);
      console.log(`⚠️ Calculated expiresAt from planType: ${expiresAt.toISOString()}`);
    } else {
      // Calculate from startedAt
      expiresAt = calculateExpirationDate(planType, startedAt);
      console.log(`⚠️ Calculated expiresAt from startedAt: ${expiresAt.toISOString()}`);
    }
    
    // Validate dates
    if (isNaN(startedAt.getTime())) {
      console.error("Invalid startedAt date conversion:", {
        periodStart,
        created,
        startedAt: startedAt.toString(),
      });
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Failed to convert subscription start date. Invalid timestamp values."
      );
    }
    
    if (expiresAt && isNaN(expiresAt.getTime())) {
      console.error("Invalid expiresAt date conversion:", {
        periodEnd,
        expiresAt: expiresAt.toString(),
      });
      // If expiresAt is invalid, calculate it
      expiresAt = calculateExpirationDate(planType, startedAt);
      console.log(`⚠️ Recalculated expiresAt: ${expiresAt.toISOString()}`);
    }
    
    console.log(`📅 Subscription dates - Started: ${startedAt.toISOString()}, Expires: ${expiresAt?.toISOString() || 'null'}`);

    // Create or update subscription
    if (!subscription) {
      console.log("📝 Creating new subscription in database...");
      subscription = await prisma.subscription.create({
        data: {
          userId,
          planName: planConfig.name,
          planType: planType as string,
          status: stripeSubscription.status === "active" ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PAST_DUE,
          stripeSubscriptionId: stripeSubscription.id,
          startedAt,
          expiresAt,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
          metadata: {
            stripeCustomerId: stripeSubscription.customer as string,
            planType,
          } as Prisma.InputJsonValue,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });
      console.log(`✅ Subscription created: ${subscription.id}`);
    } else {
      console.log("🔄 Updating existing subscription...");
      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: stripeSubscription.status === "active" ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PAST_DUE,
          expiresAt,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });
      console.log(`✅ Subscription updated: ${subscription.id}`);
    }

    // Fetch invoices from Stripe
    console.log(`📋 Fetching invoices from Stripe for subscription: ${stripeSubscription.id}`);
    const invoices = await stripe.invoices.list({
      subscription: stripeSubscription.id,
      limit: 100, // Get up to 100 invoices
    });

    console.log(`📋 Found ${invoices.data.length} invoice(s)`);

    let paymentsCreated = 0;
    let paymentsUpdated = 0;

    // Process each invoice
    for (const invoice of invoices.data) {
      const inv = invoice as any;
      const paymentIntentId = typeof inv.payment_intent === 'string'
        ? inv.payment_intent
        : inv.payment_intent?.id || null;

      if (invoice.status !== "paid" || !paymentIntentId) {
        continue; // Skip unpaid invoices or invoices without payment intent
      }

      // Check if payment already exists
      const existingPayment = await prisma.paymentTransaction.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (existingPayment) {
        // Update if needed
        if (existingPayment.subscriptionId !== subscription.id || existingPayment.userId !== userId) {
          await prisma.paymentTransaction.update({
            where: { id: existingPayment.id },
            data: {
              subscriptionId: subscription.id,
              userId: userId,
            },
          });
          paymentsUpdated++;
          console.log(`🔄 Updated payment: ${existingPayment.id}`);
        }
        continue;
      }

      // Create new payment
      await prisma.paymentTransaction.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency.toUpperCase(),
          stripePaymentIntentId: paymentIntentId,
          status: "SUCCEEDED",
          gatewayData: (invoice as unknown) as Prisma.InputJsonValue,
        },
      });
      paymentsCreated++;
      console.log(`✅ Created payment for invoice: ${invoice.id}`);
    }

    const sub = subscription as any;
    const subscriptionResponse: TSubscriptionResponse = {
      id: sub.id,
      userId: sub.userId,
      planName: sub.planName,
      planType: sub.planType,
      status: sub.status,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      metadata: sub.metadata,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      user: sub.user,
    };

    console.log(`✅ Sync completed - Created: ${paymentsCreated}, Updated: ${paymentsUpdated}`);

    return {
      subscription: subscriptionResponse,
      paymentsCreated,
      paymentsUpdated,
      message: `Sync completed successfully. Created ${paymentsCreated} payment(s), updated ${paymentsUpdated} payment(s).`,
    };
  } catch (error: any) {
    console.error(`❌ Sync failed for subscription ${stripeSubscriptionId}:`, {
      error: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack,
    });
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError' || error.type === 'StripeAPIError') {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Stripe API error: ${error.message}`
      );
    }
    
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to sync subscription: ${error.message}`
    );
  }
};

export const SubscriptionService = {
  getSubscriptionStatus,
  getSubscription,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  handleStripeWebhook,
  syncSubscriptionFromStripe,
  getOrCreateStripeCustomer,
  calculateExpirationDate,
  calculateDaysRemaining,
};

