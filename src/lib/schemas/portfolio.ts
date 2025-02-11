import { z } from "zod";

export const createPortfolioSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(50, "Name must be 50 characters or less")
      .regex(/^\S+$/, "Spaces are not allowed"),
    password: z
      .string()
      .min(3, "Password is required")
      .max(50, "Password must be 50 characters or less")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character"
      ),

    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const selectPortfolioSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .regex(/^\S+$/, "Spaces are not allowed"),

  password: z
    .string()
    .min(3, "Password is required")
    .max(50, "Password must be 50 characters or less")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character"
    ),
});
