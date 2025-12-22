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
        coverPhoto: zod_1.z
            .string()
            .url({ message: "Cover photo must be a valid URL." })
            .optional(),
        galleryImages: zod_1.z
            .array(zod_1.z.string().url({ message: "Each gallery image must be a valid URL." }))
            .optional(),
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
        coverPhoto: zod_1.z
            .string()
            .url({ message: "Cover photo must be a valid URL." })
            .optional(),
        galleryImages: zod_1.z
            .array(zod_1.z.string().url({ message: "Each gallery image must be a valid URL." }))
            .optional(),
    }),
});
const getSingleTravelPlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, { message: "Plan id is required." }),
    }),
});
const getAllTravelPlansSchema = zod_1.z.object({
    query: zod_1.z.object({
        searchTerm: zod_1.z.string().optional(),
        travelType: zod_1.z
            .enum(["SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP"])
            .optional(),
        visibility: zod_1.z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
        isFeatured: zod_1.z.string().optional(),
        ownerId: zod_1.z
            .string()
            .uuid({ message: "Owner ID must be a valid UUID." })
            .optional(),
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
    isFeatured: zod_1.z.boolean().optional(),
});
const adminUpdateTravelPlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, { message: "Plan id is required." }),
    }),
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
        coverPhoto: zod_1.z
            .url({ message: "Cover photo must be a valid URL." })
            .optional(),
        galleryImages: zod_1.z
            .array(zod_1.z.url({ message: "Each gallery image must be a valid URL." }))
            .optional(),
        isFeatured: zod_1.z.boolean().optional(),
    }),
});
exports.TravelPlanValidation = {
    createTravelPlan: createTravelPlanSchema,
    updateTravelPlan: updateTravelPlanSchema,
    getSingleTravelPlan: getSingleTravelPlanSchema,
    getAllTravelPlans: getAllTravelPlansSchema,
    adminUpdateTravelPlan: adminUpdateTravelPlanSchema,
};
