import {
  bulkCreateQuestionsService,
  createQuestionService,
  deleteQuestionService,
  getQuestionByIdService,
  getQuestionsByQuizIdService,
  updateQuestionService,
} from "../service/question.service.js";
import {
  validateQuestionBodyInput,
  validateQuestionUpdateInput,
} from "../validation/question.validation.js";

const getQuestionStatusCode = (message) => {
  if (message === "Quiz not found" || message === "Question not found") {
    return 404;
  }

  if (message === "You are not allowed to modify this quiz") {
    return 403;
  }

  if (message === "Quiz is expired") {
    return 410;
  }

  return 400;
};

export const bulkCreateQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    const { quizId } = req.params;

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Questions must be an array",
      });
    }

    const result = await bulkCreateQuestionsService({
      quizId,
      userId: req.user._id,
      questions,
    });

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    return res.status(getQuestionStatusCode(error.message)).json({
      success: false,
      message: error.message || "Bulk question creation failed",
    });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const validationResult = validateQuestionBodyInput(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message:
          validationResult.error.issues[0]?.message || "Invalid question data",
      });
    }

    const result = await createQuestionService({
      quizId: req.params.quizId,
      userId: req.user._id,
      questionData: validationResult.data,
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(getQuestionStatusCode(error.message)).json({
      success: false,
      message: error.message || "Question creation failed",
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const validationResult = validateQuestionUpdateInput(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message:
          validationResult.error.issues[0]?.message ||
          "Invalid question update data",
      });
    }

    const result = await updateQuestionService({
      quizId: req.params.quizId,
      questionId: req.params.questionId,
      userId: req.user._id,
      updates: validationResult.data,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(getQuestionStatusCode(error.message)).json({
      success: false,
      message: error.message || "Question update failed",
    });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const result = await deleteQuestionService({
      quizId: req.params.quizId,
      questionId: req.params.questionId,
      userId: req.user._id,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(getQuestionStatusCode(error.message)).json({
      success: false,
      message: error.message || "Question deletion failed",
    });
  }
};

export const getQuestionsByQuizId = async (req, res) => {
  try {
    const result = await getQuestionsByQuizIdService({
      quizId: req.params.quizId,
      userId: req.user._id,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(getQuestionStatusCode(error.message)).json({
      success: false,
      message: error.message || "Failed to fetch questions",
    });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const result = await getQuestionByIdService({
      quizId: req.params.quizId,
      questionId: req.params.questionId,
      userId: req.user._id,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(getQuestionStatusCode(error.message)).json({
      success: false,
      message: error.message || "Failed to fetch question",
    });
  }
};
