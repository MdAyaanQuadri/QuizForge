import {
  getLeaderboardService,
  getParticipantQuizService,
  joinParticipantService,
  submitParticipantAnswersService,
} from "../service/participant.service.js";
import {
  validateParticipantJoinInput,
  validateParticipantSubmitInput,
} from "../validation/participant.validation.js";

const getParticipantStatusCode = (message) => {
  if (message === "Quiz not found" || message === "Attempt not found") {
    return 404;
  }

  if (message === "Quiz is expired") {
    return 410;
  }

  if (
    message === "Participant name already taken for this quiz" ||
    message === "Quiz already submitted"
  ) {
    return 409;
  }

  return 400;
};

export const joinParticipant = async (req, res) => {
  try {
    const validationResult = validateParticipantJoinInput(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message:
          validationResult.error.issues[0]?.message || "Invalid join request",
      });
    }

    const result = await joinParticipantService(validationResult.data);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(getParticipantStatusCode(error.message)).json({
      success: false,
      message: error.message || "Failed to join quiz",
    });
  }
};

export const getParticipantQuiz = async (req, res) => {
  try {
    const result = await getParticipantQuizService({
      attemptId: req.params.attemptId,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(getParticipantStatusCode(error.message)).json({
      success: false,
      message: error.message || "Failed to fetch participant quiz",
    });
  }
};

export const submitParticipantAnswers = async (req, res) => {
  try {
    const validationResult = validateParticipantSubmitInput(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message:
          validationResult.error.issues[0]?.message ||
          "Invalid participant answers",
      });
    }

    const result = await submitParticipantAnswersService({
      attemptId: req.params.attemptId,
      answers: validationResult.data.answers,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(getParticipantStatusCode(error.message)).json({
      success: false,
      message: error.message || "Failed to submit answers",
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const result = await getLeaderboardService({
      quizId: req.params.quizId,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(getParticipantStatusCode(error.message)).json({
      success: false,
      message: error.message || "Failed to fetch leaderboard",
    });
  }
};
