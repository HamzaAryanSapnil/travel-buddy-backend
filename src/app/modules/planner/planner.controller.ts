import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PlannerService } from "./planner.service";
import { TAuthUser } from "../tripMember/tripMember.interface";

const createSession = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await PlannerService.createSession(authUser, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Planner session created successfully.",
    data: result
  });
});

const addStep = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await PlannerService.addStep(authUser, {
    sessionId: req.params.id,
    ...req.body
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Step added successfully.",
    data: result
  });
});

const completeSession = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await PlannerService.completeSession(authUser, {
    sessionId: req.params.id,
    finalOutput: req.body.finalOutput
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Planner session completed successfully. Travel plan created.",
    data: result
  });
});

const getSession = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await PlannerService.getSession(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Planner session retrieved successfully.",
    data: result
  });
});

const getMySessions = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await PlannerService.getMySessions(authUser, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Planner sessions retrieved successfully.",
    meta: result.meta,
    data: result.data
  });
});

export const PlannerController = {
  createSession,
  addStep,
  completeSession,
  getSession,
  getMySessions
};

