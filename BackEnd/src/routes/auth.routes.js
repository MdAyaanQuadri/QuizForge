import { Router } from "express";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  signupUser,
} from "../controller/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const authRouter = Router();

// quiz creator signup route
authRouter.post("/signup", signupUser);

// quiz creator login route
authRouter.post("/login", loginUser);
authRouter.post("/logout", authMiddleware, logoutUser);
authRouter.get("/me", authMiddleware, getCurrentUser);

export default authRouter;
