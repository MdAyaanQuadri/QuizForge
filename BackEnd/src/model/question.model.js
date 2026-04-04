import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 2,
        message: "Question must have at least two options",
      },
    },
    correctOptions: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 1,
        message: "At least one correct option index is required",
      },
    },
    optionType: {
      type: String,
      enum: ["single", "multiple"],
      default: "single",
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
