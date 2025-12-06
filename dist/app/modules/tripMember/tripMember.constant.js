"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolePermissions = exports.tripMemberSearchableFields = exports.tripMemberFilterableFields = void 0;
const client_1 = require("@prisma/client");
exports.tripMemberFilterableFields = ["role", "status"];
exports.tripMemberSearchableFields = [];
exports.rolePermissions = {
    [client_1.TripRole.OWNER]: {
        canInvite: true,
        canEditItinerary: true,
        canEditPlan: true,
        canDeletePlan: true,
        canManageMembers: true
    },
    [client_1.TripRole.ADMIN]: {
        canInvite: true,
        canEditItinerary: true,
        canEditPlan: true,
        canDeletePlan: false,
        canManageMembers: true
    },
    [client_1.TripRole.EDITOR]: {
        canInvite: false,
        canEditItinerary: true,
        canEditPlan: false,
        canDeletePlan: false,
        canManageMembers: false
    },
    [client_1.TripRole.VIEWER]: {
        canInvite: false,
        canEditItinerary: false,
        canEditPlan: false,
        canDeletePlan: false,
        canManageMembers: false
    }
};
