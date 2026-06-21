import { Router } from "express";
import {
  createRideRequest,
  listRideRequests,
  updateRideRequest,
  listPassengerRequests,
} from "./ride-request.controller.js";

export const rideRequestsRouter = Router();

rideRequestsRouter.post("/rides/:rideId/requests", createRideRequest);
rideRequestsRouter.get("/rides/:rideId/requests", listRideRequests);

rideRequestsRouter.patch("/requests/:requestId", updateRideRequest);

rideRequestsRouter.get("/passengers/:passengerId/requests", listPassengerRequests);