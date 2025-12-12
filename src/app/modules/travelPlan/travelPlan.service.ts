import { ChatThreadType, NotificationType, PlanVisibility, Prisma, TripRole, TripStatus } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import {
  paginationHelper,
  IPaginationOptions,
} from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import pick from "../../shared/pick";
import { TripMemberService } from "../tripMember/tripMember.service";
import { NotificationService } from "../notification/notification.service";
import {
  travelPlanFilterableFields,
  travelPlanSearchableFields,
} from "./travelPlan.constant";
import {
  TAuthUser,
  TTravelPlanCreatePayload,
  TTravelPlanQuery,
  TTravelPlanUpdatePayload,
} from "./travelPlan.interface";

const getTotalDays = (startDate: Date, endDate: Date) => {
  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

const assertCanModifyPlan = async (authUser: TAuthUser, planId: string) => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  await TripMemberService.assertTripMemberPermission(
    authUser,
    planId,
    "canEditPlan",
    "You are not allowed to modify this plan."
  );

  return plan;
};

const assertCanViewPlan = async (authUser: TAuthUser | null, planId: string) => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check if plan is PUBLIC - anyone can view (even without auth)
  if (plan.visibility === PlanVisibility.PUBLIC) {
    return plan;
  }

  // For PRIVATE/UNLISTED plans, require authentication
  if (!authUser) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Authentication required to view this plan."
    );
  }

  // Check if user is a member
  const { member } = await TripMemberService.getTripMemberPermission(
    authUser,
    planId
  );

  if (!member) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this plan."
    );
  }

  return plan;
};

const createTravelPlan = async (
  authUser: TAuthUser,
  payload: TTravelPlanCreatePayload
) => {
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);
  const now = new Date();

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format.");
  }

  if (startDate <= now) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Start date must be a future date. Past dates are not allowed."
    );
  }

  if (endDate < startDate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "endDate must be greater than or equal to startDate."
    );
  }

  const coverPhotoUrl = payload.coverPhoto;
  const galleryUrls = payload.galleryImages || [];

  const result = await prisma.$transaction(async (tx) => {
    const plan = await tx.travelPlan.create({
      data: {
        ownerId: authUser.userId,
        title: payload.title,
        destination: payload.destination,
        origin: payload.origin,
        startDate,
        endDate,
        budgetMin: Number(payload.budgetMin),
        budgetMax: Number(payload.budgetMax),
        travelType: payload.travelType,
        visibility: payload.visibility ?? PlanVisibility.PRIVATE,
        description: payload.description,
        coverPhoto: coverPhotoUrl,
      },
    });

    await tx.tripMember.create({
      data: {
        planId: plan.id,
        userId: authUser.userId,
        role: TripRole.OWNER,
        status: TripStatus.JOINED,
        addedBy: authUser.userId,
      },
    });

    // Auto-create chat thread for the plan
    const chatThread = await tx.chatThread.create({
      data: {
        type: ChatThreadType.PLAN,
        refId: plan.id,
        title: `Chat: ${plan.title}`
      }
    });

    // Add plan owner as thread owner
    await tx.chatThreadMember.create({
      data: {
        threadId: chatThread.id,
        userId: authUser.userId,
        role: "owner"
      }
    });

    // Create media records for gallery images
    if (galleryUrls.length > 0) {
      await tx.media.createMany({
        data: galleryUrls.map(url => ({
          ownerId: authUser.userId,
          planId: plan.id,
          url,
          provider: "imgbb",
          type: "photo",
        })),
      });
    }

    return plan;
  });

  return {
    ...result,
    totalDays: getTotalDays(result.startDate, result.endDate),
  };
};

