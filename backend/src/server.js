const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const { createApp } = require("./app");
const { connectDb } = require("./config/db");
const { verifyAuthToken } = require("./utils/jwt");

async function main() {
  await connectDb(process.env.MONGO_URI);

  const app = createApp();
  const port = Number(process.env.PORT || 5000);

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  // Attach io instance so controllers can emit events via req.app.get("io")
  app.set("io", io);

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || "";
      if (!token) return next(new Error("Unauthorized"));
      const decoded = verifyAuthToken(token);
      socket.userId = decoded.sub;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Join a room for this user so we can emit targeted notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on("disconnect", () => {
      // No-op for now; room cleanup is automatic
    });
  });

  server.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});