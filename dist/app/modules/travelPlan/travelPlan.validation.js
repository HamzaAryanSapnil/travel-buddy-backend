"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelPlanValidation = void 0;
const zod_1 = require("zod");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
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
    budgetMin: zod_1.z
        .number()
        .nonnegative({ message: "Budget min must be >= 0." })
        .optional(),
    budgetMax: zod_1.z
        .number()
        .nonnegative({ message: "Budget max must be >= 0." })
        .optional(),
    travelType: zod_1.z.enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"], {
        error: () => "Invalid travel type.",
    }),
    visibility: zod_1.z
        .enum(["PUBLIC", "PRIVATE", "UNLISTED"], {
        error: () => "Invalid visibility.",
    })
        .optional(),
    description: stringRequired("Description must be a string.")
        .max(2000, { message: "Description cannot exceed 2000 characters." })
        .optional(),
    coverPhoto: stringRequired("Cover photo must be a string.")
        .pipe(zod_1.z.url({ error: () => "Cover photo must be a valid URL." }))
        .optional(),
};
const createTravelPlanSchema = zod_1.z.object({
    body: zod_1.z
        .object(baseBody)
        .refine((data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
    }, {
        message: "endDate must be greater than or equal to startDate.",
        path: ["endDate"],
    })
        .refine((data) => data.budgetMin === undefined ||
        data.budgetMax === undefined ||
        data.budgetMax >= data.budgetMin, {
        message: "budgetMax must be greater than or equal to budgetMin.",
        path: ["budgetMax"],
    }),
});
const updateTravelPlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Plan id is required."),
    }),
    body: zod_1.z
        .object(Object.assign({}, Object.fromEntries(Object.entries(baseBody).map(([key, value]) => [
        key,
        value.optional(),
    ]))))
        .refine((data) => {
        if (!data.startDate || !data.endDate)
            return true;
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
    }, {
        message: "endDate must be greater than or equal to startDate.",
        path: ["endDate"],
    })
        .refine((data) => data.budgetMin === undefined ||
        data.budgetMax === undefined ||
        data.budgetMax >= data.budgetMin, {
        message: "budgetMax must be greater than or equal to budgetMin.",
        path: ["budgetMax"],
    }),
});
const getSingleTravelPlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Plan id is required."),
    }),
});
exports.TravelPlanValidation = {
    createTravelPlan: createTravelPlanSchema,
    updateTravelPlan: updateTravelPlanSchema,
    getSingleTravelPlan: getSingleTravelPlanSchema,
};