const getMyTravelPlans = async (
  authUser: TAuthUser,
  query: TTravelPlanQuery
) => {
  const filters = pick<TTravelPlanQuery, keyof TTravelPlanQuery>(
    query,
    travelPlanFilterableFields as (keyof TTravelPlanQuery)[]
  );
  const options: IPaginationOptions = {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    sortBy: query.sortBy ?? "startDate",
    sortOrder: query.sortOrder ?? "asc",
  };
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...restFilters } = filters as {
    searchTerm?: string;
    travelType?: string;
    visibility?: string;
    isFeatured?: string;
  };

  const andConditions: Prisma.TravelPlanWhereInput[] = [];

  // Only plans where user is a member (includes owner)
  andConditions.push({
    tripMembers: {
      some: {
        userId: authUser.userId,
        status: TripStatus.JOINED,
      },
    },
  });

  if (searchTerm) {
    andConditions.push({
      OR: travelPlanSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (restFilters.travelType) {
    andConditions.push({
      travelType: restFilters.travelType as any,
    });
  }

  if (restFilters.visibility) {
    andConditions.push({
      visibility: restFilters.visibility as any,
    });
  }

  if (restFilters.isFeatured) {
    const isFeatured = restFilters.isFeatured === "true";
    andConditions.push({
      isFeatured,
    });
  }

  const where: Prisma.TravelPlanWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const plans = await prisma.travelPlan.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: {
          itineraryItems: true,
          tripMembers: true,
        },
      },
    },
  });

  const total = await prisma.travelPlan.count({
    where,
  });

  const dataWithTotalDays = plans.map((plan) => ({
    ...plan,
    totalDays: getTotalDays(plan.startDate, plan.endDate),
  }));

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: dataWithTotalDays,
  };
};

const getPublicTravelPlans = async (query: TTravelPlanQuery) => {
  const filters = pick<TTravelPlanQuery, keyof TTravelPlanQuery>(
    query,
    travelPlanFilterableFields as (keyof TTravelPlanQuery)[]
  );
  
  const options: IPaginationOptions = {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    sortBy: query.sortBy ?? "startDate",
    sortOrder: query.sortOrder ?? "asc",
  };
  
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...restFilters } = filters as {
    searchTerm?: string;
    travelType?: string;
    visibility?: string;
    isFeatured?: string;
  };

  const andConditions: Prisma.TravelPlanWhereInput[] = [];

  // Only PUBLIC plans
  andConditions.push({
    visibility: PlanVisibility.PUBLIC,
  });

  if (searchTerm) {
    andConditions.push({
      OR: travelPlanSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (restFilters.travelType) {
    andConditions.push({
      travelType: restFilters.travelType as any,
    });
  }

  if (restFilters.isFeatured) {
    const isFeatured = restFilters.isFeatured === "true";
    andConditions.push({
      isFeatured,
    });
  }

  const where: Prisma.TravelPlanWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const plans = await prisma.travelPlan.findMany({
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
          profileImage: true,
        },
      },
      _count: {
        select: {
          itineraryItems: true,
          tripMembers: true,
        },
      },
    },
  });

  const total = await prisma.travelPlan.count({
    where,
  });

  const dataWithTotalDays = plans.map((plan) => ({
    ...plan,
    totalDays: getTotalDays(plan.startDate, plan.endDate),
  }));

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: dataWithTotalDays,
  };
};

const getSingleTravelPlan = async (authUser: TAuthUser | null, id: string) => {
  const plan = await assertCanViewPlan(authUser, id);

  const fullPlan = await prisma.travelPlan.findUniqueOrThrow({
    where: { id: plan.id },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
      tripMembers: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },
      itineraryItems: {
        orderBy: [{ dayIndex: "asc" }, { order: "asc" }],
      },
    },
  });

  return {
    ...fullPlan,
    totalDays: getTotalDays(fullPlan.startDate, fullPlan.endDate),
  };
};

