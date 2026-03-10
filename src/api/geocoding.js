const NOMINATIM_API = "https://nominatim.openstreetmap.org/search";
const GEOCODE_CACHE_KEY = "travel-geocode-cache-v1";
const inMemoryGeocodeCache = new Map();
const MAX_MAPPED_STOPS = 8;
const GEOCODE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DESTINATION_FALLBACKS = [
  { city: "London", country: "England", region: "United Kingdom", type: "city" },
  { city: "Manchester", country: "England", region: "United Kingdom", type: "city" },
  { city: "Edinburgh", country: "Scotland", region: "United Kingdom", type: "city" },
  { city: "Sydney", country: "Australia", region: "New South Wales", type: "city" },
  { city: "Melbourne", country: "Australia", region: "Victoria", type: "city" },
  { city: "Brisbane", country: "Australia", region: "Queensland", type: "city" },
  { city: "Tokyo", country: "Japan", region: "Tokyo", type: "city" },
  { city: "Osaka", country: "Japan", region: "Kansai", type: "city" },
  { city: "Kyoto", country: "Japan", region: "Kansai", type: "city" },
  { city: "Paris", country: "France", region: "Ile-de-France", type: "city" },
  { city: "Rome", country: "Italy", region: "Lazio", type: "city" },
  { city: "Bangkok", country: "Thailand", region: "Central Thailand", type: "city" },
  { city: "Singapore", country: "Singapore", region: "Singapore", type: "city" },
  { city: "New York", country: "United States", region: "New York", type: "city" },
  { city: "Los Angeles", country: "United States", region: "California", type: "city" },
  { city: "England", country: "United Kingdom", region: "", type: "country" },
  { city: "Australia", country: "Australia", region: "", type: "country" },
  { city: "Japan", country: "Japan", region: "", type: "country" },
  { city: "Thailand", country: "Thailand", region: "", type: "country" },
];

