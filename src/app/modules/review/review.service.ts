import { Prisma, RatingSource, Role, TripStatus } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import {
  paginationHelper,
  IPaginationOptions,
} from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import pick from "../../shared/pick";
import { TripMemberService } from "../tripMember/tripMember.service";
import {
  reviewFilterableFields,
  reviewSearchableFields,
  minRating,
  maxRating,
} from "./review.constant";
import {
  TAuthUser,
  TReviewCreatePayload,
  TReviewUpdatePayload,
  TReviewQuery,
  TReviewResponse,
  TReviewListResponse,
  TReviewStatisticsResponse,
} from "./review.interface";

/**
 * Helper: Check if duplicate review exists
 */
const checkDuplicateReview = async (
  reviewerId: string,
  reviewedUserId?: string,
  planId?: string
): Promise<boolean> => {
  const existingReview = await prisma.review.findFirst({
    where: {
      reviewerId,
      reviewedUserId: reviewedUserId || null,
      planId: planId || null,
    },
  });

  return !!existingReview;
};

/**
 * Helper: Calculate and update user's average rating
 */
const calculateUserAvgRating = async (userId: string): Promise<void> => {
  const reviews = await prisma.review.findMany({
    where: {
      reviewedUserId: userId,
      source: RatingSource.USER_TO_USER,
    },
    select: {
      rating: true,
    },
  });

  if (reviews.length === 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { avgRating: 0 },
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = totalRating / reviews.length;

  await prisma.user.update({
    where: { id: userId },
    data: { avgRating: Math.round(avgRating * 100) / 100 }, // Round to 2 decimal places
  });
};

/**
 * Helper: Verify user can view review
 */
const verifyReviewAccess = async (
  authUser: TAuthUser,
  review: {
    reviewerId: string;
    reviewedUserId: string | null;
    planId: string | null;
  }
): Promise<void> => {
  // Reviewer can always view
  if (review.reviewerId === authUser.userId || authUser.role === Role.ADMIN) {
    return;
  }

  // Reviewed user can view their own reviews
  if (review.reviewedUserId === authUser.userId) {
    return;
  }

  // For trip reviews, check if user is a plan member
  if (review.planId) {
    const { member } = await TripMemberService.getTripMemberPermission(
      authUser,
      review.planId
    );

    if (member) {
      return;
    }
  }

  throw new ApiError(
    httpStatus.FORBIDDEN,
    "You don't have permission to view this review."
  );
};

/**
 * Helper: Verify user owns the review
 */
const verifyReviewOwnership = async (
  authUser: TAuthUser,
  reviewId: string
): Promise<void> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, reviewerId: true },
  });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found.");
  }

  if (review.reviewerId !== authUser.userId && authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to modify this review. Only the reviewer can update or delete their review."
    );
  }
};

/**
 * Create review
 * @param authUser - Authenticated user
 * @param payload - Review creation payload
 * @returns Created review
 */
