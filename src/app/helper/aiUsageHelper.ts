import { NotificationType, SubscriptionStatus } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { prisma } from "../shared/prisma";
import { getUTCDateStart } from "./dateHelper";
import { NotificationService } from "../modules/notification/notification.service";

const FREE_AI_REQUESTS_PER_DAY = parseInt(
  process.env.FREE_AI_REQUESTS_PER_DAY || "10",
  10
);

/**
 * Check if user has an active subscription
 * @param userId - User ID
 * @returns true if user has active subscription
 */
export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  const now = new Date();
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ]
    }
  });

  return !!subscription;
};

/**
 * Check and increment AI usage for a user
 * Uses transaction to atomically check and increment
 * @param userId - User ID
 * @returns { allowed: boolean, remaining: number }
 * @throws ApiError with 429 status if limit exceeded
 */
export const checkAndIncrementAiUsage = async (
  userId: string
): Promise<{ allowed: boolean; remaining: number }> => {
  // Check if user has active subscription → unlimited access
  const hasSubscription = await hasActiveSubscription(userId);

  if (hasSubscription) {
    return { allowed: true, remaining: -1 }; // -1 indicates unlimited
  }

  // Free tier: Check daily limit
  const today = getUTCDateStart();
  const todayDate = new Date(today);

  const result = await prisma.$transaction(async (tx) => {
    // Get or create today's usage record
    let usage = await tx.aiUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayDate
        }
      }
    });

    if (!usage) {
      // Create new record for today
      usage = await tx.aiUsage.create({
        data: {
          userId,
          date: todayDate,
          requestCount: 0
        }
      });
    }

    // Check if limit exceeded
    if (usage.requestCount >= FREE_AI_REQUESTS_PER_DAY) {
      // Notify user about limit reached (async, don't wait)
      NotificationService.notifyUser(
        userId,
        {
          type: NotificationType.AI_LIMIT_REACHED,
          title: "AI request limit reached",
          message: `You've used all ${FREE_AI_REQUESTS_PER_DAY} free AI requests for today. Upgrade to a subscription for unlimited access.`,
          data: {
            remaining: 0,
            limit: FREE_AI_REQUESTS_PER_DAY
          }
        }
      ).catch((error: unknown) => {
        // Log error but don't fail the limit check
        console.error("Failed to send notification for AI limit:", error);
      });

      return {
        allowed: false,
        remaining: 0,
        usage
      };
    }

    // Increment counter
    const updated = await tx.aiUsage.update({
      where: { id: usage.id },
      data: {
        requestCount: {
          increment: 1
        }
      }
    });

    return {
      allowed: true,
      remaining: FREE_AI_REQUESTS_PER_DAY - updated.requestCount,
      usage: updated
    };
  });

  if (!result.allowed) {
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      `Daily AI request limit exceeded. You have used ${FREE_AI_REQUESTS_PER_DAY}/${FREE_AI_REQUESTS_PER_DAY} free requests today. Please upgrade to a subscription for unlimited access.`
    );
  }

  return {
    allowed: result.allowed,
    remaining: result.remaining
  };
};

/**
 * Get current AI usage for a user (without incrementing)
 * @param userId - User ID
 * @returns { used: number, limit: number, remaining: number, hasSubscription: boolean }
 */
export const getAiUsage = async (userId: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
  hasSubscription: boolean;
}> => {
  const hasSubscription = await hasActiveSubscription(userId);

  if (hasSubscription) {
    return {
      used: 0,
      limit: -1, // -1 indicates unlimited
      remaining: -1,
      hasSubscription: true
    };
  }

  const today = getUTCDateStart();
  const todayDate = new Date(today);

  const usage = await prisma.aiUsage.findUnique({
    where: {
      userId_date: {
        userId,
        date: todayDate
      }
    }
  });

  const used = usage?.requestCount || 0;
  const remaining = Math.max(0, FREE_AI_REQUESTS_PER_DAY - used);

  return {
    used,
    limit: FREE_AI_REQUESTS_PER_DAY,
    remaining,
    hasSubscription: false
  };
};

