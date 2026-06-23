import { Router } from "express";
import {
  createRating,
  listRideRatings,
  listUserRatings,
} from "./ratings.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";

export const ratingsRouter = Router();

ratingsRouter.post("/", authMiddleware, createRating);
ratingsRouter.get("/users/:userId", listUserRatings);
ratingsRouter.get("/rides/:rideId", listRideRatings);
