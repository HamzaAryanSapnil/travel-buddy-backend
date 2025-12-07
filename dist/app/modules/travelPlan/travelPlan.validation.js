"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelPlanValidation = void 0;
const zod_1 = require("zod");
const createTravelPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, { message: "Title is required." }),
        destination: zod_1.z.string().min(1, { message: "Destination is required." }),
        origin: zod_1.z.string().optional(),
        startDate: zod_1.z.string().min(1, { message: "StartDate is required." }),
        endDate: zod_1.z.string().min(1, { message: "EndDate is required." }),
        travelType: zod_1.z.enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"]),
        budgetMin: zod_1.z.number().optional(),
        budgetMax: zod_1.z.number().optional(),
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
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        travelType: zod_1.z
            .enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"])
            .optional(),
        budgetMin: zod_1.z.number().optional(),
        budgetMax: zod_1.z.number().optional(),
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
