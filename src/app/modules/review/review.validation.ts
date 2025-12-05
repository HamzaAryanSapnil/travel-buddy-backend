import { z } from "zod";
import { ratingSourceEnum, minRating, maxRating } from "./review.constant";

const stringRequired = (message: string) => z.string({ error: () => message });

const createReviewSchema = z
  .object({
    body: z
      .object({
        rating: z
          .number({ message: "Rating is required and must be a number." })
          .int({ message: "Rating must be an integer." })
          .min(minRating, { message: `Rating must be at least ${minRating}.` })
          .max(maxRating, { message: `Rating must be at most ${maxRating}.` }),
        comment: stringRequired("Comment must be a string.").optional(),
        source: z.enum(ratingSourceEnum as unknown as [string, ...string[]], {
          error: () => "Invalid rating source. Must be USER_TO_USER or USER_TO_TRIP.",
        }),
        reviewedUserId: stringRequired("Reviewed user ID must be a string.")
          .uuid({ message: "Reviewed user ID must be a valid UUID." })
          .optional(),
        planId: stringRequired("Plan ID must be a string.")
          .uuid({ message: "Plan ID must be a valid UUID." })
          .optional(),
      })
      .refine(
        (data) => {
          if (data.source === "USER_TO_USER") {
            return !!data.reviewedUserId;
          }
          if (data.source === "USER_TO_TRIP") {
            return !!data.planId;
          }
          return false;
        },
        {
          message:
            "For USER_TO_USER reviews, reviewedUserId is required. For USER_TO_TRIP reviews, planId is required.",
        }
      ),
  })
  .refine(
    (data) => {
      if (data.body.source === "USER_TO_USER" && data.body.reviewedUserId) {
        return true;
      }
      if (data.body.source === "USER_TO_TRIP" && data.body.planId) {
        return true;
      }
      return false;
    },
    {
      message:
        "Either reviewedUserId (for USER_TO_USER) or planId (for USER_TO_TRIP) must be provided.",
    }
  );

const updateReviewSchema = z.object({
  params: z.object({
    id: stringRequired("Review ID is required.").uuid({
      message: "Review ID must be a valid UUID.",
    }),
  }),
  body: z.object({
    rating: z
      .number({ message: "Rating must be a number." })
      .int({ message: "Rating must be an integer." })
      .min(minRating, { message: `Rating must be at least ${minRating}.` })
      .max(maxRating, { message: `Rating must be at most ${maxRating}.` })
      .optional(),
    comment: stringRequired("Comment must be a string.").optional(),
  }),
});

const getReviewSchema = z.object({
  params: z.object({
    id: stringRequired("Review ID is required.").uuid({
      message: "Review ID must be a valid UUID.",
    }),
  }),
});

const getReviewsSchema = z.object({
  query: z.object({
    rating: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    source: z
      .enum(ratingSourceEnum as unknown as [string, ...string[]], {
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
    isEdited: z
      .string()
      .optional()
      .transform((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return undefined;
      }),
    searchTerm: stringRequired("Search term must be a string.").optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    sortBy: stringRequired("Sort by must be a string.").optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

const deleteReviewSchema = z.object({
  params: z.object({
    id: stringRequired("Review ID is required.").uuid({
      message: "Review ID must be a valid UUID.",
    }),
  }),
});

const getReviewStatisticsSchema = z.object({
  query: z.object({
    userId: stringRequired("User ID must be a string.")
      .uuid({ message: "User ID must be a valid UUID." })
      .optional(),
    planId: stringRequired("Plan ID must be a string.")
      .uuid({ message: "Plan ID must be a valid UUID." })
      .optional(),
  }),
});

export const ReviewValidation = {
  createReview: createReviewSchema,
  updateReview: updateReviewSchema,
  getReview: getReviewSchema,
  getReviews: getReviewsSchema,
  deleteReview: deleteReviewSchema,
  getReviewStatistics: getReviewStatisticsSchema,
};

