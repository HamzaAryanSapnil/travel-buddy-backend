import { z } from "zod";

const createBookingSchema = z.object({
  body: z.object({
    planId: z.string().uuid({ message: "Valid plan ID is required." }),
    message: z.string().max(500).optional(),
  }),
});

const respondBookingSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"], {
      message: "Status must be APPROVED or REJECTED.",
    }),
  }),
  params: z.object({
    bookingId: z.string().uuid({ message: "Valid booking ID is required." }),
  }),
});

const getBookingsByPlanSchema = z.object({
  params: z.object({
    planId: z.string().uuid({ message: "Valid plan ID is required." }),
  }),
});

const cancelBookingSchema = z.object({
  params: z.object({
    bookingId: z.string().uuid({ message: "Valid booking ID is required." }),
  }),
});

export const TripBookingValidation = {
  createBooking: createBookingSchema,
  respondBooking: respondBookingSchema,
  getBookingsByPlan: getBookingsByPlanSchema,
  cancelBooking: cancelBookingSchema,
};

