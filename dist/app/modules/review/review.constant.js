"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingOptions = exports.maxRating = exports.minRating = exports.ratingSourceEnum = exports.reviewSearchableFields = exports.reviewFilterableFields = void 0;
exports.reviewFilterableFields = [
    "rating",
    "source",
    "reviewerId",
    "reviewedUserId",
    "planId",
    "isEdited",
];
exports.reviewSearchableFields = ["comment"];
// Rating Source Enum
exports.ratingSourceEnum = ["USER_TO_USER", "USER_TO_TRIP"];
// Rating constraints
exports.minRating = 1;
exports.maxRating = 5;
exports.ratingOptions = [1, 2, 3, 4, 5];
