import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) ?? ["http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const rawToken = socket.handshake.auth?.token;

    if (typeof rawToken !== "string" || rawToken.length === 0) {
      socket.disconnect(true);
      return;
    }

    try {
      const payload = jwt.verify(rawToken, JWT_SECRET) as { sub: string };
      const userId = payload.sub;
      socket.join(userId);
      console.log(`[WS] Usuário ${userId} conectado (socket ${socket.id})`);
      socket.on("disconnect", () => {
        console.log(`[WS] Usuário ${userId} desconectado`);
      });
    } catch {
      socket.disconnect(true);
    }
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.IO não inicializado");
  return io;
}