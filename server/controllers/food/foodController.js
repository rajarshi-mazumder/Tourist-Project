const { getDeepseekChatResponse } = require("../../services/deepseek");
const { getOpenAIChatResponse } = require("../../services/openai");
const { formatLocation } = require("../../utils/location");
const crypto = require("crypto");
const { PlacesClient } = require("@googlemaps/places").v1;

const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
// Instantiates a client
const placesClient = new Client();
const {
  getDistanceAndWalkingTime,
  buildFindFoodOptionsPrompt,
  getPlaceDetails,
} = require("../../services/foodService");
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

//Obsolete function


async function findFoodOptionsNewPlacesAPI(req, res) {
  // Initialize the Google Maps client with your API key
  console.log("This is new places api");
  const origin = "35.6561224,139.7529898";
  // Coordinates from your example (Tokyo area)
  const latitude = 35.6561224;
  const longitude = 139.7529898;
  const foodCategory = req.body.foodCategory || "restaurants"; // Default to "restaurants"

  // Parameters for the Text Search request
  const request = {
    query: foodCategory, // e.g., "burger" or "restaurants"

    location: `${latitude},${longitude}`, // Format as "lat,lng" string
    radius: 1000, // Search within 1km (adjust as needed)
    key: googleMapsApiKey, // Replace with your actual Google API key
    language: "ja", // Japanese for localized results
    type: "restaurant",
  };

  const nearbyRequest = {
    location: origin,
    radius: 500, // 2km
    type: "restaurant",
    keyword: foodCategory,
    key: googleMapsApiKey,
    language: "ja",
  };

  try {
    let allPlaces = [];
    let nextPageToken = null;

    do {
      const response = await placesClient.placesNearby({
        params: { ...nearbyRequest, pagetoken: nextPageToken },
      });
      const nearbyJson = response.data;
      console.log(
        `Page Response (token: ${nextPageToken || "none"}):`,
        JSON.stringify(
          nearbyJson.results.map((r) => ({
            name: r.name,
            place_id: r.place_id,
            distance: "pending", // Distance calculated later
          })),
          null,
          2,
        ),
      );

      if (nearbyJson.status !== "OK") {
        console.log(
          "Nearby Status:",
          nearbyJson.status,
          nearbyJson.error_message || "",
        );
        return res.json(nearbyJson);
      }

      allPlaces.push(...nearbyJson.results);
      // Wait briefly for next_page_token to become valid (Google’s API quirk)
      if (nextPageToken)
        await new Promise((resolve) => setTimeout(resolve, 2000));
    } while (false); // Max 20 results then loop breaks

    const enhancedResults = await Promise.all(
      allPlaces.map(async (place) => {
        const { lat, lng } = place.geometry.location;
        const destination = `${lat},${lng}`;

        // Use your function to get distance and walking time
        const { distance, duration } = await getDistanceAndWalkingTime(
          origin,
          destination,
        );

        const placeDetails = await getPlaceDetails(place.place_id);

        return {
          ...place,
          ...placeDetails,
          distance, // e.g., "200 m"
          walkingTime: duration, // e.g., "3 mins"
        };
      }),
    );
    console.log("********************************************************");
    console.log("Enhanced results after adding distance and time");
    console.log(enhancedResults);
    console.log("********************************************************");

    // console.log('---------------------------------------------------------------');
    const llmPrompt = await buildFindFoodOptionsPrompt("", enhancedResults);
    // Call LLM
    const llmResponse = await getOpenAIChatResponse(llmPrompt);
    if (!llmResponse || llmResponse.trim() === "") {
      console.error("LLM returned an empty response:", llmResponse);
      return res.status(500).json({ error: "LLM returned an empty response" });
    }
    console.log("LLM Response:", llmResponse);

    //combine LLM results with api results
    try {
      const llmResults = JSON.parse(llmResponse);
      if (!Array.isArray(llmResults.restaurants)) {
        console.error("LLM response is not a JSON array:", llmResults);
        return res
          .status(500)
          .json({ error: "LLM response is not a JSON array" });
      }
      const combinedResults = enhancedResults.map((place) => {
        const llmResult =
          llmResults.restaurants.find(
            (result) => result.id === place.place_id,
          ) || {};
        return {
          formatted_address: place.vicinity || null,
          formatted_phone_number: place.formatted_phone_number || null,
          name: place.name || null,
          opening_hours: place.opening_hours || null,
          photos: place.photos || null,
          rating: place.rating || null,
          reviews: place.reviews || null,
          place_id: place.place_id || null,
          description: llmResult.description || "N/A",
          cuisine: llmResult.cuisine || "N/A",
          seating: llmResult.seating || "Uncertain",
          reservation_required: llmResult.reservation_required || "N/A",
          ranking: llmResult.ranking || { rank: "N/A", reason: "N/A" },
          walking_distance: place.distance || "N/A",
          walking_duration: place.walkingTime || "N/A",
          price_level: place.price_level || null,
          reservable: place.reservable || null,
          user_ratings_total: place.user_ratings_total || null,
          // delivery: place.delivery || null,
          dine_in: place.dine_in || null,
        };
      });
      console.log("Combined Results:", combinedResults);
      res.send(combinedResults);
    } catch (error) {
      console.error("Error parsing LLM response:", error);
      res.status(500).json({ error: "Failed to parse LLM response" });
    }

    // res.json(enhancedResults); // Send the enhanced results back in the response
    // res.json(rawJson); // Send the raw JSON back in the response
  } catch (error) {
    console.error("Error fetching places:", error.message);
    res.status(500).json({ error: "Failed to fetch places" });
  }
}

async function getRestaurantDetails(req, res) {
  const placeId = req.query.place_id;

  if (!placeId) {
    return res.status(400).json({ error: "Missing place_id parameter" });
  }

  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,formatted_phone_number,website,opening_hours,photo,review,price_level,reservable,user_ratings_total,delivery,dine_in&key=${googleMapsApiKey}`;

  try {
    const detailsResponse = await axios.get(detailsUrl);
    const detailedPlace = detailsResponse.data.result;

    // You can add more details here, such as fetching reviews from other sources
    res.send(detailedPlace);
  } catch (error) {
    console.error("Error fetching restaurant details:", error);
    res.status(500).json({ error: "Failed to fetch restaurant details" });
  }
}

module.exports = {
  findFoodOptionsNewPlacesAPI,
  getRestaurantDetails,
};
