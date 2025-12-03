import { TripRole } from "@prisma/client";

export const tripMemberFilterableFields = ["role", "status"];

export const tripMemberSearchableFields: string[] = [];

// Permission capabilities map
export type PermissionCapabilities = {
    canInvite: boolean;
    canEditItinerary: boolean;
    canEditPlan: boolean;
    canDeletePlan: boolean;
    canManageMembers: boolean;
};

export const rolePermissions: Record<TripRole, PermissionCapabilities> = {
    [TripRole.OWNER]: {
        canInvite: true,
        canEditItinerary: true,
        canEditPlan: true,
        canDeletePlan: true,
        canManageMembers: true
    },
    [TripRole.ADMIN]: {
        canInvite: true,
        canEditItinerary: true,
        canEditPlan: true,
        canDeletePlan: false,
        canManageMembers: true
    },
    [TripRole.EDITOR]: {
        canInvite: false,
        canEditItinerary: true,
        canEditPlan: false,
        canDeletePlan: false,
        canManageMembers: false
    },
    [TripRole.VIEWER]: {
        canInvite: false,
        canEditItinerary: false,
        canEditPlan: false,
        canDeletePlan: false,
        canManageMembers: false
    }
};

