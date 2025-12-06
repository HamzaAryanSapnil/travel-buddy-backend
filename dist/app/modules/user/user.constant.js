"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoleValues = exports.userStatusValues = exports.userFilterableFields = exports.userSearchableFields = void 0;
exports.userSearchableFields = ["fullName", "email", "location"];
exports.userFilterableFields = [
    "searchTerm",
    "status",
    "role",
    "isVerified"
];
exports.userStatusValues = ["ACTIVE", "SUSPENDED", "DELETED"];
exports.userRoleValues = ["USER", "ADMIN"];
