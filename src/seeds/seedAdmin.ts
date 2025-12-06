import { prisma } from "../app/shared/prisma";
import bcrypt from "bcryptjs";
import config from "../config";

/**
 * Seed Admin User
 * Creates an admin user if one doesn't exist
 * Uses environment variables for credentials
 */
export const seedAdmin = async () => {
    try {
        console.log("🌱 Checking for admin user...");

        // Check if any admin user exists
        const existingAdmin = await prisma.user.findFirst({
            where: {
                role: "ADMIN"
            }
        });

        if (existingAdmin) {
            console.log("✅ Admin user already exists. Skipping seed.");
            return;
        }

        // Get admin credentials from environment variables
        const adminEmail = config.admin_email;
        const adminPassword = config.admin_password;
        const adminName = config.admin_name || "Super Admin";

        // Validate required credentials
        if (!adminEmail || !adminPassword) {
            console.warn("⚠️  Admin credentials not found in environment variables. Skipping admin seed.");
            console.warn("⚠️  Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env file.");
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(
            adminPassword,
            Number(config.salt_round) || 10
        );

        // Create admin user
        const admin = await prisma.user.create({
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

    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        // Don't throw error to prevent server startup failure
    }
};