const updateTravelPlan = async (
  authUser: TAuthUser,
  id: string,
  payload: TTravelPlanUpdatePayload
) => {
  const existing = await assertCanModifyPlan(authUser, id);

  // Get user's capabilities to enforce EDITOR restrictions
  const { capabilities } = await TripMemberService.getTripMemberPermission(
    authUser,
    id
  );

  const data: Prisma.TravelPlanUpdateInput = {};

  // EDITOR can only edit description and coverPhoto
  if (!capabilities.canEditPlan) {
    // This should not happen due to assertCanModifyPlan, but double-check
    if (
      payload.title !== undefined ||
      payload.destination !== undefined ||
      payload.origin !== undefined ||
      payload.budgetMin !== undefined ||
      payload.budgetMax !== undefined ||
      payload.travelType !== undefined ||
      payload.visibility !== undefined ||
      payload.startDate !== undefined ||
      payload.endDate !== undefined
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Editors can only modify description and cover photo."
      );
    }
  }

  // Handle gallery images if provided
  if (payload.galleryImages && payload.galleryImages.length > 0) {
    // Create media records for gallery images
    await prisma.media.createMany({
      data: payload.galleryImages.map(url => ({
        ownerId: authUser.userId,
        planId: id,
        url,
        provider: "imgbb",
        type: "photo",
      })),
    });
  }

  if (payload.title !== undefined) data.title = payload.title;
  if (payload.destination !== undefined) data.destination = payload.destination;
  if (payload.origin !== undefined) data.origin = payload.origin;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.coverPhoto !== undefined) data.coverPhoto = payload.coverPhoto;
  if (payload.budgetMin !== undefined) data.budgetMin = Number(payload.budgetMin);
  if (payload.budgetMax !== undefined) data.budgetMax = Number(payload.budgetMax);

  if (payload.travelType !== undefined) {
    data.travelType = payload.travelType;
  }

  if (payload.visibility !== undefined) {
    data.visibility = payload.visibility;
  }

  if (payload.startDate !== undefined || payload.endDate !== undefined) {
    const start = payload.startDate
      ? new Date(payload.startDate)
      : existing.startDate;
    const end = payload.endDate ? new Date(payload.endDate) : existing.endDate;
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid date format."
      );
    }

    // If startDate is being updated, it must be a future date
    if (payload.startDate !== undefined && start <= now) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Start date must be a future date. Past dates are not allowed."
      );
    }

    if (end < start) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid dates. endDate must be greater than or equal to startDate."
      );
    }

    data.startDate = start;
    data.endDate = end;
  }

  const updated = await prisma.travelPlan.update({
    where: { id },
    data,
  });

  // Notify all plan members except updater (async, don't wait)
  NotificationService.notifyPlanMembers(
    id,
    authUser.userId,
    {
      type: NotificationType.PLAN_UPDATED,
      title: "Travel plan updated",
      message: `"${updated.title}" has been updated`,
      data: {
        planId: id
      }
    }
  ).catch((error) => {
    // Log error but don't fail the update
    console.error("Failed to send notification for plan update:", error);
  });

  return {
    ...updated,
    totalDays: getTotalDays(updated.startDate, updated.endDate),
  };
};

const deleteTravelPlan = async (authUser: TAuthUser, id: string) => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check permission to delete (requires canDeletePlan capability)
  await TripMemberService.assertTripMemberPermission(
    authUser,
    id,
    "canDeletePlan",
    "You are not allowed to delete this plan."
  );

  const deleted = await prisma.travelPlan.delete({
    where: { id },
  });

  return deleted;
};

// Admin service functions
const getAllTravelPlans = async (query: TTravelPlanQuery) => {
  const filters = pick<TTravelPlanQuery, keyof TTravelPlanQuery>(
    query,
    travelPlanFilterableFields as (keyof TTravelPlanQuery)[]
  );
  
  const options: IPaginationOptions = {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    sortBy: query.sortBy ?? "startDate",
    sortOrder: query.sortOrder ?? "asc",
  };
  
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...restFilters } = filters as {
    searchTerm?: string;
    travelType?: string;
    visibility?: string;
    isFeatured?: string;
    ownerId?: string;
  };

  const andConditions: Prisma.TravelPlanWhereInput[] = [];

  // No visibility filter - return ALL plans (PUBLIC, PRIVATE, UNLISTED)

  if (searchTerm) {
    andConditions.push({
      OR: travelPlanSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (restFilters.travelType) {
    andConditions.push({
      travelType: restFilters.travelType as any,
    });
  }

  if (restFilters.visibility) {
    andConditions.push({
      visibility: restFilters.visibility as any,
    });
  }

  if (restFilters.isFeatured) {
    const isFeatured = restFilters.isFeatured === "true";
    andConditions.push({
      isFeatured,
    });
  }

  if (restFilters.ownerId) {
    andConditions.push({
      ownerId: restFilters.ownerId,
    });
  }

  const where: Prisma.TravelPlanWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const plans = await prisma.travelPlan.findMany({
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
      _count: {
        select: {
          itineraryItems: true,
          tripMembers: true,
        },
      },
    },
  });

  const total = await prisma.travelPlan.count({
    where,
  });

  const dataWithTotalDays = plans.map((plan) => ({
    ...plan,
    totalDays: getTotalDays(plan.startDate, plan.endDate),
  }));

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: dataWithTotalDays,
  };
};

