import { z } from "zod";
import { UI_STEPS } from "./planner.constant";

const stringRequired = (message: string) => z.string({ error: () => message });

const createSessionSchema = z.object({
  body: z.object({
    planId: stringRequired("Plan ID must be a string.").optional()
  })
});

const addStepSchema = z.object({
  params: z.object({
    id: stringRequired("Session ID is required.")
  }),
  body: z.object({
    question: stringRequired("Question is required.")
      .min(1, { message: "Question cannot be empty." }),
    answer: stringRequired("Answer is required.")
      .min(1, { message: "Answer cannot be empty." }),
    uiStep: z.enum(UI_STEPS as [string, ...string[]], {
      error: (): string => `UI step must be one of: ${UI_STEPS.join(", ")}.`
    })
  })
});

const completeSessionSchema = z.object({
  params: z.object({
    id: stringRequired("Session ID is required.")
  }),
  body: z.object({
    finalOutput: z.object({
      title: stringRequired("Title is required.")
        .min(3, { message: "Title must be at least 3 characters." })
        .max(200, { message: "Title cannot exceed 200 characters." }),
      destination: stringRequired("Destination is required.")
        .min(2, { message: "Destination must be at least 2 characters." })
        .max(200, { message: "Destination cannot exceed 200 characters." }),
      origin: stringRequired("Origin must be a string.").optional(),
      startDate: stringRequired("Start date is required.")
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Start date must be in YYYY-MM-DD format." }),
      endDate: stringRequired("End date is required.")
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "End date must be in YYYY-MM-DD format." }),
      budgetMin: z.number().nonnegative({ message: "Budget min must be >= 0." }).optional(),
      budgetMax: z.number().nonnegative({ message: "Budget max must be >= 0." }).optional(),
      travelType: z.enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"] as const, {
        error: () => "Travel type must be one of: SOLO, COUPLE, FAMILY, FRIENDS, GROUP."
      }),
      description: stringRequired("Description must be a string.")
        .max(2000, { message: "Description cannot exceed 2000 characters." })
        .optional(),
      itinerary: z.array(
        z.object({
          dayIndex: z.number().int().positive({ message: "Day index must be a positive integer." }),
          items: z.array(
            z.object({
              title: stringRequired("Item title is required.")
                .min(3, { message: "Item title must be at least 3 characters." })
                .max(200, { message: "Item title cannot exceed 200 characters." }),
              description: stringRequired("Description must be a string.")
                .max(2000, { message: "Description cannot exceed 2000 characters." })
                .optional(),
              startAt: stringRequired("Start time must be a string.")
                .datetime({ message: "Start time must be a valid ISO datetime." })
                .optional(),
              endAt: stringRequired("End time must be a string.")
                .datetime({ message: "End time must be a valid ISO datetime." })
                .optional(),
              location: stringRequired("Location must be a string.")
                .max(200, { message: "Location cannot exceed 200 characters." })
                .optional()
            })
          ).min(1, { message: "Each day must have at least one itinerary item." })
        })
      ).min(1, { message: "Itinerary must have at least one day." })
    }).refine(
      (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
      },
      {
        message: "endDate must be greater than or equal to startDate.",
        path: ["endDate"]
      }
    ).refine(
      (data) =>
        data.budgetMin === undefined ||
        data.budgetMax === undefined ||
        data.budgetMax >= data.budgetMin,
      {
        message: "budgetMax must be greater than or equal to budgetMin.",
        path: ["budgetMax"]
      }
    )
  })
});

const getSessionSchema = z.object({
  params: z.object({
    id: stringRequired("Session ID is required.")
  })
});

const getMySessionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"] as const).optional()
  })
});

export const PlannerValidation = {
  createSession: createSessionSchema,
  addStep: addStepSchema,
  completeSession: completeSessionSchema,
  getSession: getSessionSchema,
  getMySessions: getMySessionsSchema
};

