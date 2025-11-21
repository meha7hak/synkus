import axios from "axios";
import querystring from "querystring";

export const refreshSpotifyAccessToken = async (refreshToken) => {
  const tokenURL = "https://accounts.spotify.com/api/token";
  const body = querystring.stringify({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET
  });

  try {
    const resp = await axios.post(tokenURL, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    return resp.data; // contains access_token, expires_in, maybe refresh_token
  } catch (err) {
    console.error("refreshSpotifyAccessToken err:", err.response?.data || err.message);
    throw err;
  }
};
export default refreshSpotifyAccessToken;