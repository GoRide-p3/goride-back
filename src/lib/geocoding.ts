import fetch from "node-fetch";

const GEOCODING_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface Coordinates {
  lat: number;
  lng: number;
}

export async function geocodeAddress(
  address: string,
): Promise<Coordinates | null> {
  if (!GEOCODING_API_KEY) {
    console.warn("GOOGLE_MAPS_API_KEY não definida");
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GEOCODING_API_KEY}&language=pt-BR&region=br`;

  try {
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.status !== "OK" || !data.results?.[0]) {
      console.warn("Geocoding falhou para:", address, data.status);
      return null;
    }

    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } catch (error) {
    console.error("Erro no geocoding:", error);
    return null;
  }
}