import { allowMethods, json } from "../_utils.js";

const AMADEUS_TOKEN_URL =
  "https://test.api.amadeus.com/v1/security/oauth2/token";

let cachedToken = null;
let tokenExpiry = null;

export const getAccessToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Amadeus credentials are not configured");
  }

  const response = await fetch(AMADEUS_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get Amadeus token");
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;
  return cachedToken;
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) {
    return;
  }

  try {
    const token = await getAccessToken();
    json(res, 200, { token });
  } catch (error) {
    console.error("Amadeus token function error:", error);
    json(res, 500, {
      error: error.message || "Failed to get Amadeus token",
    });
  }
}
