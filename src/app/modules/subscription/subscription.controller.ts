import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import ApiError from "../../errors/ApiError";
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
    message: "Checkout session created successfully. Redirect user to the provided URL.",
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
  // Check if body is already a Buffer (from express.raw())
  let rawBody: Buffer;
  
  if (Buffer.isBuffer(req.body)) {
    // Body is already a Buffer (from express.raw())
    rawBody = req.body;
  } else if ((req as any).rawBody && Buffer.isBuffer((req as any).rawBody)) {
    // Raw body stored in req.rawBody
    rawBody = (req as any).rawBody;
  } else {
    // Fallback: try to get from request
    console.error("⚠️ Raw body not found as Buffer. Body type:", typeof req.body);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Webhook payload must be provided as raw Buffer. Check middleware configuration."
    );
  }
  
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

  console.log(`🔔 Webhook received - Body length: ${rawBody.length}, Signature: ${signature.substring(0, 20)}...`);

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

// Sync subscription from Stripe (manual sync)
const syncSubscription = catchAsync(async (req, res) => {
  const authUser = req.user as TAuthUser;
  const stripeSubscriptionId = req.params.stripeSubscriptionId;

  const result = await SubscriptionService.syncSubscriptionFromStripe(
    authUser,
    stripeSubscriptionId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
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
  syncSubscription,
};

