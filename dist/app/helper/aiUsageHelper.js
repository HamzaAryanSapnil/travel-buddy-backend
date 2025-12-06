"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiUsage = exports.checkAndIncrementAiUsage = exports.hasActiveSubscription = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const prisma_1 = require("../shared/prisma");
const dateHelper_1 = require("./dateHelper");
const notification_service_1 = require("../modules/notification/notification.service");
const FREE_AI_REQUESTS_PER_DAY = parseInt(process.env.FREE_AI_REQUESTS_PER_DAY || "10", 10);
/**
 * Check if user has an active subscription
 * @param userId - User ID
 * @returns true if user has active subscription
 */
const hasActiveSubscription = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const subscription = yield prisma_1.prisma.subscription.findFirst({
        where: {
            userId,
            status: client_1.SubscriptionStatus.ACTIVE,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: now } }
            ]
        }
    });
    return !!subscription;
});
exports.hasActiveSubscription = hasActiveSubscription;
/**
 * Check and increment AI usage for a user
 * Uses transaction to atomically check and increment
 * @param userId - User ID
 * @returns { allowed: boolean, remaining: number }
 * @throws ApiError with 429 status if limit exceeded
 */
const checkAndIncrementAiUsage = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user has active subscription → unlimited access
    const hasSubscription = yield (0, exports.hasActiveSubscription)(userId);
    if (hasSubscription) {
        return { allowed: true, remaining: -1 }; // -1 indicates unlimited
    }
    // Free tier: Check daily limit
    const today = (0, dateHelper_1.getUTCDateStart)();
    const todayDate = new Date(today);
    const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Get or create today's usage record
        let usage = yield tx.aiUsage.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: todayDate
                }
            }
        });
        if (!usage) {
            // Create new record for today
            usage = yield tx.aiUsage.create({
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
            notification_service_1.NotificationService.notifyUser(userId, {
                type: client_1.NotificationType.AI_LIMIT_REACHED,
                title: "AI request limit reached",
                message: `You've used all ${FREE_AI_REQUESTS_PER_DAY} free AI requests for today. Upgrade to a subscription for unlimited access.`,
                data: {
                    remaining: 0,
                    limit: FREE_AI_REQUESTS_PER_DAY
                }
            }).catch((error) => {
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
        const updated = yield tx.aiUsage.update({
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
    }));
    if (!result.allowed) {
        throw new ApiError_1.default(http_status_1.default.TOO_MANY_REQUESTS, `Daily AI request limit exceeded. You have used ${FREE_AI_REQUESTS_PER_DAY}/${FREE_AI_REQUESTS_PER_DAY} free requests today. Please upgrade to a subscription for unlimited access.`);
    }
    return {
        allowed: result.allowed,
        remaining: result.remaining
    };
});
exports.checkAndIncrementAiUsage = checkAndIncrementAiUsage;
/**
 * Get current AI usage for a user (without incrementing)
 * @param userId - User ID
 * @returns { used: number, limit: number, remaining: number, hasSubscription: boolean }
 */
const getAiUsage = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const hasSubscription = yield (0, exports.hasActiveSubscription)(userId);
    if (hasSubscription) {
        return {
            used: 0,
            limit: -1, // -1 indicates unlimited
            remaining: -1,
            hasSubscription: true
        };
    }
    const today = (0, dateHelper_1.getUTCDateStart)();
    const todayDate = new Date(today);
    const usage = yield prisma_1.prisma.aiUsage.findUnique({
        where: {
            userId_date: {
                userId,
                date: todayDate
            }
        }
    });
    const used = (usage === null || usage === void 0 ? void 0 : usage.requestCount) || 0;
    const remaining = Math.max(0, FREE_AI_REQUESTS_PER_DAY - used);
    return {
        used,
        limit: FREE_AI_REQUESTS_PER_DAY,
        remaining,
        hasSubscription: false
    };
});
exports.getAiUsage = getAiUsage;
