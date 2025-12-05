import { ChatThreadType, InvitationStatus, MeetupStatus, NotificationType, PlanVisibility, Prisma, TripStatus } from "@prisma/client";
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
  meetupFilterableFields,
  meetupSearchableFields,
} from "./meetup.constant";
import {
  TAuthUser,
  TMeetupCreatePayload,
  TMeetupUpdatePayload,
  TMeetupQuery,
  TMeetupResponse,
  TMeetupListResponse,
  TRsvpPayload,
} from "./meetup.interface";

const assertCanViewPlan = async (authUser: TAuthUser, planId: string) => {
  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
    select: {
      id: true,
      visibility: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check if plan is PUBLIC - anyone can view
  if (plan.visibility === PlanVisibility.PUBLIC) {
    return plan;
  }

  // For PRIVATE/UNLISTED plans, check if user is a member
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

const assertMeetupPermission = async (
  authUser: TAuthUser,
  meetupId: string,
  action: "update" | "delete" | "status"
) => {
  const meetup = await prisma.meetup.findUnique({
    where: { id: meetupId },
    include: {
      plan: {
        select: {
          id: true,
          ownerId: true,
        },
      },
    },
  });

  if (!meetup) {
    throw new ApiError(httpStatus.NOT_FOUND, "Meetup not found.");
  }

  // Prevent update/delete if status is COMPLETED or CANCELLED
  if (
    (action === "update" || action === "delete" || action === "status") &&
    (meetup.status === MeetupStatus.COMPLETED ||
      meetup.status === MeetupStatus.CANCELLED)
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot ${action} a meetup that is ${meetup.status.toLowerCase()}.`
    );
  }

  // Check if user is organizer
  if (meetup.organizerId === authUser.userId) {
    return meetup;
  }

  // Check if user is plan owner/admin
  if (meetup.plan.ownerId === authUser.userId || authUser.role === "ADMIN") {
    return meetup;
  }

  // Check if user is plan admin via TripMember
  const { member, capabilities } =
    await TripMemberService.getTripMemberPermission(
      authUser,
      meetup.plan.id
    );

  if (member && (member.role === "OWNER" || member.role === "ADMIN")) {
    return meetup;
  }

  throw new ApiError(
    httpStatus.FORBIDDEN,
    `You are not allowed to ${action} this meetup. Only the organizer or plan owner/admin can ${action} it.`
  );
};

const validateStatusTransition = (
  currentStatus: MeetupStatus,
  newStatus: MeetupStatus
) => {
  // Allowed transitions
  const allowedTransitions: Record<MeetupStatus, MeetupStatus[]> = {
    [MeetupStatus.PENDING]: [MeetupStatus.CONFIRMED, MeetupStatus.CANCELLED],
    [MeetupStatus.CONFIRMED]: [MeetupStatus.COMPLETED, MeetupStatus.CANCELLED],
    [MeetupStatus.COMPLETED]: [], // Cannot transition from COMPLETED
    [MeetupStatus.CANCELLED]: [], // Cannot transition from CANCELLED
  };

  if (!allowedTransitions[currentStatus].includes(newStatus)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions[currentStatus].join(", ") || "none"}.`
    );
  }
};

const createMeetup = async (
  authUser: TAuthUser,
  payload: TMeetupCreatePayload
): Promise<TMeetupResponse> => {
  // Verify plan exists and user is a member
  const plan = await prisma.travelPlan.findUnique({
    where: { id: payload.planId },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      visibility: true,
    },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check if user is a plan member (via TripMember)
  const { member } = await TripMemberService.getTripMemberPermission(
    authUser,
    payload.planId
  );

  if (!member && plan.visibility !== PlanVisibility.PUBLIC) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You must be a member of this plan to create a meetup."
    );
  }

  // Validate scheduledAt is in the future
  const scheduledAt = new Date(payload.scheduledAt);
  const now = new Date();
  if (isNaN(scheduledAt.getTime()) || scheduledAt <= now) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Scheduled date must be a valid future date."
    );
  }

  // Validate scheduledAt is within plan date range (optional but recommended)
  if (scheduledAt < plan.startDate || scheduledAt > plan.endDate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Scheduled date must be within the plan's date range."
    );
  }

  // Validate location and locationId are not both provided
  if (payload.location && payload.locationId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot provide both location and locationId. Provide only one."
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create meetup
    const meetup = await tx.meetup.create({
      data: {
        planId: payload.planId,
        organizerId: authUser.userId,
        scheduledAt,
        location: payload.location || null,
        locationId: payload.locationId || null,
        maxParticipants: payload.maxParticipants || null,
        videoRoomLink: payload.videoRoomLink || null,
        status: MeetupStatus.PENDING,
      },
    });

    // Auto-create ChatThread for meetup
    const chatThread = await tx.chatThread.create({
      data: {
        type: ChatThreadType.MEETUP,
        refId: meetup.id,
        title: `Chat: ${payload.location || "Meetup"}`,
      },
    });

    // Add organizer as thread owner
    await tx.chatThreadMember.create({
      data: {
        threadId: chatThread.id,
        userId: authUser.userId,
        role: "owner",
      },
    });

    return meetup;
  });

  // Notify plan members (MEETUP_CREATED)
  NotificationService.notifyPlanMembers(
    payload.planId,
    authUser.userId,
    {
      type: NotificationType.MEETUP_CREATED,
      title: "New meetup created",
      message: `A new meetup has been scheduled for ${plan.title}`,
      data: {
        planId: payload.planId,
        meetupId: result.id,
      },
    }
  ).catch((error) => {
    console.error("Failed to send notification for meetup creation:", error);
  });

  // Fetch created meetup with relations
  const meetup = await prisma.meetup.findUniqueOrThrow({
    where: { id: result.id },
    include: {
      organizer: {
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
      locationRel: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          country: true,
          latitude: true,
          longitude: true,
        },
      },
      _count: {
        select: {
          invitations: true,
        },
      },
    },
  });

  return {
    id: meetup.id,
    planId: meetup.planId,
    organizerId: meetup.organizerId,
    scheduledAt: meetup.scheduledAt,
    location: meetup.location,
    locationId: meetup.locationId,
    status: meetup.status,
    maxParticipants: meetup.maxParticipants,
    videoRoomLink: meetup.videoRoomLink,
    createdAt: meetup.createdAt,
    updatedAt: meetup.updatedAt,
    organizer: meetup.organizer,
    plan: {
      id: meetup.plan.id,
      title: meetup.plan.title,
      destination: meetup.plan.destination,
    },
    locationRel: meetup.locationRel,
    invitationCount: meetup._count.invitations,
  };
};

