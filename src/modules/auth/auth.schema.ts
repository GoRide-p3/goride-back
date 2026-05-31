import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos sem formatação"),
  phone: z.string().optional(),
  gender: z.string().min(1),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;