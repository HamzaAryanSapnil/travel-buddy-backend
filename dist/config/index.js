"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.default = {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    openai: {
        api_key: process.env.OPENAI_API_KEY,
    },
    openrouter: {
        api_key: process.env.OPENROUTER_API_KEY,
    },
    ai: {
        model_name: process.env.AI_MODEL_NAME ||
            process.env.OPENROUTER_MODEL_NAME ||
            "google/gemini-2.0-flash-exp:free",
        api_key: process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY,
    },
    resend: {
        api_key: process.env.RESEND_API_KEY,
        from_email: process.env.RESEND_FROM_EMAIL,
    },
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        expires_in: process.env.EXPIRES_IN,
        refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
        refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
        reset_pass_secret: process.env.RESET_PASS_TOKEN,
        reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
    },
    salt_round: process.env.SALT_ROUND,
    reset_pass_link: process.env.RESET_PASS_LINK,
    frontend_url: process.env.FRONTEND_URL,
    stripe: {
        secret_key: process.env.STRIPE_SECRET_KEY,
        publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    admin_email: process.env.ADMIN_EMAIL,
    admin_password: process.env.ADMIN_PASSWORD,
    admin_name: process.env.ADMIN_NAME || "Super Admin",
};
