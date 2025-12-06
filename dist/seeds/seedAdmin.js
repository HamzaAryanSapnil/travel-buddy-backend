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
exports.seedAdmin = void 0;
const prisma_1 = require("../app/shared/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../config"));
/**
 * Seed Admin User
 * Creates an admin user if one doesn't exist
 * Uses environment variables for credentials
 */
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🌱 Checking for admin user...");
        // Check if any admin user exists
        const existingAdmin = yield prisma_1.prisma.user.findFirst({
            where: {
                role: "ADMIN"
            }
        });
        if (existingAdmin) {
            console.log("✅ Admin user already exists. Skipping seed.");
            return;
        }
        // Get admin credentials from environment variables
        const adminEmail = config_1.default.admin_email;
        const adminPassword = config_1.default.admin_password;
        const adminName = config_1.default.admin_name || "Super Admin";
        // Validate required credentials
        if (!adminEmail || !adminPassword) {
            console.warn("⚠️  Admin credentials not found in environment variables. Skipping admin seed.");
            console.warn("⚠️  Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env file.");
            return;
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, Number(config_1.default.salt_round) || 10);
        // Create admin user
        const admin = yield prisma_1.prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash: hashedPassword,
                fullName: adminName,
                role: "ADMIN",
                status: "ACTIVE",
                isVerified: true
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                isVerified: true
            }
        });
        console.log("✅ Admin user created successfully!");
        console.log(`📧 Email: ${admin.email}`);
        console.log(`👤 Name: ${admin.fullName}`);
        console.log(`🔑 Role: ${admin.role}`);
    }
    catch (error) {
        console.error("❌ Error seeding admin:", error);
        // Don't throw error to prevent server startup failure
    }
});
exports.seedAdmin = seedAdmin;
