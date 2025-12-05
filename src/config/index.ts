import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    cloudinary: {
        api_secret: process.env.CLOUDINARY_API_SECRET,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY
    },
    openai: {
        api_key: process.env.OPENAI_API_KEY
    },
    openrouter: {
        api_key: process.env.OPENROUTER_API_KEY
    },
    ai: {
        model_name: process.env.AI_MODEL_NAME || process.env.OPENROUTER_MODEL_NAME || 'google/gemini-2.0-flash-exp:free',
        api_key: process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY
    },
    resend: {
        api_key: process.env.RESEND_API_KEY,
        from_email: process.env.RESEND_FROM_EMAIL
    },
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        expires_in: process.env.EXPIRES_IN,
        refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
        refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
        reset_pass_secret: process.env.RESET_PASS_TOKEN,
        reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN
    },
    salt_round: process.env.SALT_ROUND,
    reset_pass_link: process.env.RESET_PASS_LINK,
    frontend_url: process.env.FRONTEND_URL,
    stripe: {
        secret_key: process.env.STRIPE_SECRET_KEY,
        publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET
    }
}

