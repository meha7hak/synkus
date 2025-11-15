import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://127.0.0.1:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("ping_from_client", (data) => {
    console.log("ping_from_client:", data);
    socket.emit("pong_from_server", { msg: "pong", ts: Date.now() });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// connect to DB and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`SynkUs backend running on http://127.0.0.1:${PORT}`);
  });
});