const getMeetup = async (
  authUser: TAuthUser,
  meetupId: string
): Promise<TMeetupResponse> => {
  // Load meetup with relations
  const meetup = await prisma.meetup.findUnique({
    where: { id: meetupId },
    include: {
      organizer: {
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
          visibility: true,
        },
      },
      locationRel: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          country: true,
          latitude: true,
          longitude: true,
        },
      },
      _count: {
        select: {
          invitations: true,
        },
      },
    },
  });

  if (!meetup) {
    throw new ApiError(httpStatus.NOT_FOUND, "Meetup not found.");
  }

  // Check read permission (plan visibility + membership)
  await assertCanViewPlan(authUser, meetup.planId);

  return {
    id: meetup.id,
    planId: meetup.planId,
    organizerId: meetup.organizerId,
    scheduledAt: meetup.scheduledAt,
    location: meetup.location,
    locationId: meetup.locationId,
    status: meetup.status,
    maxParticipants: meetup.maxParticipants,
    videoRoomLink: meetup.videoRoomLink,
    createdAt: meetup.createdAt,
    updatedAt: meetup.updatedAt,
    organizer: meetup.organizer,
    plan: {
      id: meetup.plan.id,
      title: meetup.plan.title,
      destination: meetup.plan.destination,
    },
    locationRel: meetup.locationRel,
    invitationCount: meetup._count.invitations,
  };
};

