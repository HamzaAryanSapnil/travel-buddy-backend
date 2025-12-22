import { z } from "zod";

const createTravelPlanSchema = z.object({
  body: z.object({
    title: z.string().min(1, { message: "Title is required." }),
    destination: z.string().min(1, { message: "Destination is required." }),
    origin: z.string().optional(),
    startDate: z
      .string()
      .min(1, { message: "StartDate is required." })
      .refine(
        (date) => {
          const startDate = new Date(date);
          const now = new Date();
          return !isNaN(startDate.getTime()) && startDate > now;
        },
        {
          message:
            "Start date must be a future date. Past dates are not allowed.",
        }
      ),
    endDate: z.string().min(1, { message: "EndDate is required." }),
    travelType: z.enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"]),
    budgetMin: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().optional()
    ),
    budgetMax: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().optional()
    ),
    visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
    description: z.string().optional(),
    coverPhoto: z
      .string()
      .url({ message: "Cover photo must be a valid URL." })
      .optional(),
    galleryImages: z
      .array(
        z.string().url({ message: "Each gallery image must be a valid URL." })
      )
      .optional(),
  }),
});

const updateTravelPlanSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    destination: z.string().optional(),
    origin: z.string().optional(),
    startDate: z
      .string()
      .optional()
      .refine(
        (date) => {
          if (!date) return true; // Optional field, skip validation if not provided
          const startDate = new Date(date);
          const now = new Date();
          return !isNaN(startDate.getTime()) && startDate > now;
        },
        {
          message:
            "Start date must be a future date. Past dates are not allowed.",
        }
      ),
    endDate: z.string().optional(),
    travelType: z
      .enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"])
      .optional(),
    budgetMin: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().optional()
    ),
    budgetMax: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().optional()
    ),
    visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
    description: z.string().optional(),
    coverPhoto: z
      .string()
      .url({ message: "Cover photo must be a valid URL." })
      .optional(),
    galleryImages: z
      .array(
        z.string().url({ message: "Each gallery image must be a valid URL." })
      )
      .optional(),
  }),
});

const getSingleTravelPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Plan id is required." }),
  }),
});

const getAllTravelPlansSchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    travelType: z
      .enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"])
      .optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
    isFeatured: z.string().optional(),
    ownerId: z
      .string()
      .uuid({ message: "Owner ID must be a valid UUID." })
      .optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
  isFeatured: z.boolean().optional(),
});

const adminUpdateTravelPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Plan id is required." }),
  }),
  body: z.object({
    title: z.string().optional(),
    destination: z.string().optional(),
    origin: z.string().optional(),
    startDate: z
      .string()
      .optional()
      .refine(
        (date) => {
          if (!date) return true; // Optional field, skip validation if not provided
          const startDate = new Date(date);
          const now = new Date();
          return !isNaN(startDate.getTime()) && startDate > now;
        },
        {
          message:
            "Start date must be a future date. Past dates are not allowed.",
        }
      ),
    endDate: z.string().optional(),
    travelType: z
      .enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"])
      .optional(),
    budgetMin: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().optional()
    ),
    budgetMax: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().optional()
    ),
    visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
    description: z.string().optional(),
    coverPhoto: z
      .url({ message: "Cover photo must be a valid URL." })
      .optional(),
    galleryImages: z
      .array(z.url({ message: "Each gallery image must be a valid URL." }))
      .optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const TravelPlanValidation = {
  createTravelPlan: createTravelPlanSchema,
  updateTravelPlan: updateTravelPlanSchema,
  getSingleTravelPlan: getSingleTravelPlanSchema,
  getAllTravelPlans: getAllTravelPlansSchema,
  adminUpdateTravelPlan: adminUpdateTravelPlanSchema,
};
