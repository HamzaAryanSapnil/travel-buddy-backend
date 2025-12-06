"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaValidation = void 0;
const zod_1 = require("zod");
const media_constant_1 = require("./media.constant");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
const uploadMediaSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: stringRequired("Plan ID must be a string.")
            .uuid({ message: "Plan ID must be a valid UUID." })
            .optional(),
        meetupId: stringRequired("Meetup ID must be a string.")
            .uuid({ message: "Meetup ID must be a valid UUID." })
            .optional(),
        itineraryItemId: stringRequired("Itinerary Item ID must be a string.")
            .uuid({ message: "Itinerary Item ID must be a valid UUID." })
            .optional(),
        type: zod_1.z
            .enum(media_constant_1.mediaTypeEnum, {
            error: () => "Invalid media type.",
        })
            .optional(),
    }).refine((data) => data.planId || data.meetupId || data.itineraryItemId, {
        message: "At least one of planId, meetupId, or itineraryItemId must be provided.",
    }),
});
const getMediaSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Media ID is required.").uuid({
            message: "Media ID must be a valid UUID.",
        }),
    }),
});
const getMediaListSchema = zod_1.z.object({
    query: zod_1.z.object({
        type: zod_1.z
            .enum(media_constant_1.mediaTypeEnum, {
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
const deleteMediaSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Media ID is required.").uuid({
            message: "Media ID must be a valid UUID.",
        }),
    }),
});
exports.MediaValidation = {
    uploadMedia: uploadMediaSchema,
    getMedia: getMediaSchema,
    getMediaList: getMediaListSchema,
    deleteMedia: deleteMediaSchema,
};
