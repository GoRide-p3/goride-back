import { Router } from "express";
import { createRide, deleteRide, getRideById, listRides, updateRide } from "./rides.controller.js";

export const ridesRouter = Router();

ridesRouter.get("/", listRides);
ridesRouter.get("/:id", getRideById);
ridesRouter.post("/", createRide);
ridesRouter.put("/:id", updateRide);
ridesRouter.delete("/:id", deleteRide);
