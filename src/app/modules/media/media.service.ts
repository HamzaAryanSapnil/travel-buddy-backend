import { Prisma, Role, PlanVisibility } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import {
  paginationHelper,
  IPaginationOptions,
} from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import pick from "../../shared/pick";
import { mediaFilterableFields } from "./media.constant";
import {
  TAuthUser,
  TMediaCreatePayload,
  TMediaQuery,
  TMediaResponse,
  TMediaListResponse,
  TMediaUploadResponse,
  TPublicGalleryResponse,
} from "./media.interface";

/**
 * Helper: Verify user owns the plan
 */
const verifyPlanOwnership = async (
  authUser: TAuthUser,
  planId: string
): Promise<void> => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
    select: { id: true, ownerId: true },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  if (plan.ownerId !== authUser.userId && authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to upload media to this plan. Only the plan owner can upload media."
    );
  }
};

/**
 * Helper: Verify user is the meetup organizer
 */
const verifyMeetupOwnership = async (
  authUser: TAuthUser,
  meetupId: string
): Promise<void> => {
  const meetup = await prisma.meetup.findUnique({
    where: { id: meetupId },
    select: { id: true, organizerId: true },
  });

  if (!meetup) {
    throw new ApiError(httpStatus.NOT_FOUND, "Meetup not found.");
  }

  if (meetup.organizerId !== authUser.userId && authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to upload media to this meetup. Only the organizer can upload media."
    );
  }
};

/**
 * Helper: Verify user owns the itinerary item's plan
 */
const verifyItineraryItemOwnership = async (
  authUser: TAuthUser,
  itineraryItemId: string
): Promise<void> => {
  const itineraryItem = await prisma.itineraryItem.findUnique({
    where: { id: itineraryItemId },
    include: {
      plan: {
        select: { id: true, ownerId: true },
      },
    },
  });

  if (!itineraryItem) {
    throw new ApiError(httpStatus.NOT_FOUND, "Itinerary item not found.");
  }

  if (
    itineraryItem.plan.ownerId !== authUser.userId &&
    authUser.role !== Role.ADMIN
  ) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to upload media to this itinerary item. Only the plan owner can upload media."
    );
  }
};

/**
 * Helper: Verify user owns the media
 */
const verifyMediaOwnership = async (
  authUser: TAuthUser,
  mediaId: string
): Promise<void> => {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: { id: true, ownerId: true },
  });

  if (!media) {
    throw new ApiError(httpStatus.NOT_FOUND, "Media not found.");
  }

  if (media.ownerId !== authUser.userId && authUser.role !== Role.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to delete this media. Only the owner can delete media."
    );
  }
};

/**
 * Helper: Verify user has access to view media (owner or plan member)
 */
const verifyMediaAccess = async (
  authUser: TAuthUser,
  media: {
    ownerId: string;
    planId: string | null;
    meetupId: string | null;
    itineraryItemId: string | null;
  }
): Promise<void> => {
  // Owner can always view
  if (media.ownerId === authUser.userId || authUser.role === Role.ADMIN) {
    return;
  }

  // If media is associated with a plan, check if user is a plan member
  if (media.planId) {
    const member = await prisma.tripMember.findFirst({
      where: {
        planId: media.planId,
        userId: authUser.userId,
        status: "JOINED",
      },
    });

    if (member) {
      return;
    }
  }

  // If media is associated with a meetup, check if user is a plan member
  if (media.meetupId) {
    const meetup = await prisma.meetup.findUnique({
      where: { id: media.meetupId },
      select: { planId: true },
    });

    if (meetup) {
      const member = await prisma.tripMember.findFirst({
        where: {
          planId: meetup.planId,
          userId: authUser.userId,
          status: "JOINED",
        },
      });

      if (member) {
        return;
      }
    }
  }

  // If media is associated with an itinerary item, check if user is a plan member
  if (media.itineraryItemId) {
    const itineraryItem = await prisma.itineraryItem.findUnique({
      where: { id: media.itineraryItemId },
      select: { planId: true },
    });

    if (itineraryItem) {
      const member = await prisma.tripMember.findFirst({
        where: {
          planId: itineraryItem.planId,
          userId: authUser.userId,
          status: "JOINED",
        },
      });

      if (member) {
        return;
      }
    }
  }

  throw new ApiError(
    httpStatus.FORBIDDEN,
    "You don't have permission to view this media."
  );
};

