import { z } from "zod";

const stringRequired = (message: string) => z.string({ error: () => message });

const addMemberSchema = z.object({
    params: z.object({
        planId: stringRequired("Plan ID is required.")
    }),
    body: z.object({
        email: stringRequired("Email is required.").email("Invalid email format."),
        role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"] as const, {
            error: () => "Invalid role. Must be OWNER, ADMIN, EDITOR, or VIEWER."
        })
    })
});

const updateRoleSchema = z.object({
    params: z.object({
        planId: stringRequired("Plan ID is required.")
    }),
    body: z.object({
        userId: stringRequired("User ID is required."),
        role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"] as const, {
            error: () => "Invalid role. Must be OWNER, ADMIN, EDITOR, or VIEWER."
        })
    })
});

const getMembersSchema = z.object({
    params: z.object({
        planId: stringRequired("Plan ID is required.")
    })
});

const removeMemberSchema = z.object({
    params: z.object({
        id: stringRequired("Member ID is required.")
    })
});

export const TripMemberValidation = {
    addMember: addMemberSchema,
    updateRole: updateRoleSchema,
    getMembers: getMembersSchema,
    removeMember: removeMemberSchema
};