const adminUpdateTravelPlan = async (
  id: string,
  payload: TTravelPlanUpdatePayload
) => {
  // Check if plan exists (no permission check for admin)
  const existing = await prisma.travelPlan.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  const data: Prisma.TravelPlanUpdateInput = {};

  // Handle gallery images if provided
  if (payload.galleryImages && payload.galleryImages.length > 0) {
    // Create media records for gallery images
    await prisma.media.createMany({
      data: payload.galleryImages.map(url => ({
        ownerId: existing.ownerId,
        planId: id,
        url,
        provider: "imgbb",
        type: "photo",
      })),
    });
  }

  if (payload.title !== undefined) data.title = payload.title;
  if (payload.destination !== undefined) data.destination = payload.destination;
  if (payload.origin !== undefined) data.origin = payload.origin;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.coverPhoto !== undefined) data.coverPhoto = payload.coverPhoto;
  if (payload.budgetMin !== undefined) data.budgetMin = Number(payload.budgetMin);
  if (payload.budgetMax !== undefined) data.budgetMax = Number(payload.budgetMax);

  if (payload.travelType !== undefined) {
    data.travelType = payload.travelType;
  }

  if (payload.visibility !== undefined) {
    data.visibility = payload.visibility;
  }

  if (payload.startDate !== undefined || payload.endDate !== undefined) {
    const start = payload.startDate
      ? new Date(payload.startDate)
      : existing.startDate;
    const end = payload.endDate ? new Date(payload.endDate) : existing.endDate;
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid date format."
      );
    }

    // If startDate is being updated, it must be a future date
    if (payload.startDate !== undefined && start <= now) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Start date must be a future date. Past dates are not allowed."
      );
    }

    if (end < start) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid dates. endDate must be greater than or equal to startDate."
      );
    }

    data.startDate = start;
    data.endDate = end;
  }

  const updated = await prisma.travelPlan.update({
    where: { id },
    data,
  });

  // Notify all plan members (async, don't wait)
  NotificationService.notifyPlanMembers(
    id,
    existing.ownerId,
    {
      type: NotificationType.PLAN_UPDATED,
      title: "Travel plan updated",
      message: `"${updated.title}" has been updated by admin`,
      data: {
        planId: id
      }
    }
  ).catch((error) => {
    // Log error but don't fail the update
    console.error("Failed to send notification for plan update:", error);
  });

  return {
    ...updated,
    totalDays: getTotalDays(updated.startDate, updated.endDate),
  };
};

const adminDeleteTravelPlan = async (id: string) => {
  // Check if plan exists (no permission check for admin)
  const plan = await prisma.travelPlan.findUnique({
    where: { id },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Delete plan directly (cascade will handle related records)
  const deleted = await prisma.travelPlan.delete({
    where: { id },
  });

  return deleted;
};

export const TravelPlanService = {
  createTravelPlan,
  getMyTravelPlans,
  getPublicTravelPlans,
  getSingleTravelPlan,
  updateTravelPlan,
  deleteTravelPlan,
  getAllTravelPlans,
  adminUpdateTravelPlan,
  adminDeleteTravelPlan,
};
