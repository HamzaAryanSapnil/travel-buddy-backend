import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { checkAndIncrementAiUsage, getAiUsage } from "../../helper/aiUsageHelper";
import { openrouter, getAiModelName } from "../../helper/openrouter";
import { paginationHelper, IPaginationOptions } from "../../helper/paginationHelper";
import { TAuthUser } from "../tripMember/tripMember.interface";
import {
  TPlannerSessionCreate,
  TPlannerStepPayload,
  TPlannerCompletePayload,
  TPlannerSessionResponse,
  TPlannerStepResponse,
  TPlannerCreateResponse,
  TPlannerCompleteResponse,
  TPlannerSessionsQuery,
  TFinalOutput
} from "./planner.interface";
import { TravelPlanService } from "../travelPlan/travelPlan.service";
import { ItineraryService } from "../itinerary/itinerary.service";
import { PlanVisibility, TravelType, TripRole, TripStatus } from "@prisma/client";
import {
  INITIAL_QUESTION,
  SYSTEM_PROMPT,
  getPromptForStep,
  getNextStep,
  UIStepType
} from "./planner.constant";

/**
 * Generate next question using AI (OpenRouter/Gemini)
 * This is a helper function that will be fully implemented in Part 5
 */
const generateNextQuestion = async (
  promptFlow: Array<{ q: string; a: string; uiStep: string; ts: string }>,
  currentStep: UIStepType
): Promise<string> => {
  // Build conversation history
  const conversationHistory = promptFlow.map((item) => `Q: ${item.q}\nA: ${item.a}`);

  // Get prompt for current step
  const stepPrompt = getPromptForStep(currentStep, conversationHistory);

  try {
    const response = await openrouter.chat.completions.create({
      model: getAiModelName(),
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: stepPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const question = response.choices[0]?.message?.content?.trim() || INITIAL_QUESTION;
    return question;
  } catch (error: any) {
    // Fallback to default question if AI fails
    console.error("AI question generation error:", error);
    return INITIAL_QUESTION;
  }
};

/**
 * Create a new planner session
 */
const createSession = async (
  authUser: TAuthUser,
  payload?: TPlannerSessionCreate
): Promise<TPlannerCreateResponse> => {
  // Check AI usage limit and increment
  const { remaining } = await checkAndIncrementAiUsage(authUser.userId);

  // Validate planId if provided
  if (payload?.planId) {
    const plan = await prisma.travelPlan.findUnique({
      where: { id: payload.planId }
    });

    if (!plan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
    }

    // Verify user has access to the plan
    if (plan.ownerId !== authUser.userId && authUser.role !== "ADMIN") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to link this plan."
      );
    }
  }

  // Create session with initial promptFlow
  const initialStep: UIStepType = "destination";
  const initialQuestion = INITIAL_QUESTION;

  const session = await prisma.plannerSession.create({
    data: {
      userId: authUser.userId,
      planId: payload?.planId || null,
      promptFlow: [
        {
          q: initialQuestion,
          a: "",
          uiStep: initialStep,
          ts: new Date().toISOString()
        }
      ] as any,
      finalOutput: undefined,
      uiState: initialStep
    }
  });

  return {
    session: {
      id: session.id,
      userId: session.userId,
      planId: session.planId,
      promptFlow: session.promptFlow as any,
      finalOutput: session.finalOutput as any,
      uiState: session.uiState,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    },
    question: initialQuestion,
    uiStep: initialStep,
    remaining
  };
};

/**
 * Add a step to the planner session
 */
