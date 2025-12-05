export const mediaFilterableFields = [
  "type",
  "ownerId",
  "planId",
  "meetupId",
  "itineraryItemId",
  "provider",
];

export const mediaSearchableFields: string[] = []; // No searchable fields

// Media Type Enum
export const mediaTypeEnum = ["photo", "video"] as const;

// Media Provider Enum
export const mediaProviderEnum = ["cloudinary"] as const;

// Allowed image MIME types
export const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

// Maximum file size: 5MB in bytes
export const maxFileSize = 5 * 1024 * 1024; // 5MB

// Maximum number of files per upload
export const maxFilesPerUpload = 10;

