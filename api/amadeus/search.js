import { allowMethods, json, readBody } from "../_utils.js";
import { getAccessToken } from "./token.js";

const AMADEUS_BASE_URL = "https://test.api.amadeus.com/v1";

const endpoints = {
  hotelsByCity: {
    path: "/reference-data/locations/hotels/by-city",
    buildSearchParams: ({ cityCode, radius = 5, radiusUnit = "KM" }) => ({
      cityCode,
      radius,
      radiusUnit,
    }),
  },
  hotelOffers: {
    path: "/shopping/hotel-offers",
    buildSearchParams: ({
      hotelIds = [],
      checkInDate,
      checkOutDate,
      adults = 1,
    }) => ({
      hotelIds,
      checkInDate,
      checkOutDate,
      adults,
    }),
  },
  flights: {
    path: "/shopping/flight-offers",
    buildSearchParams: ({
      origin,
      destination,
      departureDate,
      adults = 1,
      returnDate,
    }) => ({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
      max: 10,
      ...(returnDate ? { returnDate } : {}),
    }),
  },
  cityCode: {
    path: "/reference-data/locations",
    buildSearchParams: ({ cityName }) => ({
      keyword: cityName,
      subType: "CITY,AIRPORT",
    }),
  },
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  try {
    const { type, payload = {} } = await readBody(req);
    const endpoint = endpoints[type];

    if (!endpoint) {
      json(res, 400, { error: "Unsupported Amadeus request type" });
      return;
    }

    const token = await getAccessToken();
    const url = new URL(`${AMADEUS_BASE_URL}${endpoint.path}`);
    const searchParams = endpoint.buildSearchParams(payload);

    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((entry) => url.searchParams.append(key, entry));
      } else if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      json(res, response.status, {
        error: errorData.errors?.[0]?.detail || "Amadeus request failed",
      });
      return;
    }

    const data = await response.json();
    json(res, 200, data);
  } catch (error) {
    console.error("Amadeus function error:", error);
    json(res, 500, {
      error: error.message || "Amadeus request failed",
    });
  }
}
