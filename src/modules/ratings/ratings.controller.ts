import type { Request, Response } from "express";
import { AppError } from "../../lib/app-error.js";
import { createRatingSchema } from "./rating.schema.js";
import * as ratingsService from "./ratings.service.js";

function sendControllerError(response: Response, error: unknown) {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "Erro interno do servidor" });
}

export async function createRating(request: Request, response: Response) {
  try {
    const parsed = createRatingSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Dados invalidos",
        issues: parsed.error.issues,
      });
      return;
    }

    const fromUserId = request.userId;
    if (!fromUserId) {
      response.status(401).json({ message: "Não autorizado: Usuário não identificado." });
      return;
    }

    const rating = await ratingsService.createRating({
      ...parsed.data,
      fromUserId,
    });
    
    response.status(201).json(rating);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function listUserRatings(request: Request, response: Response) {
  try {
    const ratings = await ratingsService.listUserRatings(request.params.userId);
    response.json(ratings);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function listRideRatings(request: Request, response: Response) {
  try {
    const ratings = await ratingsService.listRideRatings(request.params.rideId);
    response.json(ratings);
  } catch (error) {
    sendControllerError(response, error);
  }
}
