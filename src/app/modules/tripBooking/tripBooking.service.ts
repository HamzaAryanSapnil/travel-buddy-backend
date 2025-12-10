import {
  BookingStatus,
  NotificationType,
  PlanVisibility,
  TripRole,
  TripStatus,
} from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { NotificationService } from "../notification/notification.service";
import { TripMemberService } from "../tripMember/tripMember.service";
import { TAuthUser } from "../tripMember/tripMember.interface";
import {
  TCreateBookingPayload,
  TRespondBookingPayload,
} from "./tripBooking.interface";

/**
 * User sends a join request to a travel plan
 */
const createBookingRequest = async (
  authUser: TAuthUser,
  payload: TCreateBookingPayload
) => {
  // Validate plan exists and is PUBLIC or UNLISTED
  const plan = await prisma.travelPlan.findUnique({
    where: { id: payload.planId },
    select: {
      id: true,
      title: true,
      visibility: true,
      ownerId: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check plan visibility (must be PUBLIC or UNLISTED)
  if (plan.visibility === PlanVisibility.PRIVATE) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Cannot request to join a private plan. You must receive an invitation."
    );
  }

  // Check if user is already a member
  const existingMember = await prisma.tripMember.findFirst({
    where: {
      planId: payload.planId,
      userId: authUser.userId,
      status: TripStatus.JOINED,
    },
  });

  if (existingMember) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You are already a member of this plan."
    );
  }

  // Check if there's already a pending request
  const existingRequest = await prisma.tripBooking.findFirst({
    where: {
      planId: payload.planId,
      userId: authUser.userId,
      status: BookingStatus.PENDING,
    },
  });

  if (existingRequest) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You already have a pending request for this plan."
    );
  }

  // Create the booking request
  const booking = await prisma.tripBooking.create({
    data: {
      planId: payload.planId,
      userId: authUser.userId,
      message: payload.message,
      status: BookingStatus.PENDING,
    },
    include: {
      plan: {
        select: {
          id: true,
          title: true,
          destination: true,
          startDate: true,
          coverPhoto: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      },
    },
  });

  // Notify plan owner
  NotificationService.notifyUser(plan.ownerId, {
    type: NotificationType.INVITATION_RECEIVED,
    title: "New join request for your travel plan",
    message: `${booking.user.fullName || booking.user.email} wants to join "${
      plan.title
    }"`,
    data: {
      planId: payload.planId,
      bookingId: booking.id,
      userId: authUser.userId,
    },
  }).catch((error) => {
    console.error("Failed to send booking request notification:", error);
  });

  // Also notify plan admins
  const planAdmins = await prisma.tripMember.findMany({
    where: {
      planId: payload.planId,
      role: TripRole.ADMIN,
      status: TripStatus.JOINED,
    },
    select: { userId: true },
  });

  for (const admin of planAdmins) {
    NotificationService.notifyUser(admin.userId, {
      type: NotificationType.INVITATION_RECEIVED,
      title: "New join request for your travel plan",
      message: `${booking.user.fullName || booking.user.email} wants to join "${
        plan.title
      }"`,
      data: {
        planId: payload.planId,
        bookingId: booking.id,
        userId: authUser.userId,
      },
    }).catch((error) => {
      console.error("Failed to send booking request notification:", error);
    });
  }

  return booking;
};

/**
 * User views their outgoing requests
 */
const getMyRequests = async (authUser: TAuthUser) => {
  const bookings = await prisma.tripBooking.findMany({
    where: {
      userId: authUser.userId,
    },
    include: {
      plan: {
        select: {
          id: true,
          title: true,
          destination: true,
          startDate: true,
          endDate: true,
          coverPhoto: true,
          visibility: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return bookings;
};

/**
 * Plan owner/admin views incoming requests
 */
const getBookingsByPlan = async (authUser: TAuthUser, planId: string) => {
  // Check if plan exists
  const plan = await prisma.travelPlan.findUnique({
    where: { id: planId },
    select: { id: true, title: true },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
  }

  // Check if user has permission to manage members (owner or admin)
  const { capabilities } = await TripMemberService.getTripMemberPermission(
    authUser,
    planId
  );

  if (!capabilities.canManageMembers) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to view booking requests for this plan."
    );
  }

  // Get all pending requests for this plan
  const bookings = await prisma.tripBooking.findMany({
    where: {
      planId,
      status: BookingStatus.PENDING,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          bio: true,
          location: true,
          interests: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return bookings;
};

/**
 * Owner/Admin approves or rejects a booking request
 */
const respondToBooking = async (
  authUser: TAuthUser,
  bookingId: string,
  payload: TRespondBookingPayload
) => {
  // Find booking
  const booking = await prisma.tripBooking.findUnique({
    where: { id: bookingId },
    include: {
      plan: {
        select: {
          id: true,
          title: true,
          ownerId: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking request not found.");
  }

  // Check if booking is still pending
  if (booking.status !== BookingStatus.PENDING) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `This booking has already been ${booking.status.toLowerCase()}.`
    );
  }

  // Check permission
  const { capabilities } = await TripMemberService.getTripMemberPermission(
    authUser,
    booking.planId
  );

  if (!capabilities.canManageMembers) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to respond to booking requests."
    );
  }

  // Handle approval or rejection
  if (payload.status === "APPROVED") {
    // Use transaction to update booking and create member
    const result = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.tripBooking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.APPROVED },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          plan: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // Add user as trip member with VIEWER role
      const newMember = await tx.tripMember.create({
        data: {
          planId: booking.planId,
          userId: booking.userId,
          role: TripRole.VIEWER,
          status: TripStatus.JOINED,
          addedBy: authUser.userId,
        },
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
      });

      return { booking: updatedBooking, member: newMember };
    });

    // Notify user about approval
    NotificationService.notifyUser(booking.userId, {
      type: NotificationType.INVITATION_ACCEPTED,
      title: "Your join request was approved!",
      message: `You are now a member of "${booking.plan.title}"`,
      data: {
        planId: booking.planId,
        bookingId: booking.id,
      },
    }).catch((error) => {
      console.error("Failed to send approval notification:", error);
    });

    return result;
  } else {
    // REJECTED
    const updatedBooking = await prisma.tripBooking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.REJECTED },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Notify user about rejection
    NotificationService.notifyUser(booking.userId, {
      type: NotificationType.INVITATION_RECEIVED,
      title: "Join request declined",
      message: `Your request to join "${booking.plan.title}" was declined`,
      data: {
        planId: booking.planId,
        bookingId: booking.id,
      },
    }).catch((error) => {
      console.error("Failed to send rejection notification:", error);
    });

    return { booking: updatedBooking };
  }
};

/**
 * User cancels their own pending request
 */
const cancelBookingRequest = async (authUser: TAuthUser, bookingId: string) => {
  // Find booking
  const booking = await prisma.tripBooking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      userId: true,
      status: true,
      planId: true,
    },
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking request not found.");
  }

  // Check ownership
  if (booking.userId !== authUser.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only cancel your own booking requests."
    );
  }

  // Check if still pending
  if (booking.status !== BookingStatus.PENDING) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Only pending requests can be cancelled."
    );
  }

  // Delete the booking request
  await prisma.tripBooking.delete({
    where: { id: bookingId },
  });

  return { message: "Booking request cancelled successfully." };
};

export const TripBookingService = {
  createBookingRequest,
  getMyRequests,
  getBookingsByPlan,
  respondToBooking,
  cancelBookingRequest,
};

