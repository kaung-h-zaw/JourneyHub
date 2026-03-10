import { allowMethods, json, readBody } from "./_utils.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const normalizeJsonString = (content) => {
  const extracted =
    content.match(/\{[\s\S]*\}/)?.[0] ??
    content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");

  return extracted
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3')
    .trim();
};

const validateItinerary = (itinerary) => {
  if (!itinerary?.days || !Array.isArray(itinerary.days)) {
    throw new Error("Invalid itinerary format");
  }

  return {
    ...itinerary,
    total_estimated_cost: itinerary.total_estimated_cost ?? 0,
    days: itinerary.days.map((day) => ({
      ...day,
      food_cost_estimate: day.food_cost_estimate ?? 0,
      activities: Array.isArray(day.activities) ? day.activities : [],
      hotel: day.hotel || null,
    })),
  };
};

const parseItineraryResponse = (content) => {
  const normalized = normalizeJsonString(content);

  try {
    return validateItinerary(JSON.parse(normalized));
  } catch (firstError) {
    try {
      const repaired = normalized.replace(
        /:\s*"([^"\\]*(?:\\.[^"\\]*)*)"(?=\s*[},\]])/g,
        (match) => match.replace(/\n/g, "\\n"),
      );

      return validateItinerary(JSON.parse(repaired));
    } catch {
      throw firstError;
    }
  }
};

const buildPrompt = (tripData) => {
  const { destination, start_date, end_date, budget, interests, trip_style } =
    tripData;
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  const numDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  return `You are an expert travel planner. Create a detailed ${numDays}-day itinerary for ${destination}.

Trip Details:
- Destination: ${destination}
- Start Date: ${start_date}
- End Date: ${end_date}
- Budget: $${budget} per day
- Trip Style: ${trip_style || "standard"}
- Interests: ${interests.join(", ")}
- Number of Days: ${numDays}

Create a day-by-day itinerary with:
1. 3-4 activities per day with specific times, names, locations, and descriptions
2. Hotel recommendation for each night with name, address, and estimated price per night
3. At least one food or dining stop per day if appropriate for the destination
4. An estimated food cost for each day
5. Activities should match the user's interests: ${interests.join(", ")}
6. Match the overall travel style: ${trip_style || "standard"}
7. Keep within the daily budget of $${budget}

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "food_cost_estimate": 0,
      "activities": [
        {
          "time": "HH:MM",
          "name": "Activity Name",
          "location": "Location Name",
          "description": "Brief description",
          "estimated_cost": 0
        }
      ],
      "hotel": {
        "name": "Hotel Name",
        "address": "Full Address",
        "price": 0,
        "rating": 4.5
      }
    }
  ],
  "total_estimated_cost": 0
}`;
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    json(res, 500, { error: "GROQ_API_KEY is not configured" });
    return;
  }

  try {
    const tripData = await readBody(req);
    const prompt = buildPrompt(tripData);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a professional travel planner. Always respond with valid JSON only, no markdown formatting.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 429) {
        json(res, 429, {
          error: "RATE_LIMIT",
          message:
            "AI service is temporarily unavailable due to high usage. Please try again in a few minutes.",
        });
        return;
      }

      json(res, response.status, {
        error: errorData.error?.message || "Failed to generate itinerary",
      });
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      json(res, 502, { error: "No response from Groq" });
      return;
    }

    json(res, 200, parseItineraryResponse(content.trim()));
  } catch (error) {
    console.error("Groq function error:", error);
    json(res, 500, { error: error.message || "Failed to generate itinerary" });
  }
}
