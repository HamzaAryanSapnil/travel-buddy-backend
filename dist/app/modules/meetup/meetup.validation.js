"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetupValidation = void 0;
const zod_1 = require("zod");
const meetup_constant_1 = require("./meetup.constant");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
const createMeetupSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        planId: stringRequired("Plan ID is required."),
        scheduledAt: stringRequired("Scheduled date is required.").refine((date) => {
            const scheduledDate = new Date(date);
            const now = new Date();
            return !isNaN(scheduledDate.getTime()) && scheduledDate > now;
        }, {
            message: "Scheduled date must be a valid future date.",
        }),
        location: stringRequired("Location must be a string.")
            .max(500, { message: "Location cannot exceed 500 characters." })
            .optional(),
        locationId: stringRequired("Location ID must be a string.")
            .uuid({ message: "Location ID must be a valid UUID." })
            .optional(),
        maxParticipants: zod_1.z
            .number()
            .int({ message: "Max participants must be an integer." })
            .positive({ message: "Max participants must be a positive number." })
            .optional(),
        videoRoomLink: stringRequired("Video room link must be a string.")
            .url({ message: "Video room link must be a valid URL." })
            .optional(),
    })
        .refine((data) => !data.location || !data.locationId, {
        message: "Cannot provide both location and locationId. Provide only one.",
        path: ["locationId"],
    }),
});
const updateMeetupSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Meetup ID is required."),
    }),
    body: zod_1.z
        .object({
        scheduledAt: stringRequired("Scheduled date must be a string.")
            .refine((date) => {
            const scheduledDate = new Date(date);
            const now = new Date();
            return !isNaN(scheduledDate.getTime()) && scheduledDate > now;
        }, {
            message: "Scheduled date must be a valid future date.",
        })
            .optional(),
        location: stringRequired("Location must be a string.")
            .max(500, { message: "Location cannot exceed 500 characters." })
            .optional(),
        locationId: stringRequired("Location ID must be a string.")
            .uuid({ message: "Location ID must be a valid UUID." })
            .optional(),
        maxParticipants: zod_1.z
            .number()
            .int({ message: "Max participants must be an integer." })
            .positive({ message: "Max participants must be a positive number." })
            .optional(),
        videoRoomLink: stringRequired("Video room link must be a string.")
            .url({ message: "Video room link must be a valid URL." })
            .optional(),
    })
        .refine((data) => !data.location || !data.locationId, {
        message: "Cannot provide both location and locationId. Provide only one.",
        path: ["locationId"],
    }),
});
const getMeetupSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Meetup ID is required."),
    }),
});
const getMeetupsSchema = zod_1.z.object({
    query: zod_1.z.object({
        searchTerm: stringRequired("Search term must be a string.").optional(),
        status: zod_1.z
            .enum(meetup_constant_1.meetupStatusEnum, {
            error: () => "Invalid status.",
        })
            .optional(),
        planId: stringRequired("Plan ID must be a string.").optional(),
        organizerId: stringRequired("Organizer ID must be a string.").optional(),
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        sortBy: stringRequired("Sort by must be a string.").optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
});
const deleteMeetupSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Meetup ID is required."),
    }),
});
const updateStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Meetup ID is required."),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(meetup_constant_1.meetupStatusEnum, {
            error: () => "Invalid status. Must be PENDING, CONFIRMED, COMPLETED, or CANCELLED.",
        }),
    }),
});
const rsvpSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Meetup ID is required."),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(["ACCEPTED", "DECLINED"], {
            error: () => "Invalid RSVP status. Must be ACCEPTED or DECLINED.",
        }),
    }),
});
exports.MeetupValidation = {
    createMeetup: createMeetupSchema,
    updateMeetup: updateMeetupSchema,
    getMeetup: getMeetupSchema,
    getMeetups: getMeetupsSchema,
    deleteMeetup: deleteMeetupSchema,
    updateStatus: updateStatusSchema,
    rsvp: rsvpSchema,
};
