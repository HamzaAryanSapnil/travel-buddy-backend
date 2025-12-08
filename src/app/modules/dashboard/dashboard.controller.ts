import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DashboardService } from "./dashboard.service";
import { TAuthUser } from "./dashboard.interface";

const getUserOverview = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await DashboardService.getUserOverview(authUser);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User dashboard overview retrieved successfully.",
    data: result,
  });
});

const getAdminOverview = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await DashboardService.getAdminOverview(authUser);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin dashboard overview retrieved successfully.",
    data: result,
  });
});

export const DashboardController = {
  getUserOverview,
  getAdminOverview,
};

