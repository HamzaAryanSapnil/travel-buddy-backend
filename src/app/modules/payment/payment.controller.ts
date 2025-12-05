import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import { TAuthUser } from "./payment.interface";

const getPayment = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await PaymentService.getPayment(authUser, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment retrieved successfully.",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await PaymentService.getMyPayments(authUser, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment history retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getPayments = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await PaymentService.getPayments(authUser, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getPaymentStatistics = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await PaymentService.getPaymentStatistics(authUser, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment statistics retrieved successfully.",
    data: result,
  });
});

const getPaymentSummary = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await PaymentService.getPaymentSummary(
    authUser,
    req.query.subscriptionId as string | undefined
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment summary retrieved successfully.",
    data: result,
  });
});

export const PaymentController = {
  getPayment,
  getMyPayments,
  getPayments,
  getPaymentStatistics,
  getPaymentSummary,
};