const addStep = async (
  authUser: TAuthUser,
  payload: TPlannerStepPayload
): Promise<TPlannerStepResponse> => {
  // Load session
  const session = await prisma.plannerSession.findUnique({
    where: { id: payload.sessionId }
  });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, "Planner session not found.");
  }

  // Verify ownership
  if (session.userId !== authUser.userId && authUser.role !== "ADMIN") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to modify this session."
    );
  }

  // Check if session is already completed
  if (session.finalOutput) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This session is already completed. Create a new session to continue planning."
    );
  }

  // Get current promptFlow
  const promptFlow = (session.promptFlow as any[]) || [];
  const currentStep = payload.uiStep;

  // Update the last item's answer
  if (promptFlow.length > 0) {
    promptFlow[promptFlow.length - 1].a = payload.answer;
  }

  // Get next step
  const nextStep = getNextStep(currentStep);

  if (!nextStep) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "All steps completed. Use complete endpoint to finalize the itinerary."
    );
  }

  // Generate next question via AI
  const nextQuestion = await generateNextQuestion(promptFlow, nextStep);

  // Add new question to promptFlow
  promptFlow.push({
    q: nextQuestion,
    a: "",
    uiStep: nextStep,
    ts: new Date().toISOString()
  });

  // Update session
  const updated = await prisma.plannerSession.update({
    where: { id: payload.sessionId },
    data: {
      promptFlow: promptFlow as any,
      uiState: nextStep
    }
  });

  // Get remaining AI uses (without incrementing)
  const usage = await getAiUsage(authUser.userId);

  return {
    sessionId: updated.id,
    uiStep: nextStep,
    question: nextQuestion,
    remaining: usage.remaining
  };
};

/**
 * Get a single planner session
 */
const getSession = async (
  authUser: TAuthUser,
  sessionId: string
): Promise<TPlannerSessionResponse> => {
  const session = await prisma.plannerSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, "Planner session not found.");
  }

  // Verify ownership
  if (session.userId !== authUser.userId && authUser.role !== "ADMIN") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to view this session."
    );
  }

  return {
    id: session.id,
    userId: session.userId,
    planId: session.planId,
    promptFlow: session.promptFlow as any,
    finalOutput: session.finalOutput as any,
    uiState: session.uiState,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt
  };
};

/**
 * Get all planner sessions for the user
 */
const getMySessions = async (
  authUser: TAuthUser,
  query: TPlannerSessionsQuery
): Promise<{
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: TPlannerSessionResponse[];
}> => {
  const options: IPaginationOptions = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy || "createdAt",
    sortOrder: query.sortOrder || "desc"
  };

  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const sessions = await prisma.plannerSession.findMany({
    where: {
      userId: authUser.userId
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder
    }
  });

  const total = await prisma.plannerSession.count({
    where: {
      userId: authUser.userId
    }
  });

  return {
    meta: {
      page,
      limit,
      total
    },
    data: sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      planId: session.planId,
      promptFlow: session.promptFlow as any,
      finalOutput: session.finalOutput as any,
      uiState: session.uiState,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }))
  };
};

/**
 * Validate final output structure
 */
