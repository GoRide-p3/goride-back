import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateRideRequestInput, UpdateRideRequestInput } from "./ride-request.schema.js";
import { calculateBoardingTime } from "../../lib/boarding-time.js";
import { getIO } from "../../lib/socket.js";

export async function createRideRequest(
  rideId: string,
  data: CreateRideRequestInput,
) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new AppError("Carona não encontrada", 404);
  if (ride.status !== "active") throw new AppError("Carona não está ativa", 400);
  if (ride.availableSeats === 0) throw new AppError("Sem vagas disponíveis", 400);
  if (ride.driverId === data.passengerId) {
    throw new AppError("Motorista não pode solicitar a própria carona", 400);
  }

  const existing = await prisma.rideRequest.findUnique({
    where: { rideId_passengerId: { rideId, passengerId: data.passengerId } },
  });
  if (existing) throw new AppError("Solicitação já enviada", 409);

  return prisma.rideRequest.create({
    data: {
      rideId,
      passengerId: data.passengerId,
      boardingAddress: data.boardingAddress ?? null,
      boardingLat: data.boardingLat ?? null,
      boardingLng: data.boardingLng ?? null,
    },
    include: { passenger: true, ride: true },
  });
}

export async function listRideRequests(rideId: string) {
  return prisma.rideRequest.findMany({
    where: { rideId },
    include: { passenger: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function listPassengerRequests(passengerId: string) {
  return prisma.rideRequest.findMany({
    where: { passengerId },
    include: {
      ride: { include: { driver: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function markBoardingModalSeen(requestId: string) {
  return prisma.rideRequest.update({
    where: { id: requestId },
    data: { seenBoardingModal: true },
  });
}

export async function updateRideRequest(
  requestId: string,
  driverId: string,
  data: { status: "accepted" | "rejected" },
) {
  const request = await prisma.rideRequest.findUnique({
    where: { id: requestId },
    include: {
      ride: {
        include: { driver: true },
      },
      passenger: true,
    },
  });

  if (!request) throw new AppError("Solicitação não encontrada", 404);
  if (request.ride.driverId !== driverId) {
    throw new AppError("Apenas o motorista pode responder solicitações", 403);
  }
  if (request.status !== "pending") {
    throw new AppError("Solicitação já foi processada", 400);
  }

  let boardingTime: string | null = null;
  if (
    data.status === "accepted" &&
    request.ride.originLat !== null &&
    request.ride.originLng !== null &&
    request.boardingLat !== null &&
    request.boardingLng !== null
  ) {
    boardingTime = await calculateBoardingTime(
      request.ride.originLat,
      request.ride.originLng,
      request.boardingLat,
      request.boardingLng,
      request.ride.departureTimeStart,
    );
  }

  const updated = await prisma.rideRequest.update({
    where: { id: requestId },
    data: {
      status: data.status,
      ...(boardingTime ? { boardingTime } : {}),
    },
    include: { passenger: true, ride: true },
  });

  if (data.status === "accepted") {
    await prisma.ride.update({
      where: { id: request.rideId },
      data: { availableSeats: { decrement: 1 } },
    });

    try {
      getIO().to(request.passengerId).emit("ride_accepted", {
        requestId: updated.id,
        rideId: request.rideId,
        driverName: request.ride.driver.name,
        origin: request.ride.origin,
        destination: request.ride.destination,
        date: request.ride.date,
        departureTimeStart: request.ride.departureTimeStart,
        boardingAddress: request.boardingAddress,
        boardingTime,                        
      });
      console.log(`[WS] Evento ride_accepted emitido para ${request.passengerId}`);
    } catch (error) {
      console.error("[WS] Falha ao emitir ride_accepted:", error);
    }
  }

  return updated;
}