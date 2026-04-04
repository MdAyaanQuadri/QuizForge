import { z } from "zod";

export const quizValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Quiz name is required")
    .max(100, "Quiz name must be at most 100 characters long"),
  expiresAt: z.coerce.date({
    error: "Expires at must be a valid date",
  }),
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1"),
});

export const validateQuizInput = (data) => quizValidationSchema.safeParse(data);

export const quizUpdateValidationSchema = quizValidationSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required to update the quiz"
  );

export const validateQuizUpdateInput = (data) =>
  quizUpdateValidationSchema.safeParse(data);
