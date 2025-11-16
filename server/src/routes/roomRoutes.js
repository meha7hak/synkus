import express from "express";
import{verifyToken} from "../utils/verifyToken.js";
import { createRoom, joinRoom, getRoomInfo } from "../controllers/roomController.js";

const router = express.Router();
router.post("/create", verifyToken, createRoom);
router.post("/join", joinRoom);
router.get("/:code", getRoomInfo);

export default router;