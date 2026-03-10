import { useCallback, useEffect, useState } from "react";
import {
  geocodeItinerary,
  geocodeLocation,
  getDestinationCoords,
} from "../api/geocoding";

const ITINERARY_MAP_CACHE_KEY = "travel-itinerary-map-cache-v1";
const itineraryMapCache = new Map();
const ITINERARY_MAP_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const buildItineraryCacheKey = (days, destination) =>
  JSON.stringify({
    destination,
    days: days?.map((day) => ({
      date: day.date,
      hotel: day.hotel?.address || day.hotel?.name || "",
      activities: day.activities?.map((activity) => ({
        name: activity.name,
        location: activity.location || "",
      })),
    })),
  });

const readCachedPlaces = (cacheKey) => {
  if (itineraryMapCache.has(cacheKey)) {
    return itineraryMapCache.get(cacheKey);
  }

  try {
    const rawCache = window.localStorage.getItem(ITINERARY_MAP_CACHE_KEY);
    const parsedCache = rawCache ? JSON.parse(rawCache) : {};
    const cachedEntry = parsedCache[cacheKey] || null;
    const cachedPlaces =
      cachedEntry &&
      (!cachedEntry.expiresAt || Date.now() <= cachedEntry.expiresAt)
        ? cachedEntry.value
        : null;

    if (cachedPlaces) {
      itineraryMapCache.set(cacheKey, cachedPlaces);
    }

    return cachedPlaces;
  } catch {
    return null;
  }
};

const writeCachedPlaces = (cacheKey, places) => {
  itineraryMapCache.set(cacheKey, places);

  try {
    const rawCache = window.localStorage.getItem(ITINERARY_MAP_CACHE_KEY);
    const parsedCache = rawCache ? JSON.parse(rawCache) : {};
    parsedCache[cacheKey] = {
      value: places,
      expiresAt: Date.now() + ITINERARY_MAP_CACHE_TTL_MS,
    };
    window.localStorage.setItem(
      ITINERARY_MAP_CACHE_KEY,
      JSON.stringify(parsedCache),
    );
  } catch {
    // storage
  }
};

export const useGeocodingItinerary = (days, destination) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheKey = buildItineraryCacheKey(days, destination);

  const geocode = useCallback(async () => {
    if (!days || days.length === 0 || !destination) {
      return;
    }

    const cachedPlaces = readCachedPlaces(cacheKey);
    if (cachedPlaces?.length) {
      setPlaces(cachedPlaces);
      setError(null);
      setLoading(false);
      return cachedPlaces;
    }

    setLoading(true);
    setError(null);

    try {
      const geocodedPlaces = await geocodeItinerary(days, destination);
      writeCachedPlaces(cacheKey, geocodedPlaces);
      setPlaces(geocodedPlaces);
      return geocodedPlaces;
    } catch (err) {
      console.error("Geocoding error:", err);
      setError(err.message || "Failed to geocode locations");

      const fallbackPlaces = [];
      days.forEach((day) => {
        day.activities?.forEach((activity) => {
          fallbackPlaces.push({
            name: activity.name,
            location: activity.location || destination,
            lat: 35.6895 + Math.random() * 0.1 - 0.05,
            lng: 139.6917 + Math.random() * 0.1 - 0.05,
            type: "attraction",
          });
        });
      });
      writeCachedPlaces(cacheKey, fallbackPlaces);
      setPlaces(fallbackPlaces);
      return fallbackPlaces;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, days, destination]);

  useEffect(() => {
    if (days && days.length > 0 && destination) {
      const cachedPlaces = readCachedPlaces(cacheKey);
      if (cachedPlaces?.length) {
        setPlaces(cachedPlaces);
        setLoading(false);
        setError(null);
        return;
      }

      geocode();
      return;
    }

    setPlaces([]);
    setLoading(false);
    setError(null);
  }, [cacheKey, days, destination, geocode]);

  const reset = () => {
    setPlaces([]);
    setLoading(false);
    setError(null);
  };

  return {
    places,
    loading,
    error,
    geocode,
    reset,
  };
};

export const useGeocodingLocation = (location = null) => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const geocode = useCallback(
    async (locationToGeocode) => {
      const target = locationToGeocode || location;

      if (!target) {
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await geocodeLocation(target);
        setCoords(result);
        return result;
      } catch (err) {
        console.error("Geocoding error:", err);
        setError(err.message || "Failed to geocode location");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [location],
  );

  useEffect(() => {
    if (location) {
      geocode(location);
    }
  }, [geocode, location]);

  const reset = () => {
    setCoords(null);
    setLoading(false);
    setError(null);
  };

  return {
    coords,
    loading,
    error,
    geocode,
    reset,
  };
};

export const useDestinationCoords = (destination = null) => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const geocode = useCallback(
    async (dest) => {
      const target = dest || destination;

      if (!target) {
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getDestinationCoords(target);
        setCoords(result);
        return result;
      } catch (err) {
        console.error("Destination geocoding error:", err);
        setError(err.message || "Failed to get destination coordinates");
        const fallback = { lat: 35.6895, lng: 139.6917 };
        setCoords(fallback);
        return fallback;
      } finally {
        setLoading(false);
      }
    },
    [destination],
  );

  useEffect(() => {
    if (destination) {
      geocode(destination);
    }
  }, [destination, geocode]);

  const reset = () => {
    setCoords(null);
    setLoading(false);
    setError(null);
  };

  return {
    coords,
    loading,
    error,
    geocode,
    reset,
  };
};
