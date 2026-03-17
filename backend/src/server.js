const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const { createApp } = require("./app");
const { connectDb } = require("./config/db");


const Message = require("./models/Message");

async function main() {
  try {
    await connectDb(process.env.MONGO_URI);

    const app = createApp();
    const port = Number(process.env.PORT || 5000);

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    app.set("io", io);

    io.on("connection", (socket) => {
      console.log("✅ User connected:", socket.id);

      // JOIN ROOM
      socket.on("join_task_room", (taskId) => {
        const room = `task:${taskId}`;
        socket.join(room);
        console.log(`📡 ${socket.id} joined ${room}`);
      });

      // SEND MESSAGE 
      socket.on("send_task_message", async (data) => {
        const room = `task:${data.taskId}`;
        console.log("📩 Message:", data);

        // SAVE TO MONGODB
        try {
          await Message.create({
            taskId: data.taskId,
            senderId: data.senderId, // ✅ FIXED HERE
            text: data.text,
          });
        } catch (err) {
          console.error("❌ DB Save Error:", err);
        }

        
        io.to(room).emit("receive_task_message", data);
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);
      });
    });

    server.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Server error:", err);
  }
}

main();