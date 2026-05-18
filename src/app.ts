import cors from "cors";
import express from "express";
import { AppError } from "./lib/app-error.js";
import { ridesRouter } from "./routes/rides.routes.js";

const corsOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) =>
  origin.trim(),
) ?? ["http://localhost:5173"];

export const app = express();

app.use(
  cors({
    origin: corsOrigins,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "goride-backend",
  });
});

app.use("/rides", ridesRouter);

app.use((_request, response) => {
  response.status(404).json({ message: "Rota nao encontrada" });
});

app.use(
  (
    error: Error,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof AppError) {
      response.status(error.statusCode).json({ message: error.message });
      return;
    }

    console.error(error);
    response.status(500).json({ message: "Erro interno do servidor" });
  },
);
