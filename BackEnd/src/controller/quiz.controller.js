import {
  createQuizService,
  deleteQuizService,
  getMyQuizzesService,
  getQuizByIdService,
  getQuizByJoiningCodeService,
  updateQuizService,
} from "../service/quiz.service.js";
import {
  validateQuizInput,
  validateQuizUpdateInput,
} from "../validation/quiz.validation.js";

const getQuizStatusCode = (message) => {
  if (message === "Quiz not found") {
    return 404;
  }

  if (message === "You are not allowed to modify this quiz") {
    return 403;
  }

  if (message === "Quiz is expired") {
    return 410;
  }

  if (message === "Expired quiz can only update expiresAt") {
    return 400;
  }

  return 400;
};

export const createQuiz = async (req, res) => {
  try {
    const validationResult = validateQuizInput(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.error.issues[0]?.message || "Invalid quiz data",
      });
    }

    const result = await createQuizService({
      creatorId: req.user._id,
      ...validationResult.data,
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Quiz creation failed",
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const validationResult = validateQuizUpdateInput(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message:
          validationResult.error.issues[0]?.message || "Invalid quiz update data",
      });
    }

    const result = await updateQuizService({
      quizId: req.params.quizId,
      userId: req.user._id,
      updates: validationResult.data,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(getQuizStatusCode(error.message)).json({
      success: false,
      message: error.message || "Quiz update failed",
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const result = await deleteQuizService({
      quizId: req.params.quizId,
      userId: req.user._id,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(getQuizStatusCode(error.message)).json({
      success: false,
      message: error.message || "Quiz deletion failed",
    });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const result = await getQuizByIdService({
      quizId: req.params.quizId,
      userId: req.user._id,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(getQuizStatusCode(error.message)).json({
      success: false,
      message: error.message || "Failed to fetch quiz",
    });
  }
};

export const getQuizByJoiningCode = async (req, res) => {
  try {
    const result = await getQuizByJoiningCodeService({
      joiningCode: req.params.joiningCode,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(
      error.message === "Quiz not found" ? 404 :
      error.message === "Quiz is expired" ? 410 : 400
    ).json({
      success: false,
      message: error.message || "Failed to fetch quiz by joining code",
    });
  }
};

export const getMyQuizzes = async (req, res) => {
  try {
    const result = await getMyQuizzesService({
      userId: req.user._id,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch quizzes",
    });
  }
};
