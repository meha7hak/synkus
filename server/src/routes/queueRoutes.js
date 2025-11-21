import express from "express";
import {searchSongs} from "../controllers/queueController.js";
import {addToQueue} from "../controllers/queueController.js";

const router = express.Router();
router.get("/search", searchSongs);
router.post("/add", addToQueue);
export default router;