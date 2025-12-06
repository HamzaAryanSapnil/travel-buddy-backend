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
exports.ReviewService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const prisma_1 = require("../../shared/prisma");
const pick_1 = __importDefault(require("../../shared/pick"));
const tripMember_service_1 = require("../tripMember/tripMember.service");
const review_constant_1 = require("./review.constant");
/**
 * Helper: Check if duplicate review exists
 */
const checkDuplicateReview = (reviewerId, reviewedUserId, planId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingReview = yield prisma_1.prisma.review.findFirst({
        where: {
            reviewerId,
            reviewedUserId: reviewedUserId || null,
            planId: planId || null,
        },
    });
    return !!existingReview;
});
/**
 * Helper: Calculate and update user's average rating
 */
const calculateUserAvgRating = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield prisma_1.prisma.review.findMany({
        where: {
            reviewedUserId: userId,
            source: client_1.RatingSource.USER_TO_USER,
        },
        select: {
            rating: true,
        },
    });
    if (reviews.length === 0) {
        yield prisma_1.prisma.user.update({
            where: { id: userId },
            data: { avgRating: 0 },
        });
        return;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviews.length;
    yield prisma_1.prisma.user.update({
        where: { id: userId },
        data: { avgRating: Math.round(avgRating * 100) / 100 }, // Round to 2 decimal places
    });
});
/**
 * Helper: Verify user can view review
 */
const verifyReviewAccess = (authUser, review) => __awaiter(void 0, void 0, void 0, function* () {
    // Reviewer can always view
    if (review.reviewerId === authUser.userId || authUser.role === client_1.Role.ADMIN) {
        return;
    }
    // Reviewed user can view their own reviews
    if (review.reviewedUserId === authUser.userId) {
        return;
    }
    // For trip reviews, check if user is a plan member
    if (review.planId) {
        const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, review.planId);
        if (member) {
            return;
        }
    }
    throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to view this review.");
});
/**
 * Helper: Verify user owns the review
 */
const verifyReviewOwnership = (authUser, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield prisma_1.prisma.review.findUnique({
        where: { id: reviewId },
        select: { id: true, reviewerId: true },
    });
    if (!review) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Review not found.");
    }
    if (review.reviewerId !== authUser.userId && authUser.role !== client_1.Role.ADMIN) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to modify this review. Only the reviewer can update or delete their review.");
    }
});
/**
 * Create review
 * @param authUser - Authenticated user
 * @param payload - Review creation payload
 * @returns Created review
 */
