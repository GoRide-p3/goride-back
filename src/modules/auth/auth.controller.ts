import type { Request, Response } from "express";
import { AppError } from "../../lib/app-error.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import * as authService from "../auth/auth.service.js"

function sendControllerError(response: Response, error: unknown) {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }
  console.error(error);
  response.status(500).json({ message: "Erro interno do servidor" });
}

export async function register(request: Request, response: Response) {
  try {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Dados inválidos",
        issues: parsed.error.issues,
      });
      return;
    }

    const result = await authService.register(parsed.data);
    response.status(201).json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function login(request: Request, response: Response) {
  try {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Dados inválidos",
        issues: parsed.error.issues,
      });
      return;
    }

    const result = await authService.login(parsed.data);
    response.json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}