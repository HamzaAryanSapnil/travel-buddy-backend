"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiModelName = exports.openrouter = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = __importDefault(require("../../config"));
exports.openrouter = new openai_1.default({
    apiKey: config_1.default.ai.api_key || config_1.default.openrouter.api_key,
    baseURL: 'https://openrouter.ai/api/v1'
});
/**
 * Get AI model name from config
 * @returns AI model name (default: google/gemini-2.0-flash-exp:free)
 */
const getAiModelName = () => {
    return config_1.default.ai.model_name || 'google/gemini-2.0-flash-exp:free';
};
exports.getAiModelName = getAiModelName;
