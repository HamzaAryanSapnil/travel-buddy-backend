"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const registerValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ error: () => "Email is required!" })
            .pipe(zod_1.z.email({ error: () => "Invalid email address format." })),
        password: zod_1.z
            .string({ error: () => "Password is required!" })
            .min(8, { message: "Password must be at least 8 characters long." })
            .regex(/^(?=.*[A-Z])/, {
            message: "Password must contain at least 1 uppercase letter.",
        })
            .regex(/^(?=.*[!@#$%^&*])/, {
            message: "Password must contain at least 1 special character.",
        })
            .regex(/^(?=.*\d)/, {
            message: "Password must contain at least 1 number.",
        }),
        fullName: zod_1.z
            .string({ error: () => "Full name is required!" })
            .min(2, { message: "Full name must be at least 2 characters long." })
            .max(100, { message: "Full name cannot exceed 100 characters." })
            .optional(),
    }),
});
const loginValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ error: () => "Email is required!" })
            .pipe(zod_1.z.email({ error: () => "Invalid email address format." })),
        password: zod_1.z.string({ error: () => "Password is required!" }),
    }),
});
exports.AuthValidation = {
    registerValidationSchema,
    loginValidationSchema,
};
