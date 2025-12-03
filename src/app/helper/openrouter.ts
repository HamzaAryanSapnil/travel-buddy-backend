import OpenAI from 'openai';
import config from '../../config';

export const openrouter = new OpenAI({
    apiKey: config.ai.api_key || config.openrouter.api_key,
    baseURL: 'https://openrouter.ai/api/v1'
});

/**
 * Get AI model name from config
 * @returns AI model name (default: google/gemini-2.0-flash-exp:free)
 */
export const getAiModelName = (): string => {
    return config.ai.model_name || 'google/gemini-2.0-flash-exp:free';
};

