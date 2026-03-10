export const generateItinerary = async (tripData) => {
  try {
    const response = await fetch("/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      const err = new Error(
        errorData.message || errorData.error || "Failed to build trip plan",
      );
      err.status = response.status;
      throw err;
    }

    return await response.json();
  } catch (error) {
    console.error("Groq request error:", error);
    throw error;
  }
};

export const testGroqConnection = async () => {
  return true;
};

export const checkApiKey = () => {
  return true;
};
