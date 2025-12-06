"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextStep = exports.getPromptForStep = exports.SYSTEM_PROMPT = exports.INITIAL_QUESTION = exports.UI_STEPS = void 0;
exports.UI_STEPS = [
    "destination",
    "groupSize",
    "budget",
    "tripDuration",
    "interests",
    "specialRequirements",
    "Final"
];
/**
 * Initial question for starting the planner
 */
exports.INITIAL_QUESTION = "What is your travel destination?";
/**
 * System prompt for AI travel planner
 */
exports.SYSTEM_PROMPT = `You are a helpful travel planning assistant. Your role is to guide users through creating a personalized travel itinerary by asking relevant questions one at a time.

Guidelines:
1. Ask ONE question at a time
2. Be conversational and friendly
3. After collecting all information, generate a complete itinerary
4. For the final step, return a structured JSON itinerary

Question Flow:
- Start with destination
- Ask about group size (solo, couple, family, friends, group)
- Ask about budget range
- Ask about trip duration (number of days)
- Ask about travel interests (adventure, culture, relaxation, etc.)
- Ask about special requirements (accessibility, dietary, etc.)
- Finally, generate the complete itinerary

When generating the final itinerary, return a JSON object with this structure:
{
  "title": "Trip title",
  "destination": "City/Country",
  "origin": "Starting location (optional)",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "budgetMin": number (optional),
  "budgetMax": number (optional),
  "travelType": "SOLO" | "COUPLE" | "FAMILY" | "FRIENDS" | "GROUP",
  "description": "Brief trip description",
  "itinerary": [
    {
      "dayIndex": 1,
      "items": [
        {
          "title": "Activity name",
          "description": "Activity description",
          "startAt": "YYYY-MM-DDTHH:mm:ss" (optional),
          "endAt": "YYYY-MM-DDTHH:mm:ss" (optional),
          "location": "Location name (optional)"
        }
      ]
    }
  ]
}`;
/**
 * Generate prompt for next question based on current step
 */
const getPromptForStep = (currentStep, conversationHistory) => {
    const historyContext = conversationHistory.length > 0
        ? `\n\nPrevious conversation:\n${conversationHistory.join("\n")}`
        : "";
    switch (currentStep) {
        case "destination":
            return `Ask the user about their travel destination.${historyContext}`;
        case "groupSize":
            return `Ask about the group size (solo, couple, family, friends, or group).${historyContext}`;
        case "budget":
            return `Ask about their budget range for the trip.${historyContext}`;
        case "tripDuration":
            return `Ask about how many days they want to travel.${historyContext}`;
        case "interests":
            return `Ask about their travel interests (adventure, culture, relaxation, food, nature, etc.).${historyContext}`;
        case "specialRequirements":
            return `Ask about any special requirements (accessibility needs, dietary restrictions, etc.).${historyContext}`;
        case "Final":
            return `Based on all the information collected, generate a complete travel itinerary in JSON format as specified in the system prompt.${historyContext}`;
        default:
            return `Continue the conversation naturally.${historyContext}`;
    }
};
exports.getPromptForStep = getPromptForStep;
/**
 * Get next UI step based on current step
 */
const getNextStep = (currentStep) => {
    const currentIndex = exports.UI_STEPS.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex >= exports.UI_STEPS.length - 1) {
        return null; // No next step
    }
    return exports.UI_STEPS[currentIndex + 1];
};
exports.getNextStep = getNextStep;
