import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    chosenOptions: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 1,
        message: "At least one chosen option is required",
      },
    },
  },
  {
    timestamps: true,
  }
);

answerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

const Answer = mongoose.model("Answer", answerSchema);

export default Answer;
