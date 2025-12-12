import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email address format." }),
    password: z
      .string()
      .min(1, { message: "Password is required!" })
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
    fullName: z
      .string({ error: "Full name is required!" })
      .min(2, { message: "Full name must be at least 2 characters long." })
      .max(100, { message: "Full name cannot exceed 100 characters." }),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.email({message: "Invalid email address format."}),
    password: z.string({error: "Password is required!"}),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
