import type { Coordinates } from "./geocoding.js";
import { haversineDistance } from "./haversine.js";

const EARTH_RADIUS_M = 6371000;

function toLocalMeters(point: Coordinates, reference: Coordinates) {
  const refLatRad = (reference.lat * Math.PI) / 180;
  const x =
    (point.lng - reference.lng) *
    Math.cos(refLatRad) *
    (Math.PI / 180) *
    EARTH_RADIUS_M;
  const y = (point.lat - reference.lat) * (Math.PI / 180) * EARTH_RADIUS_M;
  return { x, y };
}

function pointToSegmentDistance(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lengthSquared = abx * abx + aby * aby;

  if (lengthSquared === 0) {
    return Math.hypot(p.x - a.x, p.y - a.y);
  }

  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
}

export function distanceToRoute(
  passenger: Coordinates,
  routePoints: Coordinates[],
): number {
  if (routePoints.length === 0) return Infinity;

  if (routePoints.length === 1) {
    return haversineDistance(
      passenger.lat, passenger.lng,
      routePoints[0].lat, routePoints[0].lng,
    );
  }

  const p = { x: 0, y: 0 };
  let minDistance = Infinity;

  for (let i = 0; i < routePoints.length - 1; i++) {
    const a = toLocalMeters(routePoints[i], passenger);
    const b = toLocalMeters(routePoints[i + 1], passenger);
    minDistance = Math.min(minDistance, pointToSegmentDistance(p, a, b));
  }

  return minDistance;
}