import { AppError } from "../../lib/app-error.js";
import { geocodeAddress } from "../../lib/geocoding.js";
import { haversineDistance } from "../../lib/haversine.js";
import { prisma } from "../../lib/prisma.js"
import type { CreateRideInput, ListRidesQuery, UpdateRideInput } from "./ride.schema.js";


function formatRide(ride: any, passengerLat?: number, passengerLng?: number) {
  let proximityMeters: number | null = null;

  if (
    passengerLat !== undefined &&
    passengerLng !== undefined &&
    ride.originLat !== null &&
    ride.originLng !== null
  ) {
    proximityMeters = haversineDistance(
      passengerLat,
      passengerLng,
      ride.originLat,
      ride.originLng,
    );
  }

  return {
    id: ride.id,
    driverId: ride.driverId,
    driver: {
      id: ride.driver.id,
      name: ride.driver.name,
      rating: ride.driver.rating,
      totalRatings: ride.driver.totalRatings,
      gender: ride.driver.gender,
    },
    departure: ride.departureTimeStart,
    origin: ride.origin,
    destination: ride.destination,
    date: ride.date,
    departureTimeStart: ride.departureTimeStart,
    departureTimeEnd: ride.departureTimeEnd,
    price: ride.price,
    totalSeats: ride.totalSeats,
    availableSeats: ride.availableSeats,
    confirmedPassengers: ride.totalSeats - ride.availableSeats,
    routeId: ride.routeId,
    routeName: ride.routeName,
    sameGenderOnly: ride.sameGenderOnly,
    status: ride.status,
    createdAt: ride.createdAt,
    updatedAt: ride.updatedAt,
    proximityMeters, 
    isNearby: proximityMeters !== null && proximityMeters <= 500,
  };
}

async function ensureDriverExists(driverId: string) {
  const driver = await prisma.user.findUnique({
    where: { id: driverId },
    select: { id: true },
  });

  if (!driver) {
    throw new AppError("Motorista nao encontrado", 404);
  }
}

export async function listRides(query: ListRidesQuery) {
  const where: any = {};

  if (query.origin && !query.passengerLat) {
    where.origin = { contains: query.origin };
  }
  if (query.destination) where.destination = { contains: query.destination };
  if (query.date) {
    where.date = query.date;
  } else {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    where.date = { gte: todayStr };
  }

  if (query.timeStart) {
    where.departureTimeStart = {
      ...(query.timeStart ? { gte: query.timeStart } : {}),
      ...(query.timeEnd ? { lte: query.timeEnd } : {}),
    };
  }
  if (query.maxPrice !== undefined) where.price = { lte: query.maxPrice };
  if (query.sameGenderOnly !== undefined) {
    where.sameGenderOnly = query.sameGenderOnly;
  }
  if (query.driverId) where.driverId = query.driverId;
  if (query.status) where.status = query.status;

  const rides = await prisma.ride.findMany({
    where,
    include: { driver: true },
    orderBy: [{ date: "asc" }, { departureTimeStart: "asc" }],
  });

  const formatted = rides.map((ride) =>
    formatRide(ride, query.passengerLat, query.passengerLng),
  );

  if (query.passengerLat !== undefined && query.passengerLng !== undefined) {
    return formatted
      .filter((ride) => ride.proximityMeters === null || ride.proximityMeters <= 500)
      .sort((a, b) => {
        if (a.proximityMeters !== null && b.proximityMeters !== null) {
          return a.proximityMeters - b.proximityMeters;
        }
        if (a.proximityMeters !== null) return -1;
        if (b.proximityMeters !== null) return 1;
        return 0;
      });
  }

  return formatted;
}

export async function getRideById(id: string) {
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: { driver: true },
  });

  if (!ride) {
    throw new AppError("Carona nao encontrada", 404);
  }

  return formatRide(ride);
}

export async function getRideHistory(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const historyWhere = {
    OR: [
      { status: { not: "active" } },
      { date: { lt: today } },
    ],
  };

  const offered = await prisma.ride.findMany({
    where: {
      driverId: userId,
      ...historyWhere,
    },
    include: { driver: true },
    orderBy: [{ date: "desc" }, { departureTimeStart: "desc" }],
  });

  const requested = await prisma.rideRequest.findMany({
    where: {
      passengerId: userId,
      ride: historyWhere,
    },
    include: {
      ride: { include: { driver: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    offered: offered.map(formatRide),
    requested: requested.map((request) => ({
      id: request.id,
      status: request.status,
      requestedAt: request.createdAt,
      ride: formatRide(request.ride),
    })),
  };
}

export async function createRide(data: CreateRideInput) {
  await ensureDriverExists(data.driverId);

  const conflict = await prisma.ride.findFirst({
    where: {
      driverId: data.driverId,
      date: data.date,
      status: "active",
      OR: [
        {
          departureTimeStart: { lte: data.departureTimeStart },
          departureTimeEnd: { gte: data.departureTimeStart },
        },
        {
          departureTimeStart: { lte: data.departureTimeEnd },
          departureTimeEnd: { gte: data.departureTimeEnd },
        },
        {
          departureTimeStart: { gte: data.departureTimeStart },
          departureTimeEnd: { lte: data.departureTimeEnd },
        },
      ],
    },
  });

  if (conflict) {
    throw new AppError(
      `Você já tem uma carona ativa neste dia entre ${conflict.departureTimeStart} e ${conflict.departureTimeEnd}`,
      409,
    );
  }

  const availableSeats = data.availableSeats ?? data.totalSeats;

  const [originCoords, destinationCoords] = await Promise.all([
    geocodeAddress(data.origin),
    geocodeAddress(data.destination),
  ]);

  const ride = await prisma.ride.create({
    data: {
      ...data,
      availableSeats,
      originLat: originCoords?.lat ?? null,
      originLng: originCoords?.lng ?? null,
      destinationLat: destinationCoords?.lat ?? null,
      destinationLng: destinationCoords?.lng ?? null,
    },
    include: { driver: true },
  });

  return formatRide(ride);
}

export async function updateRide(id: string, data: UpdateRideInput) {
  await getRideById(id);

  if (data.driverId) {
    await ensureDriverExists(data.driverId);
  }

  const currentRide = await prisma.ride.findUniqueOrThrow({
    where: { id },
    select: { totalSeats: true, availableSeats: true },
  });

  const nextTotalSeats = data.totalSeats ?? currentRide.totalSeats;
  const nextAvailableSeats = data.availableSeats ?? currentRide.availableSeats;

  if (nextAvailableSeats > nextTotalSeats) {
    throw new AppError(
      "As vagas disponiveis nao podem superar o total de vagas",
      400,
    );
  }

  const ride = await prisma.ride.update({
    where: { id },
    data,
    include: { driver: true },
  });

  return formatRide(ride);
}

export async function deleteRide(id: string) {
  await getRideById(id);
  await prisma.ride.delete({ where: { id } });
}