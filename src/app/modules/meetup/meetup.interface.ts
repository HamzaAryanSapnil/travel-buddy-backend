import { MeetupStatus } from "@prisma/client";

export type TAuthUser = {
    userId: string;
    email: string;
    role: string;
};

export type TMeetupCreatePayload = {
    planId: string;
    scheduledAt: string;
    location?: string;
    locationId?: string;
    maxParticipants?: number;
    videoRoomLink?: string;
};

export type TMeetupUpdatePayload = Partial<Omit<TMeetupCreatePayload, "planId">>;

export type TMeetupQuery = {
    searchTerm?: string;
    status?: MeetupStatus;
    planId?: string;
    organizerId?: string;
    page?: string | number;
    limit?: string | number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

export type TRsvpPayload = {
    status: "ACCEPTED" | "DECLINED";
};

export type TMeetupResponse = {
    id: string;
    planId: string;
    organizerId: string;
    scheduledAt: Date;
    location: string | null;
    locationId: string | null;
    status: MeetupStatus;
    maxParticipants: number | null;
    videoRoomLink: string | null;
    createdAt: Date;
    updatedAt: Date;
    organizer: {
        id: string;
        fullName: string | null;
        email: string;
        profileImage: string | null;
    };
    plan: {
        id: string;
        title: string;
        destination: string;
    };
    locationRel?: {
        id: string;
        name: string;
        address: string | null;
        city: string | null;
        country: string | null;
        latitude: number | null;
        longitude: number | null;
    } | null;
    invitationCount?: number;
};

export type TMeetupListResponse = {
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data: TMeetupResponse[];
};