/**
 * Upload media from image URLs
 * @param authUser - Authenticated user
 * @param payload - Media creation payload with image URLs
 * @returns Upload response with created media
 */
const uploadMedia = async (
  authUser: TAuthUser,
  payload: TMediaCreatePayload
): Promise<TMediaUploadResponse> => {
  // Validate at least one entity ID is provided
  if (!payload.planId && !payload.meetupId && !payload.itineraryItemId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one of planId, meetupId, or itineraryItemId must be provided."
    );
  }

  // Verify ownership
  if (payload.planId) {
    await verifyPlanOwnership(authUser, payload.planId);
  }
  if (payload.meetupId) {
    await verifyMeetupOwnership(authUser, payload.meetupId);
  }
  if (payload.itineraryItemId) {
    await verifyItineraryItemOwnership(authUser, payload.itineraryItemId);
  }

  // Validate image URLs
  if (!payload.imageUrls || payload.imageUrls.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No image URLs provided.");
  }

  if (payload.imageUrls.length > 10) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Maximum 10 images can be uploaded at once."
    );
  }

  const uploadedMedia: TMediaResponse[] = [];
  const errors: string[] = [];
  let uploadedCount = 0;
  let failedCount = 0;

  // Create media records for each URL
  for (const imageUrl of payload.imageUrls) {
    try {
      // Create media record directly with URL
      const media = await prisma.media.create({
        data: {
          ownerId: authUser.userId,
          planId: payload.planId || null,
          meetupId: payload.meetupId || null,
          itineraryItemId: payload.itineraryItemId || null,
          url: imageUrl,
          provider: "imgbb",
          type: payload.type || "photo",
        },
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
            },
          },
          plan: {
            select: {
              id: true,
              title: true,
              destination: true,
            },
          },
          meetup: {
            select: {
              id: true,
              scheduledAt: true,
              location: true,
            },
          },
          itineraryItem: {
            select: {
              id: true,
              title: true,
              dayIndex: true,
            },
          },
        },
      });

      uploadedMedia.push(media as any);
      uploadedCount++;
    } catch (error: any) {
      errors.push(
        `${imageUrl}: ${error.message || "Failed to create media record"}`
      );
      failedCount++;
    }
  }

  return {
    message: `Uploaded ${uploadedCount} image(s), ${failedCount} failed.`,
    uploadedCount,
    failedCount,
    media: uploadedMedia,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Get single media by ID
 * @param authUser - Authenticated user
 * @param mediaId - Media ID
 * @returns Media details
 */
const getMedia = async (
  authUser: TAuthUser,
  mediaId: string
): Promise<TMediaResponse> => {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
      plan: {
        select: {
          id: true,
          title: true,
          destination: true,
        },
      },
      meetup: {
        select: {
          id: true,
          scheduledAt: true,
          location: true,
        },
      },
      itineraryItem: {
        select: {
          id: true,
          title: true,
          dayIndex: true,
        },
      },
    },
  });

  if (!media) {
    throw new ApiError(httpStatus.NOT_FOUND, "Media not found.");
  }

  // Verify access
  await verifyMediaAccess(authUser, media);

  return media as any;
};

/**
 * Get paginated list of media
 * @param authUser - Authenticated user
 * @param query - Query parameters
 * @returns Paginated media list
 */
