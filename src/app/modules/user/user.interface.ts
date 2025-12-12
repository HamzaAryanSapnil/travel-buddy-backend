export type TUserProfileUpdate = {
    fullName?: string;
    bio?: string;
    location?: string;
    interests?: string[];
    visitedCountries?: string[];
    profileImage?: string;
};

export type TAuthUser = {
    userId: string;
    email: string;
};

export type TTravelPlanQuery = {
    type?: "future" | "past" | "all";
    page?: string | number;
    limit?: string | number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

export type TReviewQuery = {
    reviewType?: "given" | "received";
    page?: string | number;
    limit?: string | number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};



