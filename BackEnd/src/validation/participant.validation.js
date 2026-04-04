import { z } from "zod";

export const participantJoinValidationSchema = z.object({
  joiningCode: z.string().trim().min(1, "Joining code is required"),
  participantName: z
    .string()
    .trim()
    .min(1, "Participant name is required")
    .max(50, "Participant name must be at most 50 characters long"),
});

const answerItemSchema = z.object({
  questionId: z.string().trim().min(1, "Question id is required"),
  selectedOptions: z
    .array(z.number().int().min(0, "Selected option index must be 0 or more"))
    .min(1, "At least one selected option is required"),
});

export const participantSubmitValidationSchema = z.object({
  answers: z.array(answerItemSchema).min(1, "At least one answer is required"),
});

export const validateParticipantJoinInput = (data) =>
  participantJoinValidationSchema.safeParse(data);

export const validateParticipantSubmitInput = (data) =>
  participantSubmitValidationSchema.safeParse(data);
