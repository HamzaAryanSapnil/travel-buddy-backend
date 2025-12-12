import { Prisma, Role, UserStatus } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import {
  paginationHelper,
  IPaginationOptions,
} from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import pick from "../../shared/pick";
import { userFilterableFields, userSearchableFields } from "./user.constant";
import {
  TAuthUser,
  TReviewQuery,
  TTravelPlanQuery,
  TUserProfileUpdate,
} from "./user.interface";

const defaultUserSelect = {
  id: true,
  email: true,
  fullName: true,
  profileImage: true,
  bio: true,
  role: true,
  location: true,
  interests: true,
  visitedCountries: true,
  isVerified: true,
  status: true,
  avgRating: true,
  createdAt: true,
};

const getMyProfile = async (authUser: TAuthUser) => {
  return prisma.user.findUniqueOrThrow({
    where: {
      id: authUser.userId,
    },
    select: defaultUserSelect,
  });
};

const updateMyProfile = async (
  authUser: TAuthUser,
  payload: TUserProfileUpdate
) => {
  const data: Prisma.UserUpdateInput = {};

  if (payload.fullName !== undefined) {
    data.fullName = payload.fullName;
  }
  if (payload.bio !== undefined) {
    data.bio = payload.bio;
  }
  if (payload.location !== undefined) {
    data.location = payload.location;
  }
  if (payload.interests !== undefined) {
    data.interests = payload.interests;
  }
  if (payload.visitedCountries !== undefined) {
    data.visitedCountries = payload.visitedCountries;
  }
  if (payload.profileImage !== undefined) {
    data.profileImage = payload.profileImage;
  }

  return prisma.user.update({
    where: {
      id: authUser.userId,
    },
    data,
    select: defaultUserSelect,
  });
};

const updateProfilePhoto = async (
  authUser: TAuthUser,
  profileImageUrl?: string
) => {
  if (!profileImageUrl) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Profile image URL is required.");
  }

  const user = await prisma.user.update({
    where: {
      id: authUser.userId,
    },
    data: {
      profileImage: profileImageUrl,
    },
    select: {
      id: true,
      profileImage: true,
    },
  });

  return user;
};

const normalizeOrder = (sortOrder: string | undefined): Prisma.SortOrder =>
  sortOrder === "asc" ? "asc" : "desc";

const buildOrderBy = <
  T extends
    | Prisma.TravelPlanOrderByWithRelationInput
    | Prisma.ReviewOrderByWithRelationInput
    | Prisma.UserOrderByWithRelationInput,
>(
  sortBy: string,
  sortOrder: string | undefined
) => ({
  [sortBy]: normalizeOrder(sortOrder),
});

const getMyTravelPlans = async (
  authUser: TAuthUser,
  query: TTravelPlanQuery
) => {
  const options: IPaginationOptions = {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy || "startDate",
    sortOrder: query.sortOrder || "asc",
  };
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const now = new Date();
  const where: Prisma.TravelPlanWhereInput = {
    ownerId: authUser.userId,
  };

  if (query.type === "future") {
    where.startDate = { gte: now };
  } else if (query.type === "past") {
    where.endDate = { lt: now };
  }

  const plans = await prisma.travelPlan.findMany({
    where,
    skip,
    take: limit,
    orderBy: buildOrderBy<Prisma.TravelPlanOrderByWithRelationInput>(
      sortBy,
      sortOrder
    ),
    include: {
      itineraryItems: true,
      tripMembers: true,
    },
  });

  const total = await prisma.travelPlan.count({
    where,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: plans,
  };
};

const getMyReviews = async (authUser: TAuthUser, query: TReviewQuery) => {
  const options: IPaginationOptions = {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy || "createdAt",
    sortOrder: query.sortOrder || "desc",
  };
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const reviewType = query.reviewType || "received";
  const where: Prisma.ReviewWhereInput =
    reviewType === "given"
      ? { reviewerId: authUser.userId }
      : { reviewedUserId: authUser.userId };

  const reviews = await prisma.review.findMany({
    where,
    skip,
    take: limit,
    orderBy: buildOrderBy<Prisma.ReviewOrderByWithRelationInput>(
      sortBy,
      sortOrder
    ),
    include: {
      reviewer: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
      reviewedUser: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
      plan: {
        select: {
          id: true,
          title: true,
          destination: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  const total = await prisma.review.count({
    where,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: reviews,
  };
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const filters = pick(query, userFilterableFields);
  const options: IPaginationOptions = {
    page: query.page as string | number,
    limit: query.limit as string | number,
    sortBy: (query.sortBy as string) || "createdAt",
    sortOrder: (query.sortOrder as "asc" | "desc") || "desc",
  };
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...restFilters } = filters as {
    searchTerm?: string;
    status?: string;
    role?: string;
    isVerified?: string;
  };

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (restFilters.status) {
    andConditions.push({
      status: restFilters.status as Prisma.EnumUserStatusFilter["equals"],
    });
  }

  if (restFilters.role) {
    andConditions.push({
      role: restFilters.role as Prisma.EnumRoleFilter["equals"],
    });
  }

  if (restFilters.isVerified) {
    const isVerified = restFilters.isVerified === "true";
    andConditions.push({
      isVerified,
    });
  }

  const where: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: buildOrderBy<Prisma.UserOrderByWithRelationInput>(
      sortBy,
      sortOrder
    ),
    select: defaultUserSelect,
  });

  const total = await prisma.user.count({
    where,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: users,
  };
};

const updateUserStatus = async (userId: string, status: UserStatus) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
    select: defaultUserSelect,
  });
};

const verifyUser = async (userId: string, isVerified: boolean) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isVerified,
    },
    select: defaultUserSelect,
  });
};

const updateUserRole = async (userId: string, role: Role) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
    select: defaultUserSelect,
  });
};

const softDeleteUser = async (userId: string) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: "DELETED",
    },
    select: defaultUserSelect,
  });
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  updateProfilePhoto,
  getMyTravelPlans,
  getMyReviews,
  getAllUsers,
  updateUserStatus,
  verifyUser,
  updateUserRole,
  softDeleteUser,
};
