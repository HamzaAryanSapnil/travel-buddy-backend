import OpenAI from 'openai';
import config from '../../config';

export const openrouter = new OpenAI({
    apiKey: config.openrouter.api_key,
    baseURL: 'https://openrouter.ai/api/v1'
});

