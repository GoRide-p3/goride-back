import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";

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

      // Chat
      socket.on("join_chat", ({ roomId }: { roomId: string }) => {
        socket.join(roomId);
        prisma.message.findMany({
          where: { roomId },
          orderBy: { createdAt: "asc" },
        }).then((history) => {
          socket.emit("chat_history", history.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            text: m.text,
            timestamp: m.createdAt,
          })));
        }).catch(console.error);
      });

      socket.on("send_message", async ({ roomId, text }: { roomId: string; text: string }) => {
          try {
          const saved = await prisma.message.create({
            data: { roomId, senderId: userId, text },
            include: { sender: { select: { name: true } } },
          });
          const message = {
            id: saved.id,
            senderId: saved.senderId,
            senderName: saved.sender.name,
            text: saved.text,
            timestamp: saved.createdAt,
          };
          io!.to(roomId).emit("chat_message", message);
        } catch (error) {
          console.error("[CHAT] Erro ao salvar mensagem:", error);
        }
      });

      socket.on("leave_chat", ({ roomId }: { roomId: string }) => {
        socket.leave(roomId);
      });

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