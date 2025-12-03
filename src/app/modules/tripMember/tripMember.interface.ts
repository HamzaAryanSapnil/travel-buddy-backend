import { TripRole } from "@prisma/client";

export type TAuthUser = {
    userId: string;
    email: string;
    role: string;
};

export type TAddMemberPayload = {
    planId: string;
    userId: string;
    role: TripRole;
};

export type TUpdateRolePayload = {
    role: TripRole;
};

