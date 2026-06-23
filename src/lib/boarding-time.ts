import fetch from "node-fetch";

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function calculateBoardingTime(
  originLat: number,
  originLng: number,
  boardingLat: number,
  boardingLng: number,
  departureTimeStart: string,
): Promise<string | null> {
  if (!MAPS_API_KEY) {
    console.warn("[BOARDING] GOOGLE_MAPS_API_KEY não definida");
    return null;
  }

  try {
    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${originLat},${originLng}` +
      `&destination=${boardingLat},${boardingLng}` +
      `&mode=driving&key=${MAPS_API_KEY}&language=pt-BR&region=br`;

    const response = await fetch(url);
    const data = (await response.json()) as any;

    if (data.status !== "OK" || !data.routes?.[0]?.legs?.[0]) {
      console.warn("[BOARDING] Directions API falhou:", data.status);
      return null;
    }

    const durationSeconds: number = data.routes[0].legs[0].duration.value;

    const [hours, minutes] = departureTimeStart.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + Math.round(durationSeconds / 60);
    const boardingHours = Math.floor(totalMinutes / 60) % 24;
    const boardingMinutes = totalMinutes % 60;

    return `${String(boardingHours).padStart(2, "0")}:${String(boardingMinutes).padStart(2, "0")}`;
  } catch (error) {
    console.error("[BOARDING] Erro ao calcular horário:", error);
    return null;
  }
}