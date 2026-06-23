import { Router } from "express";
import {
  createRideRequest,
  listRideRequests,
  updateRideRequest,
  listPassengerRequests,
   markBoardingModalSeen,
} from "./ride-request.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";

export const rideRequestsRouter = Router();

rideRequestsRouter.post("/rides/:rideId/requests", createRideRequest);
rideRequestsRouter.get("/rides/:rideId/requests", listRideRequests);

rideRequestsRouter.patch("/requests/:requestId", authMiddleware, updateRideRequest);
rideRequestsRouter.patch("/requests/:requestId/seen", markBoardingModalSeen);

rideRequestsRouter.get("/passengers/:passengerId/requests", listPassengerRequests);