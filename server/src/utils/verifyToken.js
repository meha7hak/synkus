import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.synkus_token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "Invalid token user" });

    req.user = user;
    next();
  } catch (err) {
    console.error("verifyToken err:", err.message);
    return res.status(401).json({ error: "Token verification failed" });
  }
};
