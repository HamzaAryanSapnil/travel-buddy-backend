import { z } from "zod";
import { meetupStatusEnum } from "./meetup.constant";

const stringRequired = (message: string) => z.string({ error: () => message });

const createMeetupSchema = z.object({
  body: z
    .object({
      planId: stringRequired("Plan ID is required."),
      scheduledAt: stringRequired("Scheduled date is required.").refine(
        (date) => {
          const scheduledDate = new Date(date);
          const now = new Date();
          return !isNaN(scheduledDate.getTime()) && scheduledDate > now;
        },
        {
          message: "Scheduled date must be a valid future date.",
        }
      ),
      location: stringRequired("Location must be a string.")
        .max(500, { message: "Location cannot exceed 500 characters." })
        .optional(),
      locationId: stringRequired("Location ID must be a string.")
        .uuid({ message: "Location ID must be a valid UUID." })
        .optional(),
      maxParticipants: z
        .number()
        .int({ message: "Max participants must be an integer." })
        .positive({ message: "Max participants must be a positive number." })
        .optional(),
      videoRoomLink: stringRequired("Video room link must be a string.")
        .url({ message: "Video room link must be a valid URL." })
        .optional(),
    })
    .refine(
      (data) => !data.location || !data.locationId,
      {
        message: "Cannot provide both location and locationId. Provide only one.",
        path: ["locationId"],
      }
    ),
});

const updateMeetupSchema = z.object({
  params: z.object({
    id: stringRequired("Meetup ID is required."),
  }),
  body: z
    .object({
      scheduledAt: stringRequired("Scheduled date must be a string.")
        .refine(
          (date) => {
            const scheduledDate = new Date(date);
            const now = new Date();
            return !isNaN(scheduledDate.getTime()) && scheduledDate > now;
          },
          {
            message: "Scheduled date must be a valid future date.",
          }
        )
        .optional(),
      location: stringRequired("Location must be a string.")
        .max(500, { message: "Location cannot exceed 500 characters." })
        .optional(),
      locationId: stringRequired("Location ID must be a string.")
        .uuid({ message: "Location ID must be a valid UUID." })
        .optional(),
      maxParticipants: z
        .number()
        .int({ message: "Max participants must be an integer." })
        .positive({ message: "Max participants must be a positive number." })
        .optional(),
      videoRoomLink: stringRequired("Video room link must be a string.")
        .url({ message: "Video room link must be a valid URL." })
        .optional(),
    })
    .refine(
      (data) => !data.location || !data.locationId,
      {
        message: "Cannot provide both location and locationId. Provide only one.",
        path: ["locationId"],
      }
    ),
});

const getMeetupSchema = z.object({
  params: z.object({
    id: stringRequired("Meetup ID is required."),
  }),
});

const getMeetupsSchema = z.object({
  query: z.object({
    searchTerm: stringRequired("Search term must be a string.").optional(),
    status: z
      .enum(meetupStatusEnum as unknown as [string, ...string[]], {
        error: () => "Invalid status.",
      })
      .optional(),
    planId: stringRequired("Plan ID must be a string.").optional(),
    organizerId: stringRequired("Organizer ID must be a string.").optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    sortBy: stringRequired("Sort by must be a string.").optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

const deleteMeetupSchema = z.object({
  params: z.object({
    id: stringRequired("Meetup ID is required."),
  }),
});

const updateStatusSchema = z.object({
  params: z.object({
    id: stringRequired("Meetup ID is required."),
  }),
  body: z.object({
    status: z.enum(meetupStatusEnum as unknown as [string, ...string[]], {
      error: () => "Invalid status. Must be PENDING, CONFIRMED, COMPLETED, or CANCELLED.",
    }),
  }),
});

const rsvpSchema = z.object({
  params: z.object({
    id: stringRequired("Meetup ID is required."),
  }),
  body: z.object({
    status: z.enum(["ACCEPTED", "DECLINED"] as const, {
      error: () => "Invalid RSVP status. Must be ACCEPTED or DECLINED.",
    }),
  }),
});

export const MeetupValidation = {
  createMeetup: createMeetupSchema,
  updateMeetup: updateMeetupSchema,
  getMeetup: getMeetupSchema,
  getMeetups: getMeetupsSchema,
  deleteMeetup: deleteMeetupSchema,
  updateStatus: updateStatusSchema,
  rsvp: rsvpSchema,
};

