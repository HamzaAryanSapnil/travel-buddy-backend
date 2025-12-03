import { TAuthUser } from "../tripMember/tripMember.interface";
import { UIStepType } from "./planner.constant";

/**
 * Prompt flow item structure (stored in PlannerSession.promptFlow)
 */
export type TPromptFlowItem = {
  q: string; // Question
  a: string; // Answer
  uiStep: UIStepType; // UI step identifier
  ts: string; // ISO timestamp
};

/**
 * Final output structure (stored in PlannerSession.finalOutput)
 */
export type TFinalOutput = {
  title: string;
  destination: string;
  origin?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  budgetMin?: number;
  budgetMax?: number;
  travelType: "SOLO" | "COUPLE" | "FAMILY" | "FRIENDS" | "GROUP";
  description?: string;
  itinerary: Array<{
    dayIndex: number;
    items: Array<{
      title: string;
      description?: string;
      startAt?: string; // ISO datetime string
      endAt?: string; // ISO datetime string
      location?: string;
    }>;
  }>;
};

/**
 * Create session payload
 */
export type TPlannerSessionCreate = {
  planId?: string; // Optional: link to existing plan
};

/**
 * Add step payload
 */
export type TPlannerStepPayload = {
  sessionId: string;
  question: string;
  answer: string;
  uiStep: UIStepType;
};

/**
 * Complete session payload
 */
export type TPlannerCompletePayload = {
  sessionId: string;
  finalOutput: TFinalOutput;
};

/**
 * Planner session response
 */
export type TPlannerSessionResponse = {
  id: string;
  userId: string;
  planId: string | null;
  promptFlow: TPromptFlowItem[];
  finalOutput: TFinalOutput | null;
  uiState: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Step response (includes remaining AI uses)
 */
export type TPlannerStepResponse = {
  sessionId: string;
  uiStep: UIStepType;
  question: string;
  remaining: number; // -1 for unlimited
};

/**
 * Create session response
 */
export type TPlannerCreateResponse = {
  session: TPlannerSessionResponse;
  question: string;
  uiStep: UIStepType;
  remaining: number; // -1 for unlimited
};

/**
 * Complete session response (includes created TravelPlan)
 */
export type TPlannerCompleteResponse = {
  session: TPlannerSessionResponse;
  travelPlan: {
    id: string;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };
  itineraryItemsCount: number;
};

/**
 * Query parameters for getting sessions
 */
export type TPlannerSessionsQuery = {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

