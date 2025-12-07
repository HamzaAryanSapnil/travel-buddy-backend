import { TripRole } from "@prisma/client";

export type TAuthUser = {
    userId: string;
    email: string;
    role: string;
};

export type TAddMemberPayload = {
    planId: string;
    email: string;
    role: TripRole;
};

export type TUpdateRolePayload = {
    planId: string;
    userId: string;
    role: TripRole;
};

