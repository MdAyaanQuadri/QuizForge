import { Router } from "express";

import {
  bulkCreateQuestions,
  createQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestionsByQuizId,
  updateQuestion,
} from "../controller/question.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const questionRouter = Router();

questionRouter.get("/:quizId", authMiddleware, getQuestionsByQuizId);
questionRouter.get("/:quizId/:questionId", authMiddleware, getQuestionById);
questionRouter.post("/bulk/:quizId", authMiddleware, bulkCreateQuestions);
questionRouter.post("/:quizId", authMiddleware, createQuestion);
questionRouter.patch("/:quizId/:questionId", authMiddleware, updateQuestion);
questionRouter.delete("/:quizId/:questionId", authMiddleware, deleteQuestion);

export default questionRouter;
