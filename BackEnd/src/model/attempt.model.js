import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    participantName: {
      type: String,
      required: true,
      trim: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

attemptSchema.index({ quizId: 1, participantName: 1 }, { unique: true });

const Attempt = mongoose.model("Attempt", attemptSchema);

export default Attempt;
