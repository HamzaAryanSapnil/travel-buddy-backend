import { TAuthUser } from "../tripMember/tripMember.interface";

export type TItineraryItemCreate = {
  planId: string;
  dayIndex: number;
  startAt?: string; // ISO date string
  endAt?: string; // ISO date string
  title: string;
  description?: string;
  locationId?: string;
  order?: number;
};

export type TItineraryItemUpdate = {
  dayIndex?: number;
  startAt?: string;
  endAt?: string;
  title?: string;
  description?: string;
  locationId?: string;
  order?: number;
};

export type TItineraryItemQuery = {
  planId: string;
  dayIndex?: string | number;
  page?: string | number;
  limit?: string | number;
};

export type TBulkUpsertItem = {
  id?: string; // If provided, update existing; otherwise create new
  dayIndex: number;
  startAt?: string;
  endAt?: string;
  title: string;
  description?: string;
  locationId?: string;
  order?: number;
};

export type TBulkUpsertPayload = {
  planId: string;
  items: TBulkUpsertItem[];
  replace?: boolean; // If true, delete all existing items before inserting
};

export type TReorderUpdate = {
  id: string;
  dayIndex: number;
  order: number;
};

export type TReorderPayload = {
  planId: string;
  updates: TReorderUpdate[];
};

export type TItineraryItemResponse = {
  id: string;
  planId: string;
  dayIndex: number;
  startAt: Date | null;
  endAt: Date | null;
  title: string;
  description: string | null;
  locationId: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  location?: {
    id: string;
    name: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    googlePlaceId?: string | null;
  } | null;
};

export type TItineraryGroupedResponse = {
  day: number;
  items: TItineraryItemResponse[];
};

export type TItineraryPlanItemsResponse = {
  days: TItineraryGroupedResponse[];
  totalDays: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

