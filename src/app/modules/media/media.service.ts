import { Prisma, Role } from "@prisma/client";
import fs from "fs/promises";
import httpStatus from "http-status";
import cloudinary from "../../helper/cloudinary";
import ApiError from "../../errors/ApiError";
import {
  paginationHelper,
  IPaginationOptions,
} from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import pick from "../../shared/pick";
import {
  mediaFilterableFields,
  allowedImageTypes,
  maxFileSize,
} from "./media.constant";
import {
  TAuthUser,
  TMediaCreatePayload,
  TMediaQuery,
  TMediaResponse,
  TMediaListResponse,
  TMediaUploadResponse,
} from "./media.interface";

/**
 * Helper: Get Cloudinary folder path based on entity type
 */
const getCloudinaryFolder = (
  planId?: string,
  meetupId?: string,
  itineraryItemId?: string
): string => {
  if (planId) {
    return `travel-buddy/plans/${planId}`;
  }
  if (meetupId) {
    return `travel-buddy/meetups/${meetupId}`;
  }
  if (itineraryItemId) {
    return `travel-buddy/itinerary/${itineraryItemId}`;
  }
  return "travel-buddy/media";
};

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

  if (
    meetup.organizerId !== authUser.userId &&
    authUser.role !== Role.ADMIN
  ) {
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
 * Upload media files
 * @param authUser - Authenticated user
 * @param files - Array of uploaded files
 * @param payload - Media creation payload
 * @returns Upload response with created media
 */
const uploadMedia = async (
  authUser: TAuthUser,
  files: Express.Multer.File[],
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

  // Validate files
  if (!files || files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No files provided.");
  }

  if (files.length > 10) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Maximum 10 files can be uploaded at once."
    );
  }

  // Validate file types and sizes
  const invalidFiles: string[] = [];
  for (const file of files) {
    if (!allowedImageTypes.includes(file.mimetype as any)) {
      invalidFiles.push(
        `${file.originalname}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`
      );
    }
    if (file.size > maxFileSize) {
      invalidFiles.push(
        `${file.originalname}: File size exceeds 5MB limit.`
      );
    }
  }

  if (invalidFiles.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid files: ${invalidFiles.join(" ")}`
    );
  }

  // Get Cloudinary folder
  const folder = getCloudinaryFolder(
    payload.planId,
    payload.meetupId,
    payload.itineraryItemId
  );

  const uploadedMedia: TMediaResponse[] = [];
  const errors: string[] = [];
  let uploadedCount = 0;
  let failedCount = 0;

  // Upload each file
  for (const file of files) {
    try {
      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "image",
      });

      // Create media record
      const media = await prisma.media.create({
        data: {
          ownerId: authUser.userId,
          planId: payload.planId || null,
          meetupId: payload.meetupId || null,
          itineraryItemId: payload.itineraryItemId || null,
          url: uploadResult.secure_url,
          provider: "cloudinary",
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
      errors.push(`${file.originalname}: ${error.message || "Upload failed"}`);
      failedCount++;
    } finally {
      // Clean up temporary file
      try {
        await fs.unlink(file.path);
      } catch {
        // Ignore errors
      }
    }
  }

  return {
    message: `Uploaded ${uploadedCount} file(s), ${failedCount} failed.`,
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
  authUser: TAuthUser,
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
  if (authUser.role !== Role.ADMIN) {
    // Users can see their own media + media from plans they're members of
    const userPlans = await prisma.tripMember.findMany({
      where: {
        userId: authUser.userId,
        status: "JOINED",
      },
      select: { planId: true },
    });

    const planIds = userPlans.map((tm) => tm.planId);

    andConditions.push({
      OR: [
        { ownerId: authUser.userId },
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

  // Get media to extract Cloudinary public_id
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: { id: true, url: true },
  });

  if (!media) {
    throw new ApiError(httpStatus.NOT_FOUND, "Media not found.");
  }

  // Extract public_id from Cloudinary URL
  // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
  const urlParts = media.url.split("/");
  const filename = urlParts[urlParts.length - 1];
  const publicId = filename.split(".")[0];
  const folderMatch = media.url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  const fullPublicId = folderMatch ? folderMatch[1].split(".")[0] : publicId;

  try {
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    // Log error but continue with database deletion
    console.error("Failed to delete from Cloudinary:", error);
  }

  // Delete from database
  await prisma.media.delete({
    where: { id: mediaId },
  });

  return {
    message: "Media deleted successfully.",
  };
};

export const MediaService = {
  uploadMedia,
  getMedia,
  getMediaList,
  deleteMedia,
};

