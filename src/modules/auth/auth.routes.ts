import { Router } from "express";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  changePassword,
} from "./auth.controller.js";
import { authMiddleware } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.patch("/change-password", authMiddleware, changePassword);