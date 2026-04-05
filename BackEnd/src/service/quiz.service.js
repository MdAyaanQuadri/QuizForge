import Quiz from "../model/quiz.model.js";
import Question from "../model/question.model.js";
import { generateJoinCode } from "../utils/crypto.util.js";

const isQuizExpired = (quiz) => new Date() > new Date(quiz.expiresAt);

export const assertQuizNotExpired = (quiz) => {
  if (isQuizExpired(quiz)) {
    throw new Error("Quiz is expired");
  }
};

const generateUniqueJoinCode = async () => {
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const joiningCode = generateJoinCode();
    const existingQuiz = await Quiz.findOne({ joiningCode });

    if (!existingQuiz) {
      return joiningCode;
    }
  }

  throw new Error("Failed to generate a unique joining code");
};

export const createQuizService = async ({
  creatorId,
  name,
  expiresAt,
  duration,
}) => {
  try {
    if (!creatorId || !name || !expiresAt || !duration) {
      throw new Error("Creator id, name, expires at, and duration are required");
    }

    const joiningCode = await generateUniqueJoinCode();

    if (!joiningCode) {
      throw new Error("Joining code could not be generated");
    }

    const quiz = await Quiz.create({
      name,
      creatorId,
      joiningCode,
      expiresAt,
      duration,
    });

    if (!quiz || !quiz._id) {
      throw new Error("Failed to create quiz");
    }

    return {
      success: true,
      quiz,
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error("Joining code already exists, please try again");
    }

    throw new Error(error.message || "Quiz creation failed");
  }
};

export const getOwnedQuiz = async ({ quizId, userId }) => {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.creatorId.toString() !== userId.toString()) {
    throw new Error("You are not allowed to modify this quiz");
  }

  return quiz;
};

export const updateQuizService = async ({ quizId, userId, updates }) => {
  try {
    const quiz = await getOwnedQuiz({ quizId, userId });
    const quizExpired = isQuizExpired(quiz);

    if (quizExpired) {
      const updateKeys = Object.keys(updates);
      const onlyExpiresAtUpdate =
        updateKeys.length === 1 && updateKeys[0] === "expiresAt";

      if (!onlyExpiresAtUpdate) {
        throw new Error("Expired quiz can only update expiresAt");
      }
    }

    if (updates.expiresAt !== undefined) {
      quiz.expiresAt = updates.expiresAt;
    }

    if (updates.name !== undefined) {
      quiz.name = updates.name;
    }

    if (updates.duration !== undefined) {
      quiz.duration = updates.duration;
    }

    await quiz.save();

    return {
      success: true,
      quiz,
    };
  } catch (error) {
    throw new Error(error.message || "Quiz update failed");
  }
};

export const deleteQuizService = async ({ quizId, userId }) => {
  try {
    const quiz = await getOwnedQuiz({ quizId, userId });
    assertQuizNotExpired(quiz);

    await Question.deleteMany({ quizId: quiz._id });
    await Quiz.findByIdAndDelete(quiz._id);

    return {
      success: true,
      message: "Quiz deleted successfully",
    };
  } catch (error) {
    throw new Error(error.message || "Quiz deletion failed");
  }
};

export const getQuizByIdService = async ({ quizId, userId }) => {
  try {
    const quiz = await getOwnedQuiz({ quizId, userId });

    return {
      success: true,
      quiz,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch quiz");
  }
};

export const getQuizByJoiningCodeService = async ({ joiningCode }) => {
  try {
    const quiz = await Quiz.findOne({
      joiningCode: joiningCode.trim().toUpperCase(),
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    assertQuizNotExpired(quiz);

    const totalQuestions = await Question.countDocuments({ quizId: quiz._id });

    return {
      success: true,
      quiz,
      totalQuestions,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch quiz by joining code");
  }
};

export const getMyQuizzesService = async ({ userId }) => {
  try {
    const quizzes = await Quiz.find({ creatorId: userId }).sort({
      createdAt: -1,
    });

    return {
      success: true,
      quizzes,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch quizzes");
  }
};
