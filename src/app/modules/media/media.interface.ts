export type TAuthUser = {
  userId: string;
  email: string;
  role: string;
};

export type TMediaCreatePayload = {
  imageUrls: string[];
  planId?: string;
  meetupId?: string;
  itineraryItemId?: string;
  type?: "photo" | "video";
};

export type TMediaQuery = {
  type?: "photo" | "video";
  ownerId?: string;
  planId?: string;
  meetupId?: string;
  itineraryItemId?: string;
  provider?: string;
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type TMediaResponse = {
  id: string;
  ownerId: string;
  planId: string | null;
  meetupId: string | null;
  itineraryItemId: string | null;
  url: string;
  provider: string;
  type: string | null;
  createdAt: Date;
  owner: {
    id: string;
    fullName: string | null;
    email: string;
    profileImage: string | null;
  };
  plan: {
    id: string;
    title: string;
    destination: string;
  } | null;
  meetup: {
    id: string;
    scheduledAt: Date;
    location: string | null;
  } | null;
  itineraryItem: {
    id: string;
    title: string;
    dayIndex: number;
  } | null;
};

export type TMediaListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: TMediaResponse[];
};

export type TMediaUploadResponse = {
  message: string;
  uploadedCount: number;
  failedCount: number;
  media: TMediaResponse[];
  errors?: string[];
};

