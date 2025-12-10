import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { TripBookingService } from "./tripBooking.service";
import { TAuthUser } from "../tripMember/tripMember.interface";

const createBookingRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await TripBookingService.createBookingRequest(
    req.user as TAuthUser,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Join request sent successfully.",
    data: result,
  });
});

const getMyRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await TripBookingService.getMyRequests(req.user as TAuthUser);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My booking requests retrieved successfully.",
    data: result,
  });
});

const getBookingsByPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await TripBookingService.getBookingsByPlan(
    req.user as TAuthUser,
    req.params.planId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking requests for plan retrieved successfully.",
    data: result,
  });
});

const respondToBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await TripBookingService.respondToBooking(
    req.user as TAuthUser,
    req.params.bookingId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Booking request ${req.body.status.toLowerCase()} successfully.`,
    data: result,
  });
});

const cancelBookingRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await TripBookingService.cancelBookingRequest(
    req.user as TAuthUser,
    req.params.bookingId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const TripBookingController = {
  createBookingRequest,
  getMyRequests,
  getBookingsByPlan,
  respondToBooking,
  cancelBookingRequest,
};