const getMediaList = async (
  authUser: TAuthUser | null,
  query: TMediaQuery
): Promise<TMediaListResponse> => {
  // Pagination
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy || "createdAt",
      sortOrder: query.sortOrder || "desc",
    });

  // Filters
  const filters = pick<TMediaQuery, keyof TMediaQuery>(
    query,
    mediaFilterableFields as (keyof TMediaQuery)[]
  );

  const andConditions: Prisma.MediaWhereInput[] = [];

  // Permission-based filtering
  if (authUser && authUser.role !== Role.ADMIN) {
    // Users can see their own media + media from plans they're members of
    const userPlans = await prisma.tripMember.findMany({
      where: {
        userId: authUser!.userId,
        status: "JOINED",
      },
      select: { planId: true },
    });

    const planIds = userPlans.map((tm) => tm.planId);

    andConditions.push({
      OR: [
        { ownerId: authUser!.userId },
        { planId: { in: planIds } },
        {
          meetup: {
            planId: { in: planIds },
          },
        },
        {
          itineraryItem: {
            planId: { in: planIds },
          },
        },
      ],
    });
  }

  // Apply filters
  if (filters.type) {
    andConditions.push({ type: filters.type });
  }
  if (filters.ownerId) {
    andConditions.push({ ownerId: filters.ownerId });
  }
  if (filters.planId) {
    andConditions.push({ planId: filters.planId });
  }
  if (filters.meetupId) {
    andConditions.push({ meetupId: filters.meetupId });
  }
  if (filters.itineraryItemId) {
    andConditions.push({ itineraryItemId: filters.itineraryItemId });
  }
  if (filters.provider) {
    andConditions.push({ provider: filters.provider });
  }

  const where: Prisma.MediaWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Get media
  const media = await prisma.media.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
      plan: {
        select: {
          id: true,
          title: true,
          destination: true,
        },
      },
      meetup: {
        select: {
          id: true,
          scheduledAt: true,
          location: true,
        },
      },
      itineraryItem: {
        select: {
          id: true,
          title: true,
          dayIndex: true,
        },
      },
    },
  });

  // Get total count
  const total = await prisma.media.count({ where });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: media as any[],
  };
};

/**
 * Delete media
 * @param authUser - Authenticated user
 * @param mediaId - Media ID
 * @returns Success message
 */
const deleteMedia = async (
  authUser: TAuthUser,
  mediaId: string
): Promise<{ message: string }> => {
  // Verify ownership
  await verifyMediaOwnership(authUser, mediaId);

  // Get media to verify it exists
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: { id: true, url: true, provider: true },
  });

  if (!media) {
    throw new ApiError(httpStatus.NOT_FOUND, "Media not found.");
  }

  // Note: imgBB handles image deletion on their side
  // For cloudinary images, deletion was handled separately
  // We only need to delete from database

  // Delete from database
  await prisma.media.delete({
    where: { id: mediaId },
  });

  return {
    message: "Media deleted successfully.",
  };
};

/**
 * Get public gallery (homepage gallery section)
 * Returns media from PUBLIC travel plans only
 * @param query - Query parameters (limit, type)
 * @returns Public gallery response
 */
const getPublicGallery = async (query: {
  limit?: number;
  type?: "photo" | "video";
}): Promise<TPublicGalleryResponse> => {
  const limit = Number(query.limit) || 20;
  const type = query.type || "photo";

  // Get all PUBLIC plan IDs
  const publicPlans = await prisma.travelPlan.findMany({
    where: { visibility: PlanVisibility.PUBLIC },
    select: { id: true },
  });

  const publicPlanIds = publicPlans.map((p) => p.id);

  if (publicPlanIds.length === 0) {
    return {
      data: [],
      meta: {
        page: 1,
        limit: limit,
        total: 0,
      },
    };
  }

  // Get media from PUBLIC plans
  const media = await prisma.media.findMany({
    where: {
      planId: { in: publicPlanIds },
      type: type,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      plan: {
        select: {
          id: true,
          title: true,
          destination: true,
        },
      },
    },
  });

  // Get total count for meta
  const total = await prisma.media.count({
    where: {
      planId: { in: publicPlanIds },
      type: type,
    },
  });

  return {
    data: media.map((m) => ({
      id: m.id,
      url: m.url,
      planId: m.planId,
      planTitle: m.plan?.title || null,
      destination: m.plan?.destination || null,
      createdAt: m.createdAt,
    })),
    meta: {
      page: 1,
      limit: limit,
      total: total,
    },
  };
};

export const MediaService = {
  uploadMedia,
  getMedia,
  getMediaList,
  deleteMedia,
  getPublicGallery,
};
