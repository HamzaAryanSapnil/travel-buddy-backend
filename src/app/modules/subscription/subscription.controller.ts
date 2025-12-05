import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { SubscriptionService } from "./subscription.service";
import { TAuthUser } from "./subscription.interface";

const getSubscriptionStatus = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await SubscriptionService.getSubscriptionStatus(authUser);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription status retrieved successfully.",
    data: result,
  });
});

const createSubscription = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await SubscriptionService.createSubscription(authUser, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subscription created successfully.",
    data: result,
  });
});

const getSubscription = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await SubscriptionService.getSubscription(
    authUser,
    req.params.id
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription retrieved successfully.",
    data: result,
  });
});

const getSubscriptions = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await SubscriptionService.getSubscriptions(authUser, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscriptions retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const updateSubscription = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await SubscriptionService.updateSubscription(
    authUser,
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription updated successfully.",
    data: result,
  });
});

const cancelSubscription = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const result = await SubscriptionService.cancelSubscription(
    authUser,
    req.params.id
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// Webhook handler - special case: needs raw body and signature
const handleWebhook = catchAsync(async (req, res) => {
  // Get raw body (should be Buffer from express.raw() middleware)
  const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
  
  // Get signature from headers
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Missing Stripe signature.",
      data: null,
    });
  }

  const result = await SubscriptionService.handleStripeWebhook(
    rawBody,
    signature
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Webhook processed successfully.",
    data: result,
  });
});

export const SubscriptionController = {
  getSubscriptionStatus,
  createSubscription,
  getSubscription,
  getSubscriptions,
  updateSubscription,
  cancelSubscription,
  handleWebhook,
};

