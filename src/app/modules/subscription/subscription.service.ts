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
import {
  TAuthUser,
  TSubscriptionCreatePayload,
  TSubscriptionUpdatePayload,
  TSubscriptionQuery,
  TSubscriptionResponse,
  TSubscriptionListResponse,
  TSubscriptionStatusResponse,
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
 * Create a new subscription
 * @param authUser - Authenticated user
 * @param payload - Subscription creation payload
 * @returns Created subscription
 */
const createSubscription = async (
  authUser: TAuthUser,
  payload: TSubscriptionCreatePayload
): Promise<TSubscriptionResponse> => {
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

  // Create Stripe subscription
  let stripeSubscription;
  try {
    stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: planConfig.priceId,
        },
      ],
      metadata: {
        userId: authUser.userId,
        planType: payload.planType,
      },
    });
  } catch (error: any) {
    console.error("Stripe subscription creation error:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to create subscription: ${error.message || "Unknown error"}`
    );
  }

  // Calculate expiration date
  const startedAt = new Date();
  const expiresAt = calculateExpirationDate(payload.planType, startedAt);

  // Create subscription in database (transaction)
  const subscription = await prisma.$transaction(async (tx) => {
    // Store customer ID in metadata for future reference
    const metadata = {
      stripeCustomerId,
      planType: payload.planType,
    };

    const newSubscription = await tx.subscription.create({
      data: {
        userId: authUser.userId,
        planName: planConfig.name,
        planType: payload.planType,
        status: SubscriptionStatus.ACTIVE,
        stripeSubscriptionId: stripeSubscription.id,
        startedAt,
        expiresAt,
        cancelAtPeriodEnd: false,
        metadata: metadata as Prisma.InputJsonValue,
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

    return newSubscription;
  });

  // Notify user (SUBSCRIPTION_CREATED)
  NotificationService.notifyUser(
    authUser.userId,
    {
      type: NotificationType.SUBSCRIPTION_CREATED,
      title: "Subscription created successfully",
      message: `Your ${planConfig.name} subscription has been activated. You now have unlimited AI access!`,
      data: {
        subscriptionId: subscription.id,
        planType: payload.planType,
        expiresAt: expiresAt.toISOString(),
      },
    }
  ).catch((error) => {
    console.error("Failed to send notification for subscription creation:", error);
  });

  const sub = subscription as any;
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

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed: ${error.message}`
    );
  }

  // Handle different event types
  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error: any) {
    console.error(`Error handling webhook event ${event.type}:`, error);
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
  const userId = stripeSubscription.metadata?.userId;
  if (!userId) {
    console.warn("Subscription created without userId in metadata:", stripeSubscription.id);
    return;
  }

  // Check if subscription already exists
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (existing) {
    console.log("Subscription already exists:", stripeSubscription.id);
    return;
  }

  // Get plan type from metadata or determine from price
  const planType = stripeSubscription.metadata?.planType || "MONTHLY";
  const planConfig = SUBSCRIPTION_PLANS[planType as "MONTHLY" | "YEARLY"] || SUBSCRIPTION_PLANS.MONTHLY;

  // Calculate dates
  const startedAt = new Date((stripeSubscription as any).current_period_start * 1000);
  const expiresAt = new Date((stripeSubscription as any).current_period_end * 1000);

  // Create subscription in database
  await prisma.subscription.create({
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
  const inv = invoice as any;
  const subscriptionId = typeof inv.subscription === 'string' 
    ? inv.subscription 
    : inv.subscription?.id;
  
  if (!subscriptionId) {
    // Not a subscription invoice
    return;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) {
    console.warn("Subscription not found for payment:", subscriptionId);
    return;
  }

  // Create payment transaction record
  await prisma.paymentTransaction.create({
    data: {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      stripePaymentIntentId: typeof inv.payment_intent === 'string' 
        ? inv.payment_intent 
        : inv.payment_intent?.id || null,
      status: "SUCCEEDED",
      gatewayData: (invoice as unknown) as Prisma.InputJsonValue,
    },
  });

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
    console.error("Failed to send payment notification:", error);
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
  // This event is typically handled by subscription.created/updated
  // But we can use it to verify subscription was created
  if (session.subscription) {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: session.subscription as string },
    });

    if (subscription) {
      console.log("Checkout completed for subscription:", subscription.id);
    }
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
  getOrCreateStripeCustomer,
  calculateExpirationDate,
  calculateDaysRemaining,
};

