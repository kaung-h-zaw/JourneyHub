import { useState } from "react";
import { generateItinerary } from "../api/groq";

export const useTripGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState(null);

  const generate = async (tripData) => {
    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      console.log("Generating trip plan with Groq AI...");
      const result = await generateItinerary(tripData);
      console.log("Trip plan generated successfully:", result);
      setItinerary(result);
      return result;
    } catch (err) {
      console.error("Trip plan generation failed:", err);
      const errorMessage = err.message || "Failed to build trip plan";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setItinerary(null);
  };

  return {
    loading,
    error,
    itinerary,
    generate,
    reset,
  };
};
