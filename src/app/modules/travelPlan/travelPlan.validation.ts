import { z } from "zod";

const stringRequired = (message: string) => z.string({ error: () => message });

const baseBody = {
  title: stringRequired("Title is required.")
    .min(3, { message: "Title must be at least 3 characters long." })
    .max(200, { message: "Title cannot exceed 200 characters." }),
  destination: stringRequired("Destination is required.")
    .min(2, { message: "Destination must be at least 2 characters long." })
    .max(200, { message: "Destination cannot exceed 200 characters." }),
  origin: stringRequired("Origin must be a string.")
    .max(200, { message: "Origin cannot exceed 200 characters." })
    .optional(),
  startDate: stringRequired("Start date is required."),
  endDate: stringRequired("End date is required."),
  budgetMin: z
    .number()
    .nonnegative({ message: "Budget min must be >= 0." })
    .optional(),
  budgetMax: z
    .number()
    .nonnegative({ message: "Budget max must be >= 0." })
    .optional(),
  travelType: z.enum(
    ["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"] as const,
    {
      error: () => "Invalid travel type.",
    }
  ),
  visibility: z
    .enum(["PUBLIC", "PRIVATE", "UNLISTED"] as const, {
      error: () => "Invalid visibility.",
    })
    .optional(),
  description: stringRequired("Description must be a string.")
    .max(2000, { message: "Description cannot exceed 2000 characters." })
    .optional(),
  coverPhoto: stringRequired("Cover photo must be a string.")
    .pipe(z.url({ error: () => "Cover photo must be a valid URL." }))
    .optional(),
};

const createTravelPlanSchema = z.object({
  body: z
    .object(baseBody)
    .refine(
      (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
      },
      {
        message: "endDate must be greater than or equal to startDate.",
        path: ["endDate"],
      }
    )
    .refine(
      (data) =>
        data.budgetMin === undefined ||
        data.budgetMax === undefined ||
        data.budgetMax >= data.budgetMin,
      {
        message: "budgetMax must be greater than or equal to budgetMin.",
        path: ["budgetMax"],
      }
    ),
});

const updateTravelPlanSchema = z.object({
  params: z.object({
    id: stringRequired("Plan id is required."),
  }),
  body: z
    .object({
      ...Object.fromEntries(
        Object.entries(baseBody).map(([key, value]) => [
          key,
          (value as z.ZodTypeAny).optional(),
        ])
      ),
    })
    .refine(
      (data) => {
        if (!data.startDate || !data.endDate) return true;
        const start = new Date(data.startDate as string);
        const end = new Date(data.endDate as string);
        return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
      },
      {
        message: "endDate must be greater than or equal to startDate.",
        path: ["endDate"],
      }
    )
    .refine(
      (data) =>
        data.budgetMin === undefined ||
        data.budgetMax === undefined ||
        (data.budgetMax as number) >= (data.budgetMin as number),
      {
        message: "budgetMax must be greater than or equal to budgetMin.",
        path: ["budgetMax"],
      }
    ),
});

const getSingleTravelPlanSchema = z.object({
  params: z.object({
    id: stringRequired("Plan id is required."),
  }),
});

export const TravelPlanValidation = {
  createTravelPlan: createTravelPlanSchema,
  updateTravelPlan: updateTravelPlanSchema,
  getSingleTravelPlan: getSingleTravelPlanSchema,
};
