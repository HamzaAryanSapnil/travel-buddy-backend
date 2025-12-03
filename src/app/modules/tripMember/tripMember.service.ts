import { NotificationType, PlanVisibility, Prisma, TripRole, TripStatus } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { NotificationService } from "../notification/notification.service";
import { rolePermissions, PermissionCapabilities } from "./tripMember.constant";
import { TAuthUser, TAddMemberPayload, TUpdateRolePayload } from "./tripMember.interface";

type TripMemberWithPlan = {
    role: TripRole;
    status: TripStatus;
    plan: {
        id: string;
        visibility: PlanVisibility;
        ownerId: string;
    };
};

/**
 * Permission helper: Get user's role and capabilities for a plan
 */
const getTripMemberPermission = async (
    authUser: TAuthUser,
    planId: string
): Promise<{ member: TripMemberWithPlan | null; capabilities: PermissionCapabilities }> => {
    const member = await prisma.tripMember.findFirst({
        where: {
            planId,
            userId: authUser.userId,
            status: TripStatus.JOINED
        },
        include: {
            plan: {
                select: {
                    id: true,
                    visibility: true,
                    ownerId: true
                }
            }
        }
    });

    // If user is system ADMIN, grant full permissions
    if (authUser.role === "ADMIN") {
        return {
            member: null,
            capabilities: rolePermissions[TripRole.OWNER]
        };
    }

    // If user is a member, return their capabilities
    if (member) {
        return {
            member: member as TripMemberWithPlan,
            capabilities: rolePermissions[member.role]
        };
    }

    // No member record - no permissions
    return {
        member: null,
        capabilities: rolePermissions[TripRole.VIEWER]
    };
};

/**
 * Assert that user has a specific capability
 */
const assertTripMemberPermission = async (
    authUser: TAuthUser,
    planId: string,
    action: keyof PermissionCapabilities,
    errorMessage?: string
): Promise<{ member: TripMemberWithPlan | null; capabilities: PermissionCapabilities }> => {
    const { member, capabilities } = await getTripMemberPermission(authUser, planId);

    if (!capabilities[action]) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            errorMessage || `You do not have permission to ${action}.`
        );
    }

    return { member, capabilities };
};

const addMember = async (authUser: TAuthUser, payload: TAddMemberPayload) => {
    // Check if plan exists
    const plan = await prisma.travelPlan.findUnique({
        where: { id: payload.planId },
        select: {
            id: true,
            title: true,
            ownerId: true
        }
    });

    if (!plan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
    }

    // Check permission to invite
    await assertTripMemberPermission(authUser, payload.planId, "canInvite");

    // Check if user is already a member
    const existingMember = await prisma.tripMember.findUnique({
        where: {
            planId_userId: {
                planId: payload.planId,
                userId: payload.userId
            }
        }
    });

    if (existingMember) {
        throw new ApiError(httpStatus.CONFLICT, "User is already a member of this plan.");
    }

    // Validate that target user exists
    const targetUser = await prisma.user.findUnique({
        where: { id: payload.userId }
    });

    if (!targetUser) {
        throw new ApiError(httpStatus.NOT_FOUND, "Target user not found.");
    }

    // Cannot add OWNER role (only created during plan creation)
    if (payload.role === TripRole.OWNER) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Cannot assign OWNER role. OWNER is set automatically when creating a plan."
        );
    }

    const result = await prisma.tripMember.create({
        data: {
            planId: payload.planId,
            userId: payload.userId,
            role: payload.role,
            status: TripStatus.JOINED,
            addedBy: authUser.userId
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true
                }
            }
        }
    });

    // Notify plan owner about new member (async, don't wait)
    NotificationService.notifyUser(
        plan.ownerId,
        {
            type: NotificationType.MEMBER_JOINED,
            title: "New member joined your travel plan",
            message: `${targetUser.fullName || targetUser.email} joined "${plan.title}"`,
            data: {
                planId: payload.planId,
                memberId: result.id
            }
        }
    ).catch((error) => {
        // Log error but don't fail the member addition
        console.error("Failed to send notification for member join:", error);
    });

    return result;
};

const getMembers = async (authUser: TAuthUser, planId: string) => {
    // Check if plan exists
    const plan = await prisma.travelPlan.findUnique({
        where: { id: planId }
    });

    if (!plan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found.");
    }

    // Check if user can view (must be member or plan is PUBLIC)
    const { member } = await getTripMemberPermission(authUser, planId);

    if (!member && plan.visibility !== PlanVisibility.PUBLIC) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "You are not allowed to view members of this plan."
        );
    }

    const members = await prisma.tripMember.findMany({
        where: {
            planId,
            status: TripStatus.JOINED
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true
                }
            }
        },
        orderBy: [
            { role: "asc" },
            { joinedAt: "asc" }
        ]
    });

    return members;
};

const updateMemberRole = async (
    authUser: TAuthUser,
    memberId: string,
    payload: TUpdateRolePayload
) => {
    // Get the member record
    const member = await prisma.tripMember.findUnique({
        where: { id: memberId },
        include: {
            plan: {
                select: {
                    id: true,
                    ownerId: true
                }
            }
        }
    });

    if (!member) {
        throw new ApiError(httpStatus.NOT_FOUND, "Trip member not found.");
    }

    // Check permission to manage members
    await assertTripMemberPermission(authUser, member.planId, "canManageMembers");

    // Cannot change OWNER role
    if (member.role === TripRole.OWNER) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Cannot change the role of the plan owner."
        );
    }

    // Cannot assign OWNER role
    if (payload.role === TripRole.OWNER) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Cannot assign OWNER role. OWNER is set automatically when creating a plan."
        );
    }

    const updated = await prisma.tripMember.update({
        where: { id: memberId },
        data: {
            role: payload.role
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true
                }
            }
        }
    });

    return updated;
};

const removeMember = async (authUser: TAuthUser, memberId: string) => {
    // Get the member record
    const member = await prisma.tripMember.findUnique({
        where: { id: memberId },
        include: {
            plan: {
                select: {
                    id: true,
                    ownerId: true
                }
            }
        }
    });

    if (!member) {
        throw new ApiError(httpStatus.NOT_FOUND, "Trip member not found.");
    }

    // Check if trying to remove OWNER
    if (member.role === TripRole.OWNER) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Cannot remove the plan owner. Transfer ownership first or delete the plan."
        );
    }

    // Allow self-removal (leave trip) or require canManageMembers permission
    if (member.userId !== authUser.userId) {
        await assertTripMemberPermission(authUser, member.planId, "canManageMembers");
    }

    const deleted = await prisma.tripMember.delete({
        where: { id: memberId }
    });

    return deleted;
};

export const TripMemberService = {
    addMember,
    getMembers,
    updateMemberRole,
    removeMember,
    // Export permission helper for use in other modules
    getTripMemberPermission,
    assertTripMemberPermission
};