const createReview = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate rating
    if (payload.rating < review_constant_1.minRating || payload.rating > review_constant_1.maxRating) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Rating must be between ${review_constant_1.minRating} and ${review_constant_1.maxRating}.`);
    }
    // Validate source matches payload
    if (payload.source === client_1.RatingSource.USER_TO_USER && !payload.reviewedUserId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "reviewedUserId is required for USER_TO_USER reviews.");
    }
    if (payload.source === client_1.RatingSource.USER_TO_TRIP && !payload.planId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "planId is required for USER_TO_TRIP reviews.");
    }
    // Prevent self-review for USER_TO_USER
    if (payload.source === client_1.RatingSource.USER_TO_USER &&
        payload.reviewedUserId === authUser.userId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You cannot review yourself.");
    }
    // Check for duplicate review
    const isDuplicate = yield checkDuplicateReview(authUser.userId, payload.reviewedUserId, payload.planId);
    if (isDuplicate) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You have already reviewed this user/trip. You can only create one review per user/trip.");
    }
    // Verify reviewed user exists (for USER_TO_USER)
    if (payload.reviewedUserId) {
        const reviewedUser = yield prisma_1.prisma.user.findUnique({
            where: { id: payload.reviewedUserId },
        });
        if (!reviewedUser) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Reviewed user not found.");
        }
    }
    // Verify plan exists (for USER_TO_TRIP)
    if (payload.planId) {
        const plan = yield prisma_1.prisma.travelPlan.findUnique({
            where: { id: payload.planId },
        });
        if (!plan) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
        }
    }
    // Create review
    const review = yield prisma_1.prisma.review.create({
        data: {
            rating: payload.rating,
            comment: payload.comment || null,
            source: payload.source,
            reviewerId: authUser.userId,
            reviewedUserId: payload.reviewedUserId || null,
            planId: payload.planId || null,
        },
        include: {
            reviewer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            reviewedUser: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                    startDate: true,
                    endDate: true,
                },
            },
        },
    });
    // Update user's avgRating if USER_TO_USER review
    if (payload.source === client_1.RatingSource.USER_TO_USER && payload.reviewedUserId) {
        yield calculateUserAvgRating(payload.reviewedUserId);
    }
    return review;
});
/**
 * Get single review by ID
 * @param authUser - Authenticated user
 * @param reviewId - Review ID
 * @returns Review details
 */
const getReview = (authUser, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield prisma_1.prisma.review.findUnique({
        where: { id: reviewId },
        include: {
            reviewer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            reviewedUser: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                    startDate: true,
                    endDate: true,
                },
            },
        },
    });
    if (!review) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Review not found.");
    }
    // Verify access
    yield verifyReviewAccess(authUser, review);
    return review;
});
/**
 * Get paginated list of reviews
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Paginated reviews list
 */
const getReviews = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Pagination
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        sortBy: query.sortBy || "createdAt",
        sortOrder: query.sortOrder || "desc",
    });
    // Filters
    const filters = (0, pick_1.default)(query, review_constant_1.reviewFilterableFields);
    const andConditions = [];
    // Permission-based filtering (non-admin users)
    if (authUser.role !== client_1.Role.ADMIN) {
        // Users can see reviews they're involved in (as reviewer or reviewedUser)
        // OR trip reviews from plans they're members of
        const userPlans = yield prisma_1.prisma.tripMember.findMany({
            where: {
                userId: authUser.userId,
                status: client_1.TripStatus.JOINED,
            },
            select: { planId: true },
        });
        const planIds = userPlans.map((tm) => tm.planId);
        andConditions.push({
            OR: [
                { reviewerId: authUser.userId },
                { reviewedUserId: authUser.userId },
                { planId: { in: planIds } },
            ],
        });
    }
    // Apply filters
    if (filters.rating) {
        andConditions.push({ rating: filters.rating });
    }
    if (filters.source) {
        andConditions.push({ source: filters.source });
    }
    if (filters.reviewerId) {
        andConditions.push({ reviewerId: filters.reviewerId });
    }
    if (filters.reviewedUserId) {
        andConditions.push({ reviewedUserId: filters.reviewedUserId });
    }
    if (filters.planId) {
        andConditions.push({ planId: filters.planId });
    }
    if (filters.isEdited !== undefined) {
        andConditions.push({ isEdited: filters.isEdited });
    }
    // Search in comment
    if (query.searchTerm) {
        andConditions.push({
            comment: {
                contains: query.searchTerm,
                mode: "insensitive",
            },
        });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    // Get reviews
    const reviews = yield prisma_1.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            reviewer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            reviewedUser: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                    startDate: true,
                    endDate: true,
                },
            },
        },
    });
    // Get total count
    const total = yield prisma_1.prisma.review.count({ where });
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: reviews,
    };
});
/**
 * Update review
 * @param authUser - Authenticated user
 * @param reviewId - Review ID
 * @param payload - Update payload
 * @returns Updated review
 */
const updateReview = (authUser, reviewId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify ownership
    yield verifyReviewOwnership(authUser, reviewId);
    // Get existing review
    const existingReview = yield prisma_1.prisma.review.findUnique({
        where: { id: reviewId },
        select: {
            id: true,
            rating: true,
            reviewedUserId: true,
            source: true,
        },
    });
    if (!existingReview) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Review not found.");
    }
    // Validate rating if provided
    if (payload.rating !== undefined) {
        if (payload.rating < review_constant_1.minRating || payload.rating > review_constant_1.maxRating) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Rating must be between ${review_constant_1.minRating} and ${review_constant_1.maxRating}.`);
        }
    }
    // Update review
    const review = yield prisma_1.prisma.review.update({
        where: { id: reviewId },
        data: {
            rating: payload.rating,
            comment: payload.comment,
            isEdited: true,
        },
        include: {
            reviewer: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            reviewedUser: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                },
            },
            plan: {
                select: {
                    id: true,
                    title: true,
                    destination: true,
                    startDate: true,
                    endDate: true,
                },
            },
        },
    });
    // Recalculate avgRating if USER_TO_USER review
    if (existingReview.source === client_1.RatingSource.USER_TO_USER &&
        existingReview.reviewedUserId) {
        yield calculateUserAvgRating(existingReview.reviewedUserId);
    }
    return review;
});
/**
 * Delete review
 * @param authUser - Authenticated user
 * @param reviewId - Review ID
 * @returns Success message
 */
