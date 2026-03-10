/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { useLocalStorage, generateId } from "../hooks/useLocalStorage";

const TripContext = createContext();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within TripProvider");
  }
  return context;
};

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useLocalStorage("trips", [], {
    maxAgeMs: SEVEN_DAYS_MS,
  });
  const [currentTrip, setCurrentTrip] = useLocalStorage("currentTrip", null, {
    maxAgeMs: ONE_DAY_MS,
  });

  const createTrip = (tripData) => {
    const newTrip = {
      id: generateId(),
      user_id: "local_user", 
      created_at: new Date().toISOString(),
      ...tripData,
      itinerary_days: [],
      saved_places: [],
    };
    setCurrentTrip(newTrip);
    return newTrip;
  };

  const saveTrip = (trip) => {
    const existingIndex = trips.findIndex((t) => t.id === trip.id);
    if (existingIndex >= 0) {
      // Update
      const updated = [...trips];
      updated[existingIndex] = trip;
      setTrips(updated);
    } else {
      // Add
      setTrips([...trips, trip]);
    }
  };

  const deleteTrip = (tripId) => {
    setTrips(trips.filter((t) => t.id !== tripId));
    if (currentTrip?.id === tripId) {
      setCurrentTrip(null);
    }
  };

  const updateItinerary = (days, totalEstimatedCost = null) => {
    if (currentTrip) {
      setCurrentTrip({
        ...currentTrip,
        itinerary_days: days,
        total_estimated_cost: totalEstimatedCost,
      });
    }
  };

  const addSavedPlace = (place) => {
    if (currentTrip) {
      const newPlace = {
        id: generateId(),
        trip_id: currentTrip.id,
        ...place,
      };
      setCurrentTrip({
        ...currentTrip,
        saved_places: [...(currentTrip.saved_places || []), newPlace],
      });
    }
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        currentTrip,
        setCurrentTrip,
        createTrip,
        saveTrip,
        deleteTrip,
        updateItinerary,
        addSavedPlace,
        storagePolicy: {
          tripsTtlDays: 7,
          currentTripTtlHours: 24,
        },
      }}
    >
      {children}
    </TripContext.Provider>
  );
};
