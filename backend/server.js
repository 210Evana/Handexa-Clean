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

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRoom", (applicationId) => {
    if (!applicationId || !/^[0-9a-fA-F]{24}$/.test(applicationId)) {
      console.error(`Invalid applicationId for joinRoom: ${applicationId}`);
      return;
    }
    socket.join(applicationId);
    console.log(`Socket ${socket.id} joined room ${applicationId}`);
  });

  socket.on("leaveRoom", (applicationId) => {
    socket.leave(applicationId);
    console.log(`Socket ${socket.id} left room ${applicationId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });
});

app.set("io", io);

server.listen(process.env.PORT, () => {
  console.log(`Server running at port ${process.env.PORT}`);
});

export { io };