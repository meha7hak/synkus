import express from "express";
import {
  loginWithSpotify,
  spotifyCallback,
  getMe,
  logout
} from "../controllers/authController.js";

const router = express.Router();

router.get("/login", loginWithSpotify);
router.get("/callback", spotifyCallback);
router.get("/me", getMe);
router.post("/logout", logout);

export default router;
