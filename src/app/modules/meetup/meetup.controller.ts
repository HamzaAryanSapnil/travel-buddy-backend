import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { MeetupService } from "./meetup.service";
import { TAuthUser } from "./meetup.interface";

const createMeetup = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await MeetupService.createMeetup(authUser, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Meetup created successfully.",
    data: result,
  });
});

const getMeetup = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await MeetupService.getMeetup(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Meetup retrieved successfully.",
    data: result,
  });
});

const getMeetups = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await MeetupService.getMeetups(authUser, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Meetups retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const updateMeetup = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await MeetupService.updateMeetup(
    authUser,
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Meetup updated successfully.",
    data: result,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await MeetupService.updateMeetupStatus(
    authUser,
    req.params.id,
    req.body.status
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Meetup status updated successfully.",
    data: result,
  });
});

const rsvp = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await MeetupService.rsvp(
    authUser,
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `RSVP ${req.body.status.toLowerCase()} successfully.`,
    data: result,
  });
});

const deleteMeetup = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  await MeetupService.deleteMeetup(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Meetup deleted successfully.",
    data: null,
  });
});

export const MeetupController = {
  createMeetup,
  getMeetup,
  getMeetups,
  updateMeetup,
  updateStatus,
  rsvp,
  deleteMeetup,
};

