import axios from "axios";
import querystring from "querystring";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-library-read",
  "user-read-playback-state",
  "user-modify-playback-state",
  "streaming"
].join(" ");

export const loginWithSpotify = (req, res) => {
  const params = {
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    show_dialog: true
  };
  const url = `https://accounts.spotify.com/authorize?${querystring.stringify(params)}`;
  return res.redirect(url);
};

export const spotifyCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code returned from Spotify");

  const tokenURL = "https://accounts.spotify.com/api/token";
  const body = querystring.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET
  });

  try {
    const tokenResp = await axios.post(tokenURL, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    const { access_token, refresh_token, expires_in } = tokenResp.data;

    // fetch user profile
    const profileResp = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const profile = profileResp.data;

    // upsert user
    let user = await User.findOne({ spotifyId: profile.id });
    if (!user) {
      user = await User.create({
        spotifyId: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        accessToken: access_token,
        refreshToken: refresh_token
      });
    } else {
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      await user.save();
    }

    // sign JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    // set cookie (httpOnly)
    res.cookie("synkus_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false // set to true in production with HTTPS
    });

    // redirect to client dashboard
    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error("spotifyCallback error:", err.response?.data || err.message);
    return res.status(500).send("Spotify auth failed");
  }
};

export const getMe = async (req, res) => {
  try {
    const token = req.cookies?.synkus_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-accessToken -refreshToken -__v");
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("getMe err:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("synkus_token", { httpOnly: true, sameSite: "lax" });
  return res.json({ ok: true });
};
