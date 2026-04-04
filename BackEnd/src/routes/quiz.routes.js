import { Router } from "express";

import {
  createQuiz,
  deleteQuiz,
  getMyQuizzes,
  getQuizById,
  getQuizByJoiningCode,
  updateQuiz,
} from "../controller/quiz.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const quizRouter = Router();

quizRouter.get("/join/:joiningCode", getQuizByJoiningCode);
quizRouter.get("/mine", authMiddleware, getMyQuizzes);
quizRouter.get("/:quizId", authMiddleware, getQuizById);
quizRouter.post("/", authMiddleware, createQuiz);
quizRouter.patch("/:quizId", authMiddleware, updateQuiz);
quizRouter.delete("/:quizId", authMiddleware, deleteQuiz);

export default quizRouter;
