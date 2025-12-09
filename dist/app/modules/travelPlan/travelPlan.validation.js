"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelPlanValidation = void 0;
const zod_1 = require("zod");
const createTravelPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, { message: "Title is required." }),
        destination: zod_1.z.string().min(1, { message: "Destination is required." }),
        origin: zod_1.z.string().optional(),
        startDate: zod_1.z
            .string()
            .min(1, { message: "StartDate is required." })
            .refine((date) => {
            const startDate = new Date(date);
            const now = new Date();
            return !isNaN(startDate.getTime()) && startDate > now;
        }, {
            message: "Start date must be a future date. Past dates are not allowed.",
        }),
        endDate: zod_1.z.string().min(1, { message: "EndDate is required." }),
        travelType: zod_1.z.enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"]),
        budgetMin: zod_1.z.preprocess((val) => (val ? Number(val) : undefined), zod_1.z.number().optional()),
        budgetMax: zod_1.z.preprocess((val) => (val ? Number(val) : undefined), zod_1.z.number().optional()),
        visibility: zod_1.z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
        description: zod_1.z.string().optional(),
        coverPhoto: zod_1.z.string().optional(),
    }),
});
const updateTravelPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        destination: zod_1.z.string().optional(),
        origin: zod_1.z.string().optional(),
        startDate: zod_1.z
            .string()
            .optional()
            .refine((date) => {
            if (!date)
                return true; // Optional field, skip validation if not provided
            const startDate = new Date(date);
            const now = new Date();
            return !isNaN(startDate.getTime()) && startDate > now;
        }, {
            message: "Start date must be a future date. Past dates are not allowed.",
        }),
        endDate: zod_1.z.string().optional(),
        travelType: zod_1.z
            .enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"])
            .optional(),
        budgetMin: zod_1.z.preprocess((val) => (val ? Number(val) : undefined), zod_1.z.number().optional()),
        budgetMax: zod_1.z.preprocess((val) => (val ? Number(val) : undefined), zod_1.z.number().optional()),
        visibility: zod_1.z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
        description: zod_1.z.string().optional(),
        coverPhoto: zod_1.z.string().optional(),
    }),
});
const getSingleTravelPlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, { message: "Plan id is required." }),
    }),
});
exports.TravelPlanValidation = {
    createTravelPlan: createTravelPlanSchema,
    updateTravelPlan: updateTravelPlanSchema,
    getSingleTravelPlan: getSingleTravelPlanSchema,
};
