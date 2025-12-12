"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const user_constant_1 = require("./user.constant");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
const updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: stringRequired("Full name must be a string.")
            .min(2, { message: "Full name must be at least 2 characters long." })
            .max(100, { message: "Full name cannot exceed 100 characters." })
            .optional(),
        bio: stringRequired("Bio must be a string.")
            .max(500, { message: "Bio cannot exceed 500 characters." })
            .optional(),
        location: stringRequired("Location must be a string.")
            .max(120, { message: "Location cannot exceed 120 characters." })
            .optional(),
        interests: zod_1.z.array(stringRequired("Interest must be a string.")).optional(),
        visitedCountries: zod_1.z.array(stringRequired("Country must be a string.")).optional(),
        profileImage: zod_1.z.string().url({ message: "Profile image must be a valid URL." }).optional()
    })
});
const adminUpdateStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(user_constant_1.userStatusValues, {
            error: () => "Status is required."
        })
    }),
    params: zod_1.z.object({
        id: stringRequired("User id is required.")
    })
});
const adminVerifyUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        isVerified: zod_1.z.boolean({ error: () => "isVerified must be boolean." })
    }),
    params: zod_1.z.object({
        id: stringRequired("User id is required.")
    })
});
const adminUpdateRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(user_constant_1.userRoleValues, {
            error: () => "Role is required."
        })
    }),
    params: zod_1.z.object({
        id: stringRequired("User id is required.")
    })
});
const updateProfilePhotoSchema = zod_1.z.object({
    body: zod_1.z.object({
        profileImage: zod_1.z.string().url({ message: "Profile image must be a valid URL." })
    })
});
exports.UserValidation = {
    updateProfile: updateProfileSchema,
    updateProfilePhoto: updateProfilePhotoSchema,
    adminUpdateStatus: adminUpdateStatusSchema,
    adminVerifyUser: adminVerifyUserSchema,
    adminUpdateRole: adminUpdateRoleSchema
};
