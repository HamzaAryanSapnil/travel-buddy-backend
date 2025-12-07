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
          message: "Start date must be a future date. Past dates are not allowed.",
        }
      ),
    endDate: z.string().min(1, { message: "EndDate is required." }),
    travelType: z.enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"]),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
    description: z.string().optional(),
    coverPhoto: z.string().optional(),
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
          message: "Start date must be a future date. Past dates are not allowed.",
        }
      ),
    endDate: z.string().optional(),
    travelType: z
      .enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"])
      .optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
    description: z.string().optional(),
    coverPhoto: z.string().optional(),
  }),
});

const getSingleTravelPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Plan id is required." }),
  }),
});

export const TravelPlanValidation = {
  createTravelPlan: createTravelPlanSchema,
  updateTravelPlan: updateTravelPlanSchema,
  getSingleTravelPlan: getSingleTravelPlanSchema,
};
