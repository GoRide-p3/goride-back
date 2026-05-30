import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js"
import { LoginInput, RegisterInput } from "./auth.schema.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const SALT_ROUNDS = 10;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido no .env");
}

function generateToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

function formatUser(user: {
  id: string;
  name: string;
  email: string;
  gender: string;
  phone: string | null;
  birthDate: string | null;
  rating: number;
  totalRatings: number;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    phone: user.phone,
    birthDate: user.birthDate,
    rating: user.rating,
    totalRatings: user.totalRatings,
    createdAt: user.createdAt,
  };
}

export async function register(data: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { cpf: data.cpf }],
    },
  });

  if (existing) {
    throw new AppError(
      existing.email === data.email
        ? "Dados informados já estão vinculados a uma conta ativa."
        : "Dados informados já estão vinculados a uma conta ativa.",
      409,
    );
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      phone: data.phone,
      gender: data.gender,
      birthDate: data.birthDate,
      passwordHash,
    },
  });

  const token = generateToken(user.id);

  return { user: formatUser(user), token };
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError("E-mail ou senha inválidos", 401);
  }

  const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatch) {
    throw new AppError("E-mail ou senha inválidos", 401);
  }

  const token = generateToken(user.id);

  return { user: formatUser(user), token };
}