import { z } from "zod";
import { mediaTypeEnum } from "./media.constant";

const stringRequired = (message: string) => z.string({ error: () => message });

const uploadMediaSchema = z.object({
  body: z.object({
    imageUrls: z
      .array(z.string().url({ message: "Each image URL must be a valid URL." }))
      .min(1, { message: "At least one image URL is required." })
      .max(10, { message: "Maximum 10 images can be uploaded at once." }),
    planId: stringRequired("Plan ID must be a string.")
      .uuid({ message: "Plan ID must be a valid UUID." })
      .optional(),
    meetupId: stringRequired("Meetup ID must be a string.")
      .uuid({ message: "Meetup ID must be a valid UUID." })
      .optional(),
    itineraryItemId: stringRequired("Itinerary Item ID must be a string.")
      .uuid({ message: "Itinerary Item ID must be a valid UUID." })
      .optional(),
    type: z
      .enum(mediaTypeEnum as unknown as [string, ...string[]], {
        error: () => "Invalid media type.",
      })
      .optional(),
  }).refine(
    (data) => data.planId || data.meetupId || data.itineraryItemId,
    {
      message:
        "At least one of planId, meetupId, or itineraryItemId must be provided.",
    }
  ),
});

const getMediaSchema = z.object({
  params: z.object({
    id: stringRequired("Media ID is required.").uuid({
      message: "Media ID must be a valid UUID.",
    }),
  }),
});

const getMediaListSchema = z.object({
  query: z.object({
    type: z
      .enum(mediaTypeEnum as unknown as [string, ...string[]], {
        error: () => "Invalid media type.",
      })
      .optional(),
    ownerId: stringRequired("Owner ID must be a string.")
      .uuid({ message: "Owner ID must be a valid UUID." })
      .optional(),
    planId: stringRequired("Plan ID must be a string.")
      .uuid({ message: "Plan ID must be a valid UUID." })
      .optional(),
    meetupId: stringRequired("Meetup ID must be a string.")
      .uuid({ message: "Meetup ID must be a valid UUID." })
      .optional(),
    itineraryItemId: stringRequired("Itinerary Item ID must be a string.")
      .uuid({ message: "Itinerary Item ID must be a valid UUID." })
      .optional(),
    provider: stringRequired("Provider must be a string.").optional(),
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

const deleteMediaSchema = z.object({
  params: z.object({
    id: stringRequired("Media ID is required.").uuid({
      message: "Media ID must be a valid UUID.",
    }),
  }),
});

export const MediaValidation = {
  uploadMedia: uploadMediaSchema,
  getMedia: getMediaSchema,
  getMediaList: getMediaListSchema,
  deleteMedia: deleteMediaSchema,
};