const getMeetups = async (
  authUser: TAuthUser,
  query: TMeetupQuery
): Promise<TMeetupListResponse> => {
  const filters = pick<TMeetupQuery, keyof TMeetupQuery>(
    query,
    meetupFilterableFields as (keyof TMeetupQuery)[]
  );

  const options: IPaginationOptions = {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    sortBy: query.sortBy ?? "scheduledAt",
    sortOrder: query.sortOrder ?? "asc",
  };

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...restFilters } = filters as {
    searchTerm?: string;
    status?: string;
    planId?: string;
    organizerId?: string;
  };

  const andConditions: Prisma.MeetupWhereInput[] = [];

  // Search in location
  if (searchTerm) {
    andConditions.push({
      OR: meetupSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Apply filters
  if (Object.keys(restFilters).length > 0) {
    andConditions.push({
      AND: Object.keys(restFilters).map((key) => ({
        [key]: {
          equals: (restFilters as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.MeetupWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.meetup.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      organizer: {
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
      locationRel: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          country: true,
          latitude: true,
          longitude: true,
        },
      },
      _count: {
        select: {
          invitations: true,
        },
      },
    },
  });

  const total = await prisma.meetup.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result.map((meetup) => ({
      id: meetup.id,
      planId: meetup.planId,
      organizerId: meetup.organizerId,
      scheduledAt: meetup.scheduledAt,
      location: meetup.location,
      locationId: meetup.locationId,
      status: meetup.status,
      maxParticipants: meetup.maxParticipants,
      videoRoomLink: meetup.videoRoomLink,
      createdAt: meetup.createdAt,
      updatedAt: meetup.updatedAt,
      organizer: meetup.organizer,
      plan: {
        id: meetup.plan.id,
        title: meetup.plan.title,
        destination: meetup.plan.destination,
      },
      locationRel: meetup.locationRel,
      invitationCount: meetup._count.invitations,
    })),
  };
};

const updateMeetup = async (
  authUser: TAuthUser,
  meetupId: string,
  payload: TMeetupUpdatePayload
): Promise<TMeetupResponse> => {
  // Load meetup and check permission
  const meetup = await assertMeetupPermission(authUser, meetupId, "update");

  // Validate location and locationId are not both provided
  if (payload.location && payload.locationId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot provide both location and locationId. Provide only one."
    );
  }

  const updateData: Prisma.MeetupUpdateInput = {};

  if (payload.scheduledAt !== undefined) {
    const scheduledAt = new Date(payload.scheduledAt);
    const now = new Date();
    if (isNaN(scheduledAt.getTime()) || scheduledAt <= now) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Scheduled date must be a valid future date."
      );
    }

    // Validate within plan date range
    const plan = await prisma.travelPlan.findUnique({
      where: { id: meetup.planId },
      select: { startDate: true, endDate: true },
    });

    if (plan && (scheduledAt < plan.startDate || scheduledAt > plan.endDate)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Scheduled date must be within the plan's date range."
      );
    }

    updateData.scheduledAt = scheduledAt;
  }

  if (payload.location !== undefined) {
    updateData.location = payload.location || null;
    // Clear locationId if location is provided
    if (payload.location) {
      updateData.locationRel = { disconnect: true };
    }
  }

  if (payload.locationId !== undefined) {
    if (payload.locationId) {
      updateData.locationRel = { connect: { id: payload.locationId } };
      updateData.location = null;
    } else {
      updateData.locationRel = { disconnect: true };
    }
  }

  if (payload.maxParticipants !== undefined) {
    if (payload.maxParticipants !== null && payload.maxParticipants <= 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Max participants must be a positive number."
      );
    }
    updateData.maxParticipants = payload.maxParticipants || null;
  }

  if (payload.videoRoomLink !== undefined) {
    updateData.videoRoomLink = payload.videoRoomLink || null;
  }

  // Update meetup
  const updated = await prisma.meetup.update({
    where: { id: meetupId },
    data: updateData,
    include: {
      organizer: {
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
      locationRel: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          country: true,
          latitude: true,
          longitude: true,
        },
      },
      _count: {
        select: {
          invitations: true,
        },
      },
    },
  });

  // Notify plan members if significant changes (MEETUP_UPDATED)
  NotificationService.notifyPlanMembers(
    meetup.planId,
    authUser.userId,
    {
      type: NotificationType.MEETUP_UPDATED,
      title: "Meetup updated",
      message: `A meetup has been updated in ${updated.plan.title}`,
      data: {
        planId: meetup.planId,
        meetupId: updated.id,
      },
    }
  ).catch((error) => {
    console.error("Failed to send notification for meetup update:", error);
  });

  return {
    id: updated.id,
    planId: updated.planId,
    organizerId: updated.organizerId,
    scheduledAt: updated.scheduledAt,
    location: updated.location,
    locationId: updated.locationId,
    status: updated.status,
    maxParticipants: updated.maxParticipants,
    videoRoomLink: updated.videoRoomLink,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    organizer: updated.organizer,
    plan: {
      id: updated.plan.id,
      title: updated.plan.title,
      destination: updated.plan.destination,
    },
    locationRel: updated.locationRel,
    invitationCount: updated._count.invitations,
  };
};

