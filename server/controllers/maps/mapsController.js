const axios = require("axios");
const { getGeminiFlashResponse } = require("../../services/gemini");
const fs = require("fs");
const path = require("path");
const aiController = require("../../aicontrollers/aiController");
const parseJsonFromGemini = require("../../aicontrollers/geminiController");

/**
 * Searches for places with a keyword in a given location and fetches detailed info.
 * @param {string} keyword Search term (e.g., "ramen restaurant", "onsen hotel").
 * @param {string} location Location name (e.g., "Shinjuku, Tokyo").
 * @param {number} radius Search radius in meters (default: 5000).
 * @param {number} maxResults Maximum number of places to return (default: 5).
 * @returns {Array} List of places with full details.
 */

/**
 * Searches for places with a keyword in a given location.
 * @param {string} keyword Search term (e.g., "ramen restaurant", "onsen hotel").
 * @param {string} location Location name (e.g., "Shinjuku, Tokyo").
 * @param {number} radius Search radius in meters (default: 5000).
 * @param {number} maxResults Maximum number of places to return (default: 5).
 * @returns {Array} List of places.
 */
const searchPlaces = async (
  keyword,
  location,
  radius = 5000,
  maxResults = 5
) => {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  try {
    // Step 1: Search for places matching the keyword in the given location
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      keyword + " in " + location
    )}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;

    console.log(`SEARCH URL ${searchUrl}`);
    const searchResponse = await axios.get(searchUrl);
    if (!searchResponse.data.results.length) {
      return { error: "No results found" };
    }

    // Step 2: Extract place IDs for detailed lookup
    const places = searchResponse.data.results.slice(0, maxResults); // Limit to maxResults
    return places;
  } catch (error) {
    console.error("Error searching for places:", error);
    return { error: "Failed to search for places" };
  }
};

/**
 * Fetches detailed information for a specific place.
 * @param {string} place_id The ID of the place to fetch details for.
 * @returns {Object} Detailed information about the place.
 */
const getPlaceDetails = async (place_id) => {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,formatted_address,editorial_summary,website,opening_hours,photos,reviews,editorial_summary,price_level,reservable,serves_breakfast,serves_lunch,serves_dinner,serves_beer,serves_wine,serves_vegetarian_food,takeout,delivery,dine_in&key=${GOOGLE_MAPS_API_KEY}`;
    console.log(`DETAILS URL ${detailsUrl}`);

    const detailsResponse = await axios.get(detailsUrl);
    const details = detailsResponse.data.result;

    return {
      name: details.name || "Unknown",
      formatted_address: details.formatted_address || "No address available",
      rating: details.rating || "No rating",
      website: details.website || "Not available",
      opening_hours: details.opening_hours || "Not available",
      reviews: details.reviews
        ? details.reviews.slice(0, 3).map((review) => ({
            author: review.author_name,
            rating: review.rating,
            text: review.text,
          }))
        : [],
      photos: details.photos
        ? details.photos
            .slice(0, 5)
            .map(
              (photo) =>
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
            )
        : [],
      delivery: details.delivery || false,
      dine_in: details.dine_in || false,
      editorial_summary: details.editorial_summary || "Not available",
      price_level: details.price_level || "Not available",
      serves_beer: details.serves_beer || false,
      serves_breakfast: details.serves_breakfast || false,
      serves_dinner: details.serves_dinner || false,
      serves_lunch: details.serves_lunch || false,
      serves_vegetarian_food: details.serves_vegetarian_food || false,
      serves_wine: details.serves_wine || false,
      takeout: details.takeout || false,
      reservable: details.reservable || false,
    };
  } catch (error) {
    console.error("Error fetching place details:", error);
    return { error: "Failed to fetch place details" };
  }
};

/**
 * Searches for places with a keyword in a given location and fetches detailed info.
 * @param {string} keyword Search term (e.g., "ramen restaurant", "onsen hotel").
 * @param {string} location Location name (e.g., "Shinjuku, Tokyo").
 * @param {number} radius Search radius in meters (default: 5000).
 * @param {number} maxResults Maximum number of places to return (default: 5).
 * @returns {Array} List of places with full details.
 */
const searchPlacesAndGetDetails = async (
  keyword,
  location,
  radius = 5000,
  maxResults = 5
) => {
  try {
    const places = await searchPlaces(keyword, location, radius, maxResults);
    const task = "trips";
    if (places.error) {
      return { error: places.error };
    }

    const placeDetailsPromises = places.map(async (place, index) => {
      const placeDetails = await getPlaceDetails(place.place_id);
      placeDetails.place_id = places[index].place_id;
      return placeDetails;
    });

    const placesWithDetails = await Promise.all(placeDetailsPromises);

    const extractedData = placesWithDetails.map((place) => ({
      name: place.name,
      reviews: place.reviews,
    }));

    // Load the prompt
    const placeDescriptionPromptPath = path.resolve(
      __dirname,
      "../../prompts/PlaceDescriptionFromReviews.txt"
    );
    const placeDescriptionPrompt = fs.readFileSync(
      placeDescriptionPromptPath,
      "utf-8"
    );

    // Prepare the data for the prompt
    const promptData = extractedData;

    // Create the prompt
    const prompt = `${placeDescriptionPrompt}\n${JSON.stringify(
      promptData,
      null,
      2
    )}`;

    // Generate the AI response
    let responseText = await aiController.generateAIResponse(prompt, task);

    // Parse the AI response
    let summaries;
    try {
      summaries = parseJsonFromGemini(responseText);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return {
        error: "Failed to process AI response",
      };
    }

    // Add ai_summary to each place
    if (
      summaries &&
      placesWithDetails &&
      placesWithDetails.length === summaries.length
    ) {
      placesWithDetails.forEach((place, index) => {
        place.ai_summary = summaries[index].summary;
      });
    }

    return { places: placesWithDetails };
  } catch (error) {
    console.error("Error fetching place details:", error);
    return { error: "Failed to fetch place details" };
  }
};

async function searchPlacesAndDetailsHandler(req, res) {
  try {
    const { keyword, location } = req.body;
    const result = await searchPlacesAndGetDetails(keyword, location);
    return res.json(result);
  } catch (error) {
    console.error("Error in searchPlacesAndDetailsHandler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { searchPlacesAndGetDetails, searchPlacesAndDetailsHandler };
