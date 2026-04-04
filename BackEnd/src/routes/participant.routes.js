import { Router } from "express";

import {
  getLeaderboard,
  getParticipantQuiz,
  joinParticipant,
  submitParticipantAnswers,
} from "../controller/participant.controller.js";

const participantRouter = Router();

participantRouter.post("/join", joinParticipant);
participantRouter.get("/quiz/:attemptId", getParticipantQuiz);
participantRouter.post("/submit/:attemptId", submitParticipantAnswers);
participantRouter.get("/leaderboard/:quizId", getLeaderboard);

export default participantRouter;