const updateMeetupStatus = async (
  authUser: TAuthUser,
  meetupId: string,
  status: MeetupStatus
): Promise<TMeetupResponse> => {
  // Load meetup and check permission
  const meetup = await assertMeetupPermission(authUser, meetupId, "status");

  // Validate status transition
  validateStatusTransition(meetup.status, status);

  // Update status
  const updated = await prisma.meetup.update({
    where: { id: meetupId },
    data: { status },
    include: {
      organizer: {
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
      locationRel: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          country: true,
          latitude: true,
          longitude: true,
        },
      },
      _count: {
        select: {
          invitations: true,
        },
      },
    },
  });

  // Notify participants if status changes to CONFIRMED
  if (status === MeetupStatus.CONFIRMED) {
    // Get all accepted invitations
    const acceptedInvitations = await prisma.invitation.findMany({
      where: {
        meetupId: meetupId,
        status: "ACCEPTED",
      },
      select: {
        toUserId: true,
      },
    });

    // Notify each participant
    await Promise.all(
      acceptedInvitations.map((invitation) =>
        NotificationService.notifyUser(invitation.toUserId, {
          type: NotificationType.MEETUP_UPDATED,
          title: "Meetup confirmed",
          message: `The meetup "${updated.plan.title}" has been confirmed`,
          data: {
            planId: meetup.planId,
            meetupId: updated.id,
          },
        })
      )
    ).catch((error) => {
      console.error("Failed to send notification for meetup status change:", error);
    });
  }

  return {
    id: updated.id,
    planId: updated.planId,
    organizerId: updated.organizerId,
    scheduledAt: updated.scheduledAt,
    location: updated.location,
    locationId: updated.locationId,
    status: updated.status,
    maxParticipants: updated.maxParticipants,
    videoRoomLink: updated.videoRoomLink,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    organizer: updated.organizer,
    plan: {
      id: updated.plan.id,
      title: updated.plan.title,
      destination: updated.plan.destination,
    },
    locationRel: updated.locationRel,
    invitationCount: updated._count.invitations,
  };
};

const deleteMeetup = async (
  authUser: TAuthUser,
  meetupId: string
): Promise<void> => {
  // Load meetup and check permission
  await assertMeetupPermission(authUser, meetupId, "delete");

  // Delete meetup (cascade deletes invitations, chat thread)
  await prisma.meetup.delete({
    where: { id: meetupId },
  });
};

