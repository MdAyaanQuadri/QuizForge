import { z } from "zod";

const refineQuestionSchema = (schema) =>
  schema.superRefine((data, ctx) => {
    const isValidIndex = data.correctOptions.every(
      (index) => index < data.options.length
    );

    if (!isValidIndex) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Correct option index is out of range",
        path: ["correctOptions"],
      });
    }

    const uniqueIndexes = new Set(data.correctOptions);

    if (uniqueIndexes.size !== data.correctOptions.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Correct option indexes must be unique",
        path: ["correctOptions"],
      });
    }

    if (data.optionType === "single" && data.correctOptions.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Single option type must have exactly one correct option",
        path: ["correctOptions"],
      });
    }
  });

const questionBaseSchema = z.object({
  quizId: z.string().trim().min(1, "Quiz id is required"),
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(500, "Question must be at most 500 characters long"),
  options: z
    .array(z.string().trim().min(1, "Option cannot be empty"))
    .min(2, "Question must have at least two options"),
  correctOptions: z
    .array(z.number().int().min(0, "Correct option index must be 0 or more"))
    .min(1, "At least one correct option index is required"),
  optionType: z.enum(["single", "multiple"]).default("single"),
});

const questionBodyBaseSchema = questionBaseSchema.omit({
  quizId: true,
});

export const questionValidationSchema = refineQuestionSchema(questionBaseSchema);

export const validateQuestionInput = (data) =>
  questionValidationSchema.safeParse(data);

export const questionBodyValidationSchema =
  refineQuestionSchema(questionBodyBaseSchema);

export const validateQuestionBodyInput = (data) =>
  questionBodyValidationSchema.safeParse(data);

export const questionUpdateValidationSchema = questionBodyBaseSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required to update the question"
  );

export const validateQuestionUpdateInput = (data) =>
  questionUpdateValidationSchema.safeParse(data);
