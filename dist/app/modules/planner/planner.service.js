"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = require("../../shared/prisma");
const aiUsageHelper_1 = require("../../helper/aiUsageHelper");
const openrouter_1 = require("../../helper/openrouter");
const paginationHelper_1 = require("../../helper/paginationHelper");
const client_1 = require("@prisma/client");
const planner_constant_1 = require("./planner.constant");
/**
 * Generate next question using AI (OpenRouter/Gemini)
 * This is a helper function that will be fully implemented in Part 5
 */
const generateNextQuestion = (promptFlow, currentStep) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // Build conversation history
    const conversationHistory = promptFlow.map((item) => `Q: ${item.q}\nA: ${item.a}`);
    // Get prompt for current step
    const stepPrompt = (0, planner_constant_1.getPromptForStep)(currentStep, conversationHistory);
    try {
        const response = yield openrouter_1.openrouter.chat.completions.create({
            model: (0, openrouter_1.getAiModelName)(),
            messages: [
                {
                    role: "system",
                    content: planner_constant_1.SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: stepPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });
        const question = ((_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim()) || planner_constant_1.INITIAL_QUESTION;
        return question;
    }
    catch (error) {
        // Fallback to default question if AI fails
        console.error("AI question generation error:", error);
        return planner_constant_1.INITIAL_QUESTION;
    }
});
/**
 * Create a new planner session
 */
const createSession = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check AI usage limit and increment
    const { remaining } = yield (0, aiUsageHelper_1.checkAndIncrementAiUsage)(authUser.userId);
    // Validate planId if provided
    if (payload === null || payload === void 0 ? void 0 : payload.planId) {
        const plan = yield prisma_1.prisma.travelPlan.findUnique({
            where: { id: payload.planId }
        });
        if (!plan) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
        }
        // Verify user has access to the plan
        if (plan.ownerId !== authUser.userId && authUser.role !== "ADMIN") {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You do not have permission to link this plan.");
        }
    }
    // Create session with initial promptFlow
    const initialStep = "destination";
    const initialQuestion = planner_constant_1.INITIAL_QUESTION;
    const session = yield prisma_1.prisma.plannerSession.create({
        data: {
            userId: authUser.userId,
            planId: (payload === null || payload === void 0 ? void 0 : payload.planId) || null,
            promptFlow: [
                {
                    q: initialQuestion,
                    a: "",
                    uiStep: initialStep,
                    ts: new Date().toISOString()
                }
            ],
            finalOutput: undefined,
            uiState: initialStep
        }
    });
    return {
        session: {
            id: session.id,
            userId: session.userId,
            planId: session.planId,
            promptFlow: session.promptFlow,
            finalOutput: session.finalOutput,
            uiState: session.uiState,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
        },
        question: initialQuestion,
        uiStep: initialStep,
        remaining
    };
});
/**
 * Add a step to the planner session
 */
const addStep = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Load session
    const session = yield prisma_1.prisma.plannerSession.findUnique({
        where: { id: payload.sessionId }
    });
    if (!session) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Planner session not found.");
    }
    // Verify ownership
    if (session.userId !== authUser.userId && authUser.role !== "ADMIN") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You do not have permission to modify this session.");
    }
    // Check if session is already completed
    if (session.finalOutput) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "This session is already completed. Create a new session to continue planning.");
    }
    // Get current promptFlow
    const promptFlow = session.promptFlow || [];
    const currentStep = payload.uiStep;
    // Update the last item's answer
    if (promptFlow.length > 0) {
        promptFlow[promptFlow.length - 1].a = payload.answer;
    }
    // Get next step
    const nextStep = (0, planner_constant_1.getNextStep)(currentStep);
    if (!nextStep) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "All steps completed. Use complete endpoint to finalize the itinerary.");
    }
    // Generate next question via AI
    const nextQuestion = yield generateNextQuestion(promptFlow, nextStep);
    // Add new question to promptFlow
    promptFlow.push({
        q: nextQuestion,
        a: "",
        uiStep: nextStep,
        ts: new Date().toISOString()
    });
    // Update session
    const updated = yield prisma_1.prisma.plannerSession.update({
        where: { id: payload.sessionId },
        data: {
            promptFlow: promptFlow,
            uiState: nextStep
        }
    });
    // Get remaining AI uses (without incrementing)
    const usage = yield (0, aiUsageHelper_1.getAiUsage)(authUser.userId);
    return {
        sessionId: updated.id,
        uiStep: nextStep,
        question: nextQuestion,
        remaining: usage.remaining
    };
});
/**
 * Get a single planner session
 */