const enforceMaxParticipants = async (meetupId: string): Promise<void> => {
  const meetup = await prisma.meetup.findUnique({
    where: { id: meetupId },
    select: {
      id: true,
      maxParticipants: true,
      _count: {
        select: {
          invitations: {
            where: {
              status: InvitationStatus.ACCEPTED,
            },
          },
        },
      },
    },
  });

  if (!meetup) {
    throw new ApiError(httpStatus.NOT_FOUND, "Meetup not found.");
  }

  if (meetup.maxParticipants !== null) {
    const acceptedCount = meetup._count.invitations;
    if (acceptedCount >= meetup.maxParticipants) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Meetup has reached maximum participants limit (${meetup.maxParticipants}).`
      );
    }
  }
};

const rsvp = async (
  authUser: TAuthUser,
  meetupId: string,
  payload: TRsvpPayload
) => {
  // Verify user is plan member
  const meetup = await prisma.meetup.findUnique({
    where: { id: meetupId },
    include: {
      plan: {
        select: {
          id: true,
          title: true,
          visibility: true,
        },
      },
      organizer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!meetup) {
    throw new ApiError(httpStatus.NOT_FOUND, "Meetup not found.");
  }

  // Check meetup is not CANCELLED/COMPLETED
  if (
    meetup.status === MeetupStatus.CANCELLED ||
    meetup.status === MeetupStatus.COMPLETED
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot RSVP to a meetup that is ${meetup.status.toLowerCase()}.`
    );
  }

  // Check if user is a plan member
  const { member } = await TripMemberService.getTripMemberPermission(
    authUser,
    meetup.planId
  );

  if (!member && meetup.plan.visibility !== PlanVisibility.PUBLIC) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You must be a member of this plan to RSVP to meetups."
    );
  }

  // If accepting: Check maxParticipants limit
  if (payload.status === "ACCEPTED") {
    await enforceMaxParticipants(meetupId);
  }

  // Find existing invitation
  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      meetupId: meetupId,
      fromUserId: meetup.organizerId,
      toUserId: authUser.userId,
    },
  });

  let invitation;

  if (existingInvitation) {
    // Update existing invitation
    invitation = await prisma.invitation.update({
      where: { id: existingInvitation.id },
      data: {
        status:
          payload.status === "ACCEPTED"
            ? InvitationStatus.ACCEPTED
            : InvitationStatus.DECLINED,
        respondedAt: new Date(),
      },
    });
  } else {
    // Create new invitation
    invitation = await prisma.invitation.create({
      data: {
        fromUserId: meetup.organizerId,
        toUserId: authUser.userId,
        meetupId: meetupId,
        planId: meetup.planId,
        status:
          payload.status === "ACCEPTED"
            ? InvitationStatus.ACCEPTED
            : InvitationStatus.DECLINED,
        respondedAt: new Date(),
      },
    });
  }

  // Notify organizer
  const notificationType =
    payload.status === "ACCEPTED"
      ? NotificationType.MEETUP_RSVP_ACCEPTED
      : NotificationType.MEETUP_UPDATED;

  NotificationService.notifyUser(meetup.organizerId, {
    type: notificationType,
    title:
      payload.status === "ACCEPTED"
        ? "Meetup RSVP accepted"
        : "Meetup RSVP declined",
    message: `User has ${payload.status.toLowerCase()} the RSVP for meetup in ${meetup.plan.title}`,
    data: {
      planId: meetup.planId,
      meetupId: meetup.id,
      invitationId: invitation.id,
    },
  }).catch((error) => {
    console.error("Failed to send notification for RSVP:", error);
  });

  return invitation;
};

export const MeetupService = {
  createMeetup,
  getMeetup,
  getMeetups,
  updateMeetup,
  updateMeetupStatus,
  deleteMeetup,
  rsvp,
};

