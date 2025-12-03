import { z } from "zod";

const stringRequired = (message: string) => z.string({ error: () => message });

const addMemberSchema = z.object({
    body: z.object({
        planId: stringRequired("Plan ID is required."),
        userId: stringRequired("User ID is required."),
        role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"] as const, {
            error: () => "Invalid role. Must be OWNER, ADMIN, EDITOR, or VIEWER."
        })
    })
});

const updateRoleSchema = z.object({
    params: z.object({
        id: stringRequired("Member ID is required.")
    }),
    body: z.object({
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

