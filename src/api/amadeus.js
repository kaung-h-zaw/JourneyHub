const requestAmadeus = async (type, payload) => {
  const response = await fetch("/api/amadeus/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Amadeus request failed");
  }

  return response.json();
};
export const searchHotelsByCity = async (
  cityCode,
  radius = 5,
  radiusUnit = "KM",
) => {
  try {
    const data = await requestAmadeus("hotelsByCity", {
      cityCode,
      radius,
      radiusUnit,
    });
    return data.data || [];
  } catch (error) {
    console.error("Hotel search error:", error);
    return [];
  }
};
export const getHotelOffers = async (
  hotelIds,
  checkInDate,
  checkOutDate,
  adults = 1,
) => {
  try {
    const data = await requestAmadeus("hotelOffers", {
      hotelIds,
      checkInDate,
      checkOutDate,
      adults,
    });
    return data.data || [];
  } catch (error) {
    console.error("Hotel offers error:", error);
    return [];
  }
};
export const searchFlights = async (
  origin,
  destination,
  departureDate,
  adults = 1,
  returnDate = null,
) => {
  try {
    const data = await requestAmadeus("flights", {
      origin,
      destination,
      departureDate,
      adults,
      returnDate,
    });
    return data.data || [];
  } catch (error) {
    console.error("Flight search error:", error);
    return [];
  }
};
export const getCityCode = async (cityName) => {
  try {
    const data = await requestAmadeus("cityCode", { cityName });
    if (data.data && data.data.length > 0) {
      return data.data[0].iataCode;
    }

    return null;
  } catch (error) {
    console.error("City code lookup error:", error);
    return null;
  }
};

export const checkAmadeusConfig = () => {
  return true;
};