const validateFinalOutput = (finalOutput: TFinalOutput): void => {
  if (!finalOutput.title || finalOutput.title.trim().length < 3) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title must be at least 3 characters.");
  }

  if (!finalOutput.destination || finalOutput.destination.trim().length < 2) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Destination is required.");
  }

  const startDate = new Date(finalOutput.startDate);
  const endDate = new Date(finalOutput.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format.");
  }

  if (endDate < startDate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "endDate must be greater than or equal to startDate."
    );
  }

  if (!finalOutput.itinerary || finalOutput.itinerary.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Itinerary must have at least one day.");
  }

  // Validate each day has items
  for (const day of finalOutput.itinerary) {
    if (!day.items || day.items.length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Day ${day.dayIndex} must have at least one item.`
      );
    }
  }
};

/**
 * Convert final output to TravelPlan and ItineraryItems format
 */
const convertToTravelPlan = (
  finalOutput: TFinalOutput,
  userId: string
): {
  travelPlan: {
    title: string;
    destination: string;
    origin?: string;
    startDate: string;
    endDate: string;
    budgetMin?: number;
    budgetMax?: number;
    travelType: TravelType;
    description?: string;
  };
  itineraryItems: Array<{
    dayIndex: number;
    startAt?: string;
    endAt?: string;
    title: string;
    description?: string;
    locationId?: string;
    order?: number;
  }>;
} => {
  const itineraryItems: Array<{
    dayIndex: number;
    startAt?: string;
    endAt?: string;
    title: string;
    description?: string;
    locationId?: string;
    order?: number;
  }> = [];

  // Flatten itinerary items
  finalOutput.itinerary.forEach((day, dayIdx) => {
    day.items.forEach((item, itemIdx) => {
      itineraryItems.push({
        dayIndex: day.dayIndex,
        startAt: item.startAt,
        endAt: item.endAt,
        title: item.title,
        description: item.description,
        locationId: undefined, // Location will be handled separately if needed
        order: itemIdx + 1
      });
    });
  });

  return {
    travelPlan: {
      title: finalOutput.title,
      destination: finalOutput.destination,
      origin: finalOutput.origin,
      startDate: finalOutput.startDate,
      endDate: finalOutput.endDate,
      budgetMin: finalOutput.budgetMin,
      budgetMax: finalOutput.budgetMax,
      travelType: finalOutput.travelType as TravelType,
      description: finalOutput.description
    },
    itineraryItems
  };
};

/**
 * Complete planner session and create TravelPlan + ItineraryItems
 */
const completeSession = async (
  authUser: TAuthUser,
  payload: TPlannerCompletePayload
): Promise<TPlannerCompleteResponse> => {
  // Load session
  const session = await prisma.plannerSession.findUnique({
    where: { id: payload.sessionId }
  });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, "Planner session not found.");
  }

  // Verify ownership
  if (session.userId !== authUser.userId && authUser.role !== "ADMIN") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to complete this session."
    );
  }

  // Check if already completed
  if (session.finalOutput) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This session is already completed."
    );
  }

  // Validate final output
  validateFinalOutput(payload.finalOutput);

  // Convert to TravelPlan format
  const { travelPlan: planData, itineraryItems } = convertToTravelPlan(
    payload.finalOutput,
    authUser.userId
  );

  // Create TravelPlan and ItineraryItems in transaction
  const result = await prisma.$transaction(async (tx) => {
    const startDate = new Date(planData.startDate);
    const endDate = new Date(planData.endDate);

    // Create TravelPlan directly in transaction
    const plan = await tx.travelPlan.create({
      data: {
        ownerId: authUser.userId,
        title: planData.title,
        destination: planData.destination,
        origin: planData.origin,
        startDate,
        endDate,
        budgetMin: planData.budgetMin,
        budgetMax: planData.budgetMax,
        travelType: planData.travelType,
        visibility: PlanVisibility.PRIVATE,
        description: planData.description
      }
    });

    // Create TripMember (OWNER) in transaction
    await tx.tripMember.create({
      data: {
        planId: plan.id,
        userId: authUser.userId,
        role: TripRole.OWNER,
        status: TripStatus.JOINED,
        addedBy: authUser.userId
      }
    });

    // Calculate totalDays
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    // Create ItineraryItems directly in transaction (replace existing if any)
    if (itineraryItems.length > 0) {
      // Delete existing items if any
      await tx.itineraryItem.deleteMany({
        where: { planId: plan.id }
      });

      // Create new items
      await tx.itineraryItem.createMany({
        data: itineraryItems.map((item, idx) => ({
          planId: plan.id,
          dayIndex: item.dayIndex,
          startAt: item.startAt ? new Date(item.startAt) : null,
          endAt: item.endAt ? new Date(item.endAt) : null,
          title: item.title,
          description: item.description || null,
          locationId: item.locationId || null,
          order: item.order || idx + 1
        }))
      });
    }

    // Update session with finalOutput and link planId
    const updatedSession = await tx.plannerSession.update({
      where: { id: payload.sessionId },
      data: {
        planId: plan.id,
        finalOutput: payload.finalOutput as any,
        uiState: "Final"
      }
    });

    return { plan: { ...plan, totalDays }, session: updatedSession, itemsCount: itineraryItems.length };
  });

  return {
    session: {
      id: result.session.id,
      userId: result.session.userId,
      planId: result.session.planId,
      promptFlow: result.session.promptFlow as any,
      finalOutput: result.session.finalOutput as any,
      uiState: result.session.uiState,
      createdAt: result.session.createdAt,
      updatedAt: result.session.updatedAt
    },
    travelPlan: {
      id: result.plan.id,
      title: result.plan.title,
      destination: result.plan.destination,
      startDate: result.plan.startDate,
      endDate: result.plan.endDate,
      totalDays: result.plan.totalDays
    },
    itineraryItemsCount: result.itemsCount
  };
};

export const PlannerService = {
  createSession,
  addStep,
  getSession,
  getMySessions,
  completeSession,
  validateFinalOutput,
  convertToTravelPlan
};

