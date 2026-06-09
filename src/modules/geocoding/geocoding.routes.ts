import { Router } from "express";
import { geocodeAddress } from "../../lib/geocoding.js";

export const geocodingRouter = Router();

geocodingRouter.get("/geocode", async (request, response) => {
  const { address } = request.query;

  if (!address || typeof address !== "string") {
    response.status(400).json({ message: "Endereço obrigatório" });
    return;
  }

  const coords = await geocodeAddress(address);

  if (!coords) {
    response.status(404).json({ message: "Endereço não encontrado" });
    return;
  }

  response.json(coords);
});