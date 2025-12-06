"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewValidation = void 0;
const zod_1 = require("zod");
const review_constant_1 = require("./review.constant");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
const createReviewSchema = zod_1.z
    .object({
    body: zod_1.z
        .object({
        rating: zod_1.z
            .number({ message: "Rating is required and must be a number." })
            .int({ message: "Rating must be an integer." })
            .min(review_constant_1.minRating, { message: `Rating must be at least ${review_constant_1.minRating}.` })
            .max(review_constant_1.maxRating, { message: `Rating must be at most ${review_constant_1.maxRating}.` }),
        comment: stringRequired("Comment must be a string.").optional(),
        source: zod_1.z.enum(review_constant_1.ratingSourceEnum, {
            error: () => "Invalid rating source. Must be USER_TO_USER or USER_TO_TRIP.",
        }),
        reviewedUserId: stringRequired("Reviewed user ID must be a string.")
            .uuid({ message: "Reviewed user ID must be a valid UUID." })
            .optional(),
        planId: stringRequired("Plan ID must be a string.")
            .uuid({ message: "Plan ID must be a valid UUID." })
            .optional(),
    })
        .refine((data) => {
        if (data.source === "USER_TO_USER") {
            return !!data.reviewedUserId;
        }
        if (data.source === "USER_TO_TRIP") {
            return !!data.planId;
        }
        return false;
    }, {
        message: "For USER_TO_USER reviews, reviewedUserId is required. For USER_TO_TRIP reviews, planId is required.",
    }),
})
    .refine((data) => {
    if (data.body.source === "USER_TO_USER" && data.body.reviewedUserId) {
        return true;
    }
    if (data.body.source === "USER_TO_TRIP" && data.body.planId) {
        return true;
    }
    return false;
}, {
    message: "Either reviewedUserId (for USER_TO_USER) or planId (for USER_TO_TRIP) must be provided.",
});
const updateReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Review ID is required.").uuid({
            message: "Review ID must be a valid UUID.",
        }),
    }),
    body: zod_1.z.object({
        rating: zod_1.z
            .number({ message: "Rating must be a number." })
            .int({ message: "Rating must be an integer." })
            .min(review_constant_1.minRating, { message: `Rating must be at least ${review_constant_1.minRating}.` })
            .max(review_constant_1.maxRating, { message: `Rating must be at most ${review_constant_1.maxRating}.` })
            .optional(),
        comment: stringRequired("Comment must be a string.").optional(),
    }),
});
const getReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Review ID is required.").uuid({
            message: "Review ID must be a valid UUID.",
        }),
    }),
});
const getReviewsSchema = zod_1.z.object({
    query: zod_1.z.object({
        rating: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        source: zod_1.z
            .enum(review_constant_1.ratingSourceEnum, {
            error: () => "Invalid rating source.",
        })
            .optional(),
        reviewerId: stringRequired("Reviewer ID must be a string.")
            .uuid({ message: "Reviewer ID must be a valid UUID." })
            .optional(),
        reviewedUserId: stringRequired("Reviewed user ID must be a string.")
            .uuid({ message: "Reviewed user ID must be a valid UUID." })
            .optional(),
        planId: stringRequired("Plan ID must be a string.")
            .uuid({ message: "Plan ID must be a valid UUID." })
            .optional(),
        isEdited: zod_1.z
            .string()
            .optional()
            .transform((val) => {
            if (val === "true")
                return true;
            if (val === "false")
                return false;
            return undefined;
        }),
        searchTerm: stringRequired("Search term must be a string.").optional(),
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
const deleteReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Review ID is required.").uuid({
            message: "Review ID must be a valid UUID.",
        }),
    }),
});
const getReviewStatisticsSchema = zod_1.z.object({
    query: zod_1.z.object({
        userId: stringRequired("User ID must be a string.")
            .uuid({ message: "User ID must be a valid UUID." })
            .optional(),
        planId: stringRequired("Plan ID must be a string.")
            .uuid({ message: "Plan ID must be a valid UUID." })
            .optional(),
    }),
});
exports.ReviewValidation = {
    createReview: createReviewSchema,
    updateReview: updateReviewSchema,
    getReview: getReviewSchema,
    getReviews: getReviewsSchema,
    deleteReview: deleteReviewSchema,
    getReviewStatistics: getReviewStatisticsSchema,
};
