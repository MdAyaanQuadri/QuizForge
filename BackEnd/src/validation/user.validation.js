import { z } from "zod";

// ai genrated since i dont know regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]/`~+=;']).+$/;

// makes sure user inputs are in poper format since user can put any data we need validation
export const userValidationSchema = z.object({
  email: z.email("Please provide a valid email address").trim().toLowerCase(),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be at most 100 characters long")
    .regex(
      passwordRegex,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

export const validateUserInput = (data) => userValidationSchema.safeParse(data);