const createReview = async (
  authUser: TAuthUser,
  payload: TReviewCreatePayload
): Promise<TReviewResponse> => {
  // Validate rating
  if (payload.rating < minRating || payload.rating > maxRating) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Rating must be between ${minRating} and ${maxRating}.`
    );
  }

  // Validate source matches payload
  if (payload.source === RatingSource.USER_TO_USER && !payload.reviewedUserId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "reviewedUserId is required for USER_TO_USER reviews."
    );
  }

  if (payload.source === RatingSource.USER_TO_TRIP && !payload.planId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "planId is required for USER_TO_TRIP reviews."
    );
  }

  // Prevent self-review for USER_TO_USER
  if (
    payload.source === RatingSource.USER_TO_USER &&
    payload.reviewedUserId === authUser.userId
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot review yourself."
    );
  }

  // Check for duplicate review
  const isDuplicate = await checkDuplicateReview(
    authUser.userId,
    payload.reviewedUserId,
    payload.planId
  );

  if (isDuplicate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have already reviewed this user/trip. You can only create one review per user/trip."
    );
  }

  // Verify reviewed user exists (for USER_TO_USER)
  if (payload.reviewedUserId) {
    const reviewedUser = await prisma.user.findUnique({
      where: { id: payload.reviewedUserId },
    });

    if (!reviewedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reviewed user not found.");
    }
  }

  // Verify plan exists (for USER_TO_TRIP)
  if (payload.planId) {
    const plan = await prisma.travelPlan.findUnique({
      where: { id: payload.planId },
    });

    if (!plan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
    }
  }

  // Create review
  const review = await prisma.review.create({
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
  if (payload.source === RatingSource.USER_TO_USER && payload.reviewedUserId) {
    await calculateUserAvgRating(payload.reviewedUserId);
  }

  return review as any;
};

/**
 * Get single review by ID
 * @param authUser - Authenticated user
 * @param reviewId - Review ID
 * @returns Review details
 */
const getReview = async (
  authUser: TAuthUser,
  reviewId: string
): Promise<TReviewResponse> => {
  const review = await prisma.review.findUnique({
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
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found.");
  }

  // Verify access
  await verifyReviewAccess(authUser, review);

  return review as any;
};

/**
 * Get paginated list of reviews
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Paginated reviews list
 */
const getReviews = async (
  authUser: TAuthUser,
  query: TReviewQuery
): Promise<TReviewListResponse> => {
  // Pagination
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy || "createdAt",
      sortOrder: query.sortOrder || "desc",
    });

  // Filters
  const filters = pick<TReviewQuery, keyof TReviewQuery>(
    query,
    reviewFilterableFields as (keyof TReviewQuery)[]
  );

  const andConditions: Prisma.ReviewWhereInput[] = [];

  // Permission-based filtering (non-admin users)
  if (authUser.role !== Role.ADMIN) {
    // Users can see reviews they're involved in (as reviewer or reviewedUser)
    // OR trip reviews from plans they're members of
    const userPlans = await prisma.tripMember.findMany({
      where: {
        userId: authUser.userId,
        status: TripStatus.JOINED,
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
    andConditions.push({ isEdited: filters.isEdited as boolean });
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

  const where: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Get reviews
  const reviews = await prisma.review.findMany({
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
  const total = await prisma.review.count({ where });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: reviews as any[],
  };
};

/**
 * Update review
 * @param authUser - Authenticated user
 * @param reviewId - Review ID
 * @param payload - Update payload
 * @returns Updated review
 */
const updateReview = async (
  authUser: TAuthUser,
  reviewId: string,
  payload: TReviewUpdatePayload
): Promise<TReviewResponse> => {
  // Verify ownership
  await verifyReviewOwnership(authUser, reviewId);

  // Get existing review
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      rating: true,
      reviewedUserId: true,
      source: true,
    },
  });

  if (!existingReview) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found.");
  }

  // Validate rating if provided
  if (payload.rating !== undefined) {
    if (payload.rating < minRating || payload.rating > maxRating) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Rating must be between ${minRating} and ${maxRating}.`
      );
    }
  }

  // Update review
  const review = await prisma.review.update({
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
  if (
    existingReview.source === RatingSource.USER_TO_USER &&
    existingReview.reviewedUserId
  ) {
    await calculateUserAvgRating(existingReview.reviewedUserId);
  }

  return review as any;
};

/**
 * Delete review
 * @param authUser - Authenticated user
 * @param reviewId - Review ID
 * @returns Success message
 */
const deleteReview = async (
  authUser: TAuthUser,
  reviewId: string
): Promise<{ message: string }> => {
  // Verify ownership
  await verifyReviewOwnership(authUser, reviewId);

  // Get review before deletion (for avgRating recalculation)
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      reviewedUserId: true,
      source: true,
    },
  });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found.");
  }

  // Delete review
  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Recalculate avgRating if USER_TO_USER review
  if (review.source === RatingSource.USER_TO_USER && review.reviewedUserId) {
    await calculateUserAvgRating(review.reviewedUserId);
  }

  return {
    message: "Review deleted successfully.",
  };
};

/**
 * Get review statistics
 * @param authUser - Authenticated user
 * @param userId - User ID (optional)
 * @param planId - Plan ID (optional)
 * @returns Review statistics
 */
const getReviewStatistics = async (
  authUser: TAuthUser,
  userId?: string,
  planId?: string
): Promise<TReviewStatisticsResponse> => {
  if (!userId && !planId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Either userId or planId must be provided."
    );
  }

  let where: Prisma.ReviewWhereInput = {};

  if (userId) {
    // Permission check: users can see stats for themselves, admins can see all
    if (userId !== authUser.userId && authUser.role !== Role.ADMIN) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You don't have permission to view statistics for this user."
      );
    }

    where = {
      reviewedUserId: userId,
      source: RatingSource.USER_TO_USER,
    };
  }

  if (planId) {
    // Permission check: users can see stats for plans they're members of, admins can see all
    if (authUser.role !== Role.ADMIN) {
      const { member } = await TripMemberService.getTripMemberPermission(
        authUser,
        planId
      );

      if (!member) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "You don't have permission to view statistics for this plan."
        );
      }
    }

    where = {
      planId,
      source: RatingSource.USER_TO_TRIP,
    };
  }

  // Get all reviews
  const reviews = await prisma.review.findMany({
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
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    ratingCounts[review.rating as keyof typeof ratingCounts]++;
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
};

export const ReviewService = {
  createReview,
  getReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewStatistics,
};

