"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerValidation = void 0;
const zod_1 = require("zod");
const planner_constant_1 = require("./planner.constant");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
const createSessionSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: stringRequired("Plan ID must be a string.").optional()
    })
});
const addStepSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Session ID is required.")
    }),
    body: zod_1.z.object({
        question: stringRequired("Question is required.")
            .min(1, { message: "Question cannot be empty." }),
        answer: stringRequired("Answer is required.")
            .min(1, { message: "Answer cannot be empty." }),
        uiStep: zod_1.z.enum(planner_constant_1.UI_STEPS, {
            error: () => `UI step must be one of: ${planner_constant_1.UI_STEPS.join(", ")}.`
        })
    })
});
const completeSessionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Session ID is required.")
    }),
    body: zod_1.z.object({
        finalOutput: zod_1.z.object({
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
            budgetMin: zod_1.z.number().nonnegative({ message: "Budget min must be >= 0." }).optional(),
            budgetMax: zod_1.z.number().nonnegative({ message: "Budget max must be >= 0." }).optional(),
            travelType: zod_1.z.enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"], {
                error: () => "Travel type must be one of: SOLO, COUPLE, FAMILY, FRIENDS, GROUP."
            }),
            description: stringRequired("Description must be a string.")
                .max(2000, { message: "Description cannot exceed 2000 characters." })
                .optional(),
            itinerary: zod_1.z.array(zod_1.z.object({
                dayIndex: zod_1.z.number().int().positive({ message: "Day index must be a positive integer." }),
                items: zod_1.z.array(zod_1.z.object({
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
                })).min(1, { message: "Each day must have at least one itinerary item." })
            })).min(1, { message: "Itinerary must have at least one day." })
        }).refine((data) => {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
        }, {
            message: "endDate must be greater than or equal to startDate.",
            path: ["endDate"]
        }).refine((data) => data.budgetMin === undefined ||
            data.budgetMax === undefined ||
            data.budgetMax >= data.budgetMin, {
            message: "budgetMax must be greater than or equal to budgetMin.",
            path: ["budgetMax"]
        })
    })
});
const getSessionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Session ID is required.")
    })
});
const getMySessionsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional()
    })
});
exports.PlannerValidation = {
    createSession: createSessionSchema,
    addStep: addStepSchema,
    completeSession: completeSessionSchema,
    getSession: getSessionSchema,
    getMySessions: getMySessionsSchema
};
