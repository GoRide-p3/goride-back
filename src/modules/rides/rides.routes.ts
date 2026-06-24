import { Router } from "express";
import {
  createRide,
  deleteRide,
  getRideById,
  getRideHistory,
  listRides,
  updateRide,
} from "./rides.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";

export const ridesRouter = Router();

ridesRouter.get("/", listRides);
ridesRouter.get("/history", authMiddleware, getRideHistory);
ridesRouter.get("/:id", getRideById);
ridesRouter.post("/", authMiddleware, createRide);
ridesRouter.put("/:id", authMiddleware, updateRide);
ridesRouter.delete("/:id", deleteRide);