const readGeocodeCache = () => {
  try {
    const raw = window.localStorage.getItem(GEOCODE_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    return Object.fromEntries(
      Object.entries(parsed).filter(([, entry]) => {
        if (!entry || typeof entry !== "object") {
          return false;
        }

        return !entry.expiresAt || Date.now() <= entry.expiresAt;
      }),
    );
  } catch {
    return {};
  }
};

const writeGeocodeCache = (cache) => {
  try {
    window.localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Cache 
  }
};

const getCachedCoords = (locationName) => {
  const normalizedKey = locationName.trim().toLowerCase();

  if (inMemoryGeocodeCache.has(normalizedKey)) {
    return inMemoryGeocodeCache.get(normalizedKey);
  }

  const cache = readGeocodeCache();
  const cachedCoords = cache[normalizedKey]?.value || null;

  if (cachedCoords) {
    inMemoryGeocodeCache.set(normalizedKey, cachedCoords);
  }

  return cachedCoords;
};

const setCachedCoords = (locationName, coords) => {
  const normalizedKey = locationName.trim().toLowerCase();
  const cache = readGeocodeCache();

  cache[normalizedKey] = {
    value: coords,
    expiresAt: Date.now() + GEOCODE_CACHE_TTL_MS,
  };
  inMemoryGeocodeCache.set(normalizedKey, coords);
  writeGeocodeCache(cache);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const geocodeLocation = async (locationName) => {
  const normalizedQuery = locationName.trim();
  const cachedCoords = getCachedCoords(normalizedQuery);

  if (cachedCoords) {
    return cachedCoords;
  }

  try {
    const response = await fetch(
      `${NOMINATIM_API}?q=${encodeURIComponent(normalizedQuery)}&format=json&limit=1&addressdetails=1&accept-language=en`,
      {
        headers: {
          "User-Agent": "TravelPlannerApp/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };

      setCachedCoords(normalizedQuery, coords);
      return coords;
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/**
 * Search destination suggestions for city and country input
 * @param {string} query - Partial destination query
 * @returns {Promise<Array<{label: string, city: string, country: string, region: string, type: string, lat: number, lng: number}>>}
 */
export const searchDestinationSuggestions = async (query) => {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  try {
    const buildFallbackResults = (searchTerm) => {
      const normalizedTerm = searchTerm.toLowerCase();

      return DESTINATION_FALLBACKS.filter((entry) =>
        [entry.city, entry.country, entry.region]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedTerm)),
      ).map((entry) => ({
        label: [entry.city, entry.country].filter(Boolean).join(", "),
        city: entry.city,
        country: entry.country,
        region: entry.region,
        type: entry.type,
        lat: 0,
        lng: 0,
      }));
    };

    const runSearch = async (searchQuery) => {
      const response = await fetch(
        `${NOMINATIM_API}?q=${encodeURIComponent(searchQuery)}&format=jsonv2&limit=8&addressdetails=1&namedetails=1&dedupe=1&accept-language=en`,
        {
          headers: {
            "User-Agent": "TravelPlannerApp/1.0",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Destination suggestion lookup failed");
      }

      return response.json();
    };

    const normalizeResults = (data) =>
      data
      .map((item) => {
        const address = item.address || {};
        const displayParts = (item.display_name || "")
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          address.state ||
          address.county ||
          item.namedetails?.name ||
          displayParts[0] ||
          "";
        const country = address.country || displayParts.at(-1) || "";

        if (!city && !country) {
          return null;
        }

        return {
          label: [city, country].filter(Boolean).join(", "),
          city: city || country,
          country: country || "Unknown",
          region:
            address.state ||
            address.region ||
            address.province ||
            address.county ||
            "",
          type: address.country && !address.city && !address.town ? "country" : item.type || "city",
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      })
      .filter(Boolean)
      .filter(
        (item, index, list) =>
          list.findIndex((entry) => entry.label === item.label) === index,
      );

    let results = normalizeResults(await runSearch(trimmedQuery));

    if (results.length === 0 && trimmedQuery.includes(",")) {
      results = normalizeResults(await runSearch(trimmedQuery.split(",")[0]));
    }

    if (results.length === 0) {
      results = buildFallbackResults(trimmedQuery);
    }

    return results;
  } catch (error) {
    console.error("Destination suggestion error:", error);
    return DESTINATION_FALLBACKS.filter((entry) =>
      [entry.city, entry.country, entry.region]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(trimmedQuery.toLowerCase())),
    ).map((entry) => ({
      label: [entry.city, entry.country].filter(Boolean).join(", "),
      city: entry.city,
      country: entry.country,
      region: entry.region,
      type: entry.type,
      lat: 0,
      lng: 0,
    }));
  }
};

/**
 * Batch geocode multiple locations
 * @param {Array<string>} locations - Array of location names
 * @returns {Promise<Array<{name: string, lat: number, lng: number}>>}
 */
export const geocodeMultipleLocations = async (locations) => {
  const results = [];

  for (const location of locations) {
    const wasCached = !!getCachedCoords(location);
    const coords = await geocodeLocation(location);

    if (coords) {
      results.push({
        name: location,
        ...coords,
      });
    }

    if (!wasCached) {
      await wait(250);
    }
  }

  return results;
};

/**
 * Get coordinates for activities in an itinerary
 * @param {Array} days - Array of day objects with activities
 * @param {string} destination - Main destination for fallback
 * @returns {Promise<Array>}
 */
export const geocodeItinerary = async (days, destination) => {
  const places = [];
  const processedLocations = new Map();

  console.log(`🗺️ Starting geocoding for ${destination}...`);

  const destinationCoords = await geocodeLocation(destination);
  const fallbackCoords = destinationCoords || { lat: 35.6895, lng: 139.6917 };

  for (const day of days) {
    if (!Array.isArray(day.activities)) {
      continue;
    }

    for (const activity of day.activities) {
      if (places.length >= MAX_MAPPED_STOPS) {
        break;
      }

      const locationQuery =
        activity.location?.trim() || `${activity.name}, ${destination}`;
      const locationKey = `${locationQuery.toLowerCase()}::${destination.toLowerCase()}`;
      const wasCached =
        !!getCachedCoords(`${locationQuery}, ${destination}`) ||
        !!getCachedCoords(locationQuery);

      let coords = processedLocations.get(locationKey) || null;

      if (!coords) {
        coords = await geocodeLocation(`${locationQuery}, ${destination}`);

        if (!coords && activity.location) {
          coords = await geocodeLocation(activity.location);
        }

        if (!coords && !activity.location) {
          coords = await geocodeLocation(`${activity.name}, ${destination}`);
        }

        if (coords) {
          processedLocations.set(locationKey, coords);
        }
      }

      if (!coords) {
        coords = {
          lat: fallbackCoords.lat + (Math.random() * 0.02 - 0.01),
          lng: fallbackCoords.lng + (Math.random() * 0.02 - 0.01),
        };
      }

      places.push({
        name: activity.name,
        location: activity.location || destination,
        type: "attraction",
        lat: coords.lat,
        lng: coords.lng,
      });

      if (!wasCached) {
        await wait(250);
      }
    }

    if (places.length >= MAX_MAPPED_STOPS) {
      break;
    }
  }

  console.log(`Geocoding complete. Found ${places.length} locations.`);
  return places;
};

/**
 * Get coordinates for destination city
 * @param {string} destination - City name
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const getDestinationCoords = async (destination) => {
  return await geocodeLocation(destination);
};

/**
 * Check if geocoding service is available
 * @returns {Promise<boolean>}
 */
export const checkGeocodingService = async () => {
  try {
    const result = await geocodeLocation("Paris");
    return !!result;
  } catch (error) {
    console.error("Geocoding service check failed:", error);
    return false;
  }
};