const deleteReview = (authUser, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify ownership
    yield verifyReviewOwnership(authUser, reviewId);
    // Get review before deletion (for avgRating recalculation)
    const review = yield prisma_1.prisma.review.findUnique({
        where: { id: reviewId },
        select: {
            id: true,
            reviewedUserId: true,
            source: true,
        },
    });
    if (!review) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Review not found.");
    }
    // Delete review
    yield prisma_1.prisma.review.delete({
        where: { id: reviewId },
    });
    // Recalculate avgRating if USER_TO_USER review
    if (review.source === client_1.RatingSource.USER_TO_USER && review.reviewedUserId) {
        yield calculateUserAvgRating(review.reviewedUserId);
    }
    return {
        message: "Review deleted successfully.",
    };
});
/**
 * Get review statistics
 * @param authUser - Authenticated user
 * @param userId - User ID (optional)
 * @param planId - Plan ID (optional)
 * @returns Review statistics
 */
const getReviewStatistics = (authUser, userId, planId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId && !planId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Either userId or planId must be provided.");
    }
    let where = {};
    if (userId) {
        // Permission check: users can see stats for themselves, admins can see all
        if (userId !== authUser.userId && authUser.role !== client_1.Role.ADMIN) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to view statistics for this user.");
        }
        where = {
            reviewedUserId: userId,
            source: client_1.RatingSource.USER_TO_USER,
        };
    }
    if (planId) {
        // Permission check: users can see stats for plans they're members of, admins can see all
        if (authUser.role !== client_1.Role.ADMIN) {
            const { member } = yield tripMember_service_1.TripMemberService.getTripMemberPermission(authUser, planId);
            if (!member) {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You don't have permission to view statistics for this plan.");
            }
        }
        where = {
            planId,
            source: client_1.RatingSource.USER_TO_TRIP,
        };
    }
    // Get all reviews
    const reviews = yield prisma_1.prisma.review.findMany({
        where,
        select: {
            rating: true,
        },
    });
    const totalReviews = reviews.length;
    if (totalReviews === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingBreakdown: [1, 2, 3, 4, 5].map((rating) => ({
                rating,
                count: 0,
                percentage: 0,
            })),
            userId,
            planId: planId || null,
        };
    }
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / totalReviews) * 100) / 100;
    // Calculate rating breakdown
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
        ratingCounts[review.rating]++;
    });
    const ratingBreakdown = [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: ratingCounts[rating],
        percentage: Math.round((ratingCounts[rating] / totalReviews) * 100),
    }));
    return {
        averageRating,
        totalReviews,
        ratingBreakdown,
        userId,
        planId: planId || null,
    };
});
exports.ReviewService = {
    createReview,
    getReview,
    getReviews,
    updateReview,
    deleteReview,
    getReviewStatistics,
};
