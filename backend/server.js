import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

const server = http.createServer(app);

console.log("Allowing CORS origin:", process.env.FRONTEND_URL);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT"],
  },
});

// ─── Presence map ────────────────────────────────────────────────────────────
// roomUsers[applicationId] = Set of userId strings currently in that room.
// Exported so messageController.js can check presence when a message is sent.
export const roomUsers = {};

// ─── Helper ──────────────────────────────────────────────────────────────────
function removeFromRoom(applicationId, userId) {
  if (!roomUsers[applicationId]) return;
  roomUsers[applicationId].delete(userId);
  if (roomUsers[applicationId].size === 0) {
    delete roomUsers[applicationId];
  }
}

// ─── Socket.IO ───────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Frontend passes userId via socket.auth = { userId }
  const userId = socket.handshake.auth?.userId;

  // ── JOIN ROOM ──────────────────────────────────────────────────────────────
  socket.on("joinRoom", async (applicationId) => {
    if (!applicationId || !/^[0-9a-fA-F]{24}$/.test(applicationId)) {
      console.error(`Invalid applicationId for joinRoom: ${applicationId}`);
      return;
    }

    socket.join(applicationId);
    console.log(`Socket ${socket.id} (user ${userId}) joined room ${applicationId}`);

    // Track presence
    if (!roomUsers[applicationId]) roomUsers[applicationId] = new Set();
    roomUsers[applicationId].add(userId?.toString());

    // Tell the other person in the room this user is now online
    socket.to(applicationId).emit("userOnline", { userId });

    // Send back the current room members so the joiner can set the online dot
    socket.emit("roomPresence", {
      onlineUsers: [...roomUsers[applicationId]],
    });

    // Upgrade "sent" → "delivered" for messages this user hasn't seen yet
    // (they were sent while this user was offline / outside the room)
    try {
      const { Message } = await import("./models/messageSchema.js");

      const updated = await Message.updateMany(
        {
          applicationId,
          sender: { $ne: userId },   // messages I did NOT send
          status: "sent",            // only upgrade from "sent", not already "delivered"/"read"
        },
        { $set: { status: "delivered" } }
      );

      if (updated.modifiedCount > 0) {
        // Tell the sender(s) their messages are now delivered → grey double tick
        io.to(applicationId).emit("messagesDelivered", { applicationId });
        console.log(`Upgraded ${updated.modifiedCount} message(s) to delivered in room ${applicationId}`);
      }
    } catch (err) {
      console.error("Error upgrading messages to delivered:", err.message);
    }
  });

  // ── LEAVE ROOM ─────────────────────────────────────────────────────────────
  socket.on("leaveRoom", (applicationId) => {
    socket.leave(applicationId);
    removeFromRoom(applicationId, userId?.toString());
    socket.to(applicationId).emit("userOffline", { userId });
    console.log(`Socket ${socket.id} left room ${applicationId}`);
  });

  // ── TYPING ─────────────────────────────────────────────────────────────────
  socket.on("typing", ({ applicationId, userName }) => {
    socket.to(applicationId).emit("userTyping", { userId, userName });
  });

  socket.on("stopTyping", ({ applicationId }) => {
    socket.to(applicationId).emit("userStopTyping", { userId });
  });

  // ── DISCONNECT ─────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Remove this user from every room they were in and notify others
    Object.keys(roomUsers).forEach((applicationId) => {
      if (roomUsers[applicationId]?.has(userId?.toString())) {
        removeFromRoom(applicationId, userId?.toString());
        io.to(applicationId).emit("userOffline", { userId });
      }
    });
  });

  socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });
});

// Keep app.set for any places that use req.app.get("io")
app.set("io", io);

server.listen(process.env.PORT, () => {
  console.log(`Server running at port ${process.env.PORT}`);
});

export { io };
