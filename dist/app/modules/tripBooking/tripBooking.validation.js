"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripBookingValidation = void 0;
const zod_1 = require("zod");
const createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: zod_1.z.string().uuid({ message: "Valid plan ID is required." }),
        message: zod_1.z.string().max(500).optional(),
    }),
});
const respondBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(["APPROVED", "REJECTED"], {
            message: "Status must be APPROVED or REJECTED.",
        }),
    }),
    params: zod_1.z.object({
        bookingId: zod_1.z.string().uuid({ message: "Valid booking ID is required." }),
    }),
});
const getBookingsByPlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        planId: zod_1.z.string().uuid({ message: "Valid plan ID is required." }),
    }),
});
const cancelBookingSchema = zod_1.z.object({
    params: zod_1.z.object({
        bookingId: zod_1.z.string().uuid({ message: "Valid booking ID is required." }),
    }),
});
exports.TripBookingValidation = {
    createBooking: createBookingSchema,
    respondBooking: respondBookingSchema,
    getBookingsByPlan: getBookingsByPlanSchema,
    cancelBooking: cancelBookingSchema,
};