const getSession = (authUser, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield prisma_1.prisma.plannerSession.findUnique({
        where: { id: sessionId }
    });
    if (!session) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Planner session not found.");
    }
    // Verify ownership
    if (session.userId !== authUser.userId && authUser.role !== "ADMIN") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You do not have permission to view this session.");
    }
    return {
        id: session.id,
        userId: session.userId,
        planId: session.planId,
        promptFlow: session.promptFlow,
        finalOutput: session.finalOutput,
        uiState: session.uiState,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
    };
});
/**
 * Get all planner sessions for the user
 */
const getMySessions = (authUser, query) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
        sortBy: query.sortBy || "createdAt",
        sortOrder: query.sortOrder || "desc"
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const sessions = yield prisma_1.prisma.plannerSession.findMany({
        where: {
            userId: authUser.userId
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        }
    });
    const total = yield prisma_1.prisma.plannerSession.count({
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
            promptFlow: session.promptFlow,
            finalOutput: session.finalOutput,
            uiState: session.uiState,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
        }))
    };
});
/**
 * Validate final output structure
 */
const validateFinalOutput = (finalOutput) => {
    if (!finalOutput.title || finalOutput.title.trim().length < 3) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Title must be at least 3 characters.");
    }
    if (!finalOutput.destination || finalOutput.destination.trim().length < 2) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Destination is required.");
    }
    const startDate = new Date(finalOutput.startDate);
    const endDate = new Date(finalOutput.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid date format.");
    }
    if (endDate < startDate) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "endDate must be greater than or equal to startDate.");
    }
    if (!finalOutput.itinerary || finalOutput.itinerary.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Itinerary must have at least one day.");
    }
    // Validate each day has items
    for (const day of finalOutput.itinerary) {
        if (!day.items || day.items.length === 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Day ${day.dayIndex} must have at least one item.`);
        }
    }
};
/**
 * Convert final output to TravelPlan and ItineraryItems format
 */
const convertToTravelPlan = (finalOutput, userId) => {
    const itineraryItems = [];
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
            travelType: finalOutput.travelType,
            description: finalOutput.description
        },
        itineraryItems
    };
};
/**
 * Complete planner session and create TravelPlan + ItineraryItems
 */
const completeSession = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Load session
    const session = yield prisma_1.prisma.plannerSession.findUnique({
        where: { id: payload.sessionId }
    });
    if (!session) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Planner session not found.");
    }
    // Verify ownership
    if (session.userId !== authUser.userId && authUser.role !== "ADMIN") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You do not have permission to complete this session.");
    }
    // Check if already completed
    if (session.finalOutput) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "This session is already completed.");
    }
    // Validate final output
    validateFinalOutput(payload.finalOutput);
    // Convert to TravelPlan format
    const { travelPlan: planData, itineraryItems } = convertToTravelPlan(payload.finalOutput, authUser.userId);
    // Create TravelPlan and ItineraryItems in transaction
    const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const startDate = new Date(planData.startDate);
        const endDate = new Date(planData.endDate);
        // Create TravelPlan directly in transaction
        const plan = yield tx.travelPlan.create({
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
                visibility: client_1.PlanVisibility.PRIVATE,
                description: planData.description
            }
        });
        // Create TripMember (OWNER) in transaction
        yield tx.tripMember.create({
            data: {
                planId: plan.id,
                userId: authUser.userId,
                role: client_1.TripRole.OWNER,
                status: client_1.TripStatus.JOINED,
                addedBy: authUser.userId
            }
        });
        // Calculate totalDays
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        // Create ItineraryItems directly in transaction (replace existing if any)
        if (itineraryItems.length > 0) {
            // Delete existing items if any
            yield tx.itineraryItem.deleteMany({
                where: { planId: plan.id }
            });
            // Create new items
            yield tx.itineraryItem.createMany({
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
        const updatedSession = yield tx.plannerSession.update({
            where: { id: payload.sessionId },
            data: {
                planId: plan.id,
                finalOutput: payload.finalOutput,
                uiState: "Final"
            }
        });
        return { plan: Object.assign(Object.assign({}, plan), { totalDays }), session: updatedSession, itemsCount: itineraryItems.length };
    }));
    return {
        session: {
            id: result.session.id,
            userId: result.session.userId,
            planId: result.session.planId,
            promptFlow: result.session.promptFlow,
            finalOutput: result.session.finalOutput,
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
});
exports.PlannerService = {
    createSession,
    addStep,
    getSession,
    getMySessions,
    completeSession,
    validateFinalOutput,
    convertToTravelPlan
};
