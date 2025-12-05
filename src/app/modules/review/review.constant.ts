export const reviewFilterableFields = [
  "rating",
  "source",
  "reviewerId",
  "reviewedUserId",
  "planId",
  "isEdited",
];

export const reviewSearchableFields = ["comment"];

// Rating Source Enum
export const ratingSourceEnum = ["USER_TO_USER", "USER_TO_TRIP"] as const;

// Rating constraints
export const minRating = 1;
export const maxRating = 5;
export const ratingOptions = [1, 2, 3, 4, 5] as const;

