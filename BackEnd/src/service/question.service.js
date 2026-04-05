import Question from "../model/question.model.js";
import { assertQuizNotExpired, getOwnedQuiz } from "./quiz.service.js";
import {
  validateQuestionInput,
  validateQuestionUpdateInput,
} from "../validation/question.validation.js";

export const bulkCreateQuestionsService = async ({
  quizId,
  userId,
  questions = [],
}) => {
  if (!Array.isArray(questions)) {
    throw new Error("Questions must be an array");
  }

  const quiz = await getOwnedQuiz({ quizId, userId });
  assertQuizNotExpired(quiz);

  const validQuestions = [];
  const invalidQuestions = [];

  questions.forEach((question, index) => {
    const validationResult = validateQuestionInput({
      ...question,
      quizId,
    });

    if (!validationResult.success) {
      invalidQuestions.push({
        index,
        question,
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    validQuestions.push(validationResult.data);
  });

  if (validQuestions.length === 0) {
    return {
      success: false,
      savedCount: 0,
      invalidCount: invalidQuestions.length,
      savedQuestions: [],
      invalidQuestions,
    };
  }

  try {
    const savedQuestions = await Question.insertMany(validQuestions);

    return {
      success: true,
      savedCount: savedQuestions.length,
      invalidCount: invalidQuestions.length,
      savedQuestions,
      invalidQuestions,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to save questions");
  }
};

export const createQuestionService = async ({ quizId, userId, questionData }) => {
  try {
    const quiz = await getOwnedQuiz({ quizId, userId });
    assertQuizNotExpire1d(quiz);

    const validationResult = validateQuestionInput({
      ...questionData,
      quizId,
    });

    if (!validationResult.success) {
      throw new Error(
        validationResult.error.issues[0]?.message || "Invalid question data"
      );
    }

    const question = await Question.create(validationResult.data);

    return {
      success: true,
      question,
    };
  } catch (error) {
    throw new Error(error.message || "Question creation failed");
  }
};

export const updateQuestionService = async ({
  quizId,
  questionId,
  userId,
  updates,
}) => {
  try {
    const quiz = await getOwnedQuiz({ quizId, userId });
    assertQuizNotExpired(quiz);

    const question = await Question.findOne({ _id: questionId, quizId });

    if (!question) {
      throw new Error("Question not found");
    }

    const updateValidationResult = validateQuestionUpdateInput(updates);

    if (!updateValidationResult.success) {
      throw new Error(
        updateValidationResult.error.issues[0]?.message ||
          "Invalid question update data"
      );
    }

    const mergedQuestion = {
      quizId,
      question: updateValidationResult.data.question ?? question.question,
      options: updateValidationResult.data.options ?? question.options,
      correctOptions:
        updateValidationResult.data.correctOptions ?? question.correctOptions,
      optionType: updateValidationResult.data.optionType ?? question.optionType,
    };

    const fullValidationResult = validateQuestionInput(mergedQuestion);

    if (!fullValidationResult.success) {
      throw new Error(
        fullValidationResult.error.issues[0]?.message ||
          "Invalid question update data"
      );
    }

    question.question = fullValidationResult.data.question;
    question.options = fullValidationResult.data.options;
    question.correctOptions = fullValidationResult.data.correctOptions;
    question.optionType = fullValidationResult.data.optionType;

    await question.save();

    return {
      success: true,
      question,
    };
  } catch (error) {
    throw new Error(error.message || "Question update failed");
  }
};

export const deleteQuestionService = async ({
  quizId,
  questionId,
  userId,
}) => {
  try {
    const quiz = await getOwnedQuiz({ quizId, userId });
    assertQuizNotExpired(quiz);

    const question = await Question.findOneAndDelete({ _id: questionId, quizId });

    if (!question) {
      throw new Error("Question not found");
    }

    return {
      success: true,
      message: "Question deleted successfully",
    };
  } catch (error) {
    throw new Error(error.message || "Question deletion failed");
  }
};

export const getQuestionsByQuizIdService = async ({ quizId, userId }) => {
  try {
    await getOwnedQuiz({ quizId, userId });

    const questions = await Question.find({ quizId }).sort({ createdAt: 1 });

    return {
      success: true,
      questions,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch questions");
  }
};

export const getQuestionByIdService = async ({
  quizId,
  questionId,
  userId,
}) => {
  try {
    await getOwnedQuiz({ quizId, userId });

    const question = await Question.findOne({ _id: questionId, quizId });

    if (!question) {
      throw new Error("Question not found");
    }

    return {
      success: true,
      question,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch question");
  }
};
