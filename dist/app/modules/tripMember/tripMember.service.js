"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripMemberService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = require("../../shared/prisma");
const notification_service_1 = require("../notification/notification.service");
const tripMember_constant_1 = require("./tripMember.constant");
/**
 * Permission helper: Get user's role and capabilities for a plan
 */
const getTripMemberPermission = (authUser, planId) => __awaiter(void 0, void 0, void 0, function* () {
    const member = yield prisma_1.prisma.tripMember.findFirst({
        where: {
            planId,
            userId: authUser.userId,
            status: client_1.TripStatus.JOINED
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
            capabilities: tripMember_constant_1.rolePermissions[client_1.TripRole.OWNER]
        };
    }
    // If user is a member, return their capabilities
    if (member) {
        return {
            member: member,
            capabilities: tripMember_constant_1.rolePermissions[member.role]
        };
    }
    // No member record - no permissions
    return {
        member: null,
        capabilities: tripMember_constant_1.rolePermissions[client_1.TripRole.VIEWER]
    };
});
/**
 * Assert that user has a specific capability
 */
const assertTripMemberPermission = (authUser, planId, action, errorMessage) => __awaiter(void 0, void 0, void 0, function* () {
    const { member, capabilities } = yield getTripMemberPermission(authUser, planId);
    if (!capabilities[action]) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, errorMessage || `You do not have permission to ${action}.`);
    }
    return { member, capabilities };
});
const addMember = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if plan exists
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: payload.planId },
        select: {
            id: true,
            title: true,
            ownerId: true
        }
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check permission to invite
    yield assertTripMemberPermission(authUser, payload.planId, "canInvite");
    // Find the user by email
    const targetUser = yield prisma_1.prisma.user.findUnique({
        where: { email: payload.email }
    });
    if (!targetUser) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User with this email not found.");
    }
    // Check if user is already a member
    const existingMember = yield prisma_1.prisma.tripMember.findUnique({
        where: {
            planId_userId: {
                planId: payload.planId,
                userId: targetUser.id
            }
        }
    });
    if (existingMember) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, "User is already a member of this plan.");
    }
    // Cannot add OWNER role (only created during plan creation)
    if (payload.role === client_1.TripRole.OWNER) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot assign OWNER role. OWNER is set automatically when creating a plan.");
    }
    const result = yield prisma_1.prisma.tripMember.create({
        data: {
            planId: payload.planId,
            userId: targetUser.id,
            role: payload.role,
            status: client_1.TripStatus.JOINED,
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
    notification_service_1.NotificationService.notifyUser(plan.ownerId, {
        type: client_1.NotificationType.MEMBER_JOINED,
        title: "New member joined your travel plan",
        message: `${targetUser.fullName || targetUser.email} joined "${plan.title}"`,
        data: {
            planId: payload.planId,
            memberId: result.id
        }
    }).catch((error) => {
        // Log error but don't fail the member addition
        console.error("Failed to send notification for member join:", error);
    });
    return result;
});
const getMembers = (authUser, planId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if plan exists
    const plan = yield prisma_1.prisma.travelPlan.findUnique({
        where: { id: planId }
    });
    if (!plan) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Travel plan not found.");
    }
    // Check if user can view (must be member or plan is PUBLIC)
    const { member } = yield getTripMemberPermission(authUser, planId);
    if (!member && plan.visibility !== client_1.PlanVisibility.PUBLIC) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to view members of this plan.");
    }
    const members = yield prisma_1.prisma.tripMember.findMany({
        where: {
            planId,
            status: client_1.TripStatus.JOINED
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
});
const updateMemberRole = (authUser, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the member record by planId and userId
    const member = yield prisma_1.prisma.tripMember.findUnique({
        where: {
            planId_userId: {
                planId: payload.planId,
                userId: payload.userId
            }
        },
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Trip member not found.");
    }
    // Check permission to manage members
    yield assertTripMemberPermission(authUser, member.planId, "canManageMembers");
    // Cannot change OWNER role
    if (member.role === client_1.TripRole.OWNER) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot change the role of the plan owner.");
    }
    // Cannot assign OWNER role
    if (payload.role === client_1.TripRole.OWNER) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot assign OWNER role. OWNER is set automatically when creating a plan.");
    }
    const updated = yield prisma_1.prisma.tripMember.update({
        where: { id: member.id },
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
});
const removeMember = (authUser, memberId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the member record
    const member = yield prisma_1.prisma.tripMember.findUnique({
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Trip member not found.");
    }
    // Check if trying to remove OWNER
    if (member.role === client_1.TripRole.OWNER) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot remove the plan owner. Transfer ownership first or delete the plan.");
    }
    // Allow self-removal (leave trip) or require canManageMembers permission
    if (member.userId !== authUser.userId) {
        yield assertTripMemberPermission(authUser, member.planId, "canManageMembers");
    }
    const deleted = yield prisma_1.prisma.tripMember.delete({
        where: { id: memberId }
    });
    return deleted;
});
exports.TripMemberService = {
    addMember,
    getMembers,
    updateMemberRole,
    removeMember,
    // Export permission helper for use in other modules
    getTripMemberPermission,
    assertTripMemberPermission
};
