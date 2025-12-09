"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxFilesPerUpload = exports.maxFileSize = exports.allowedImageTypes = exports.mediaProviderEnum = exports.mediaTypeEnum = exports.mediaSearchableFields = exports.mediaFilterableFields = void 0;
exports.mediaFilterableFields = [
    "type",
    "ownerId",
    "planId",
    "meetupId",
    "itineraryItemId",
    "provider",
];
exports.mediaSearchableFields = []; // No searchable fields
// Media Type Enum
exports.mediaTypeEnum = ["photo", "video"];
// Media Provider Enum
exports.mediaProviderEnum = ["cloudinary"];
// Allowed image MIME types
exports.allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
    "image/heic",
    "image/heif",
    "image/x-icon",
    "image/vnd.microsoft.icon",
];
// Maximum file size: 5MB in bytes
exports.maxFileSize = 5 * 1024 * 1024; // 5MB
// Maximum number of files per upload
exports.maxFilesPerUpload = 10;
