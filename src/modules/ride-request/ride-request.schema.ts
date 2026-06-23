import { z } from "zod";

export const createRideRequestSchema = z.object({
  passengerId: z.string().min(1),
  boardingAddress: z.string().optional(),
  boardingLat: z.coerce.number().optional(),
  boardingLng: z.coerce.number().optional(),
});

export const updateRideRequestSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
  driverId: z.string().min(1),

});

export type CreateRideRequestInput = z.infer<typeof createRideRequestSchema>;
export type UpdateRideRequestInput = z.infer<typeof updateRideRequestSchema>;