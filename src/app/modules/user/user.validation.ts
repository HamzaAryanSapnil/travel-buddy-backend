import { z } from "zod";
import { userRoleValues, userStatusValues } from "./user.constant";

const stringRequired = (message: string) => z.string({ error: () => message });

const updateProfileSchema = z.object({
    body: z.object({
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
        interests: z.array(stringRequired("Interest must be a string.")).optional(),
        visitedCountries: z.array(stringRequired("Country must be a string.")).optional(),
        profileImage: z.string().url({ message: "Profile image must be a valid URL." }).optional()
    })
});

const adminUpdateStatusSchema = z.object({
    body: z.object({
        status: z.enum(userStatusValues as [string, ...string[]], {
            error: () => "Status is required."
        })
    }),
    params: z.object({
        id: stringRequired("User id is required.")
    })
});

const adminVerifyUserSchema = z.object({
    body: z.object({
        isVerified: z.boolean({ error: () => "isVerified must be boolean." })
    }),
    params: z.object({
        id: stringRequired("User id is required.")
    })
});

const adminUpdateRoleSchema = z.object({
    body: z.object({
        role: z.enum(userRoleValues as [string, ...string[]], {
            error: () => "Role is required."
        })
    }),
    params: z.object({
        id: stringRequired("User id is required.")
    })
});

const updateProfilePhotoSchema = z.object({
    body: z.object({
        profileImage: z.string().url({ message: "Profile image must be a valid URL." })
    })
});

export const UserValidation = {
    updateProfile: updateProfileSchema,
    updateProfilePhoto: updateProfilePhotoSchema,
    adminUpdateStatus: adminUpdateStatusSchema,
    adminVerifyUser: adminVerifyUserSchema,
    adminUpdateRole: adminUpdateRoleSchema
};



