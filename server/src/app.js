import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://127.0.0.1:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/room", roomRoutes);
// test route
app.get("/", (req, res) => {
  res.json({ message: "SYNK US Backend Running" });
});

// auth routes
app.use("/auth", authRoutes);

export default app;