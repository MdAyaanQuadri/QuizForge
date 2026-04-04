import Answer from "../model/answer.model.js";
import Attempt from "../model/attempt.model.js";
import Question from "../model/question.model.js";
import Quiz from "../model/quiz.model.js";
import { assertQuizNotExpired } from "./quiz.service.js";

const normalizeIndexes = (indexes = []) => [...indexes].sort((a, b) => a - b);

const getQuizByJoiningCode = async (joiningCode) => {
  const quiz = await Quiz.findOne({
    joiningCode: joiningCode.trim().toUpperCase(),
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  assertQuizNotExpired(quiz);

  return quiz;
};

export const joinParticipantService = async ({ joiningCode, participantName }) => {
  try {
    if (!joiningCode || !participantName) {
      throw new Error("Joining code and participant name are required");
    }

    const quiz = await getQuizByJoiningCode(joiningCode);

    const existingAttempt = await Attempt.findOne({
      quizId: quiz._id,
      participantName: participantName.trim(),
    });

    if (existingAttempt) {
      throw new Error("Participant name already taken for this quiz");
    }

    const attempt = await Attempt.create({
      quizId: quiz._id,
      participantName: participantName.trim(),
    });

    return {
      success: true,
      attempt,
      quiz: {
        _id: quiz._id,
        name: quiz.name,
        joiningCode: quiz.joiningCode,
        expiresAt: quiz.expiresAt,
        duration: quiz.duration,
      },
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error("Participant name already taken for this quiz");
    }

    throw new Error(error.message || "Failed to join quiz");
  }
};

export const getParticipantQuizService = async ({ attemptId }) => {
  try {
    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    const quiz = await Quiz.findById(attempt.quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    assertQuizNotExpired(quiz);

    const questions = await Question.find({ quizId: quiz._id })
      .select("-correctOptions")
      .sort({ createdAt: 1 });

    return {
      success: true,
      attempt: {
        _id: attempt._id,
        participantName: attempt.participantName,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      },
      quiz: {
        _id: quiz._id,
        name: quiz.name,
        joiningCode: quiz.joiningCode,
        expiresAt: quiz.expiresAt,
        duration: quiz.duration,
      },
      questions,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch participant quiz");
  }
};

export const submitParticipantAnswersService = async ({ attemptId, answers }) => {
  try {
    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    if (attempt.submittedAt) {
      throw new Error("Quiz already submitted");
    }

    const quiz = await Quiz.findById(attempt.quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    assertQuizNotExpired(quiz);

    const questions = await Question.find({ quizId: quiz._id });
    const questionMap = new Map(
      questions.map((question) => [question._id.toString(), question])
    );

    const answerQuestionIds = new Set();
    let score = 0;

    const answerDocuments = answers.map((answer) => {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        throw new Error("Answer contains invalid question");
      }

      if (answerQuestionIds.has(answer.questionId)) {
        throw new Error("Duplicate answer for the same question is not allowed");
      }

      answerQuestionIds.add(answer.questionId);

      const selectedOptions = normalizeIndexes(answer.selectedOptions);
      const correctOptions = normalizeIndexes(question.correctOptions);

      const areOptionsValid = selectedOptions.every(
        (optionIndex) => optionIndex < question.options.length
      );

      if (!areOptionsValid) {
        throw new Error("Selected option index is out of range");
      }

      const isCorrect =
        selectedOptions.length === correctOptions.length &&
        selectedOptions.every(
          (optionIndex, index) => optionIndex === correctOptions[index]
        );

      if (isCorrect) {
        score += 1;
      }

      return {
        attemptId: attempt._id,
        questionId: question._id,
        chosenOptions: selectedOptions,
      };
    });

    await Answer.insertMany(answerDocuments);

    attempt.score = score;
    attempt.submittedAt = new Date();
    await attempt.save();

    return {
      success: true,
      attempt: {
        _id: attempt._id,
        quizId: attempt.quizId,
        participantName: attempt.participantName,
        score: attempt.score,
        submittedAt: attempt.submittedAt,
      },
    };
  } catch (error) {
    throw new Error(error.message || "Failed to submit answers");
  }
};

export const getLeaderboardService = async ({ quizId }) => {
  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const leaderboard = await Attempt.find({
      quizId,
      submittedAt: { $ne: null },
    })
      .select("participantName score submittedAt")
      .sort({ score: -1, submittedAt: 1, createdAt: 1 });

    return {
      success: true,
      quiz: {
        _id: quiz._id,
        name: quiz.name,
      },
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        participantName: entry.participantName,
        score: entry.score,
        submittedAt: entry.submittedAt,
      })),
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch leaderboard");
  }
};
