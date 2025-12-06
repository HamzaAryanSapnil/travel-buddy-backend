"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripMemberValidation = void 0;
const zod_1 = require("zod");
const stringRequired = (message) => zod_1.z.string({ error: () => message });
const addMemberSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: stringRequired("Plan ID is required."),
        userId: stringRequired("User ID is required."),
        role: zod_1.z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"], {
            error: () => "Invalid role. Must be OWNER, ADMIN, EDITOR, or VIEWER."
        })
    })
});
const updateRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Member ID is required.")
    }),
    body: zod_1.z.object({
        role: zod_1.z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"], {
            error: () => "Invalid role. Must be OWNER, ADMIN, EDITOR, or VIEWER."
        })
    })
});
const getMembersSchema = zod_1.z.object({
    params: zod_1.z.object({
        planId: stringRequired("Plan ID is required.")
    })
});
const removeMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: stringRequired("Member ID is required.")
    })
});
exports.TripMemberValidation = {
    addMember: addMemberSchema,
    updateRole: updateRoleSchema,
    getMembers: getMembersSchema,
    removeMember: removeMemberSchema
};
