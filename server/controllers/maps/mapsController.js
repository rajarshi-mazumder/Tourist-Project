const axios = require("axios");
const { getGeminiFlashResponse } = require("../../services/gemini");
const fs = require("fs");
const path = require("path");
const aiController = require("../../aicontrollers/aiController");
const parseJsonFromGemini = require("../../aicontrollers/geminiController");
const {
  searchHotelPriceWithGoogle,
} = require("../googleSearch/googleSearchController");

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
  location
  // radius = 5000,
) => {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  try {
    // Step 1: Search for places matching the keyword in the given location
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      keyword + " in " + location
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    console.log(`SEARCH URL ${searchUrl}`);
    const searchResponse = await axios.get(searchUrl);
    if (!searchResponse.data.results.length) {
      return { error: "No results found" };
    }

    // Step 2: Extract place IDs for detailed lookup
    const places = searchResponse.data.results;
    return places;
  } catch (error) {
    console.error("Error searching for places:", error);
    return { error: "Failed to search for places" };
  }
};

const getPlaceDetailsNewAPI = async (placeId) => {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const response = await axios.get(url, {
      headers: {
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,location,rating,editorialSummary,userRatingCount,websiteUri,currentOpeningHours,regularOpeningHours,photos,reviews,priceLevel,priceRange,reservable,servesBreakfast,servesLunch,servesDinner,servesBeer,servesWine,servesVegetarianFood,takeout,delivery,dineIn,photos",
      },
    });

    const details = response.data;

    return {
      name: details.displayName?.text || null,
      formatted_address: details.formattedAddress || null,
      formatted_phone_number: details.formattedPhoneNumber || null,
      rating: details.rating || null,
      user_ratings_total: details.userRatingCount || null,
      website: details.websiteUri || null,
      opening_hours:
        details.currentOpeningHours || details.regularOpeningHours || null,
      reviews: details.reviews
        ? details.reviews.slice(0, 3).map((review) => ({
            author: review.authorAttribution?.displayName || "Anonymous",
            rating: review.rating || "No rating",
            text: review.text?.text || "No review text",
          }))
        : [],
      photos: details.photos
        ? details.photos.slice(0, 5).map((photo) => photo.name)
        : [],
      editorial_summary: details.editorialSummary?.text || "Not available",
      price_level: details.priceLevel || null,
      price_range: details.priceRange || null,
      reservable: details.reservable || null,
      serves_beer: details.servesBeer || null,
      serves_breakfast: details.servesBreakfast || null,
      serves_dinner: details.servesDinner || null,
      serves_lunch: details.servesLunch || null,
      serves_vegetarian_food: details.servesVegetarianFood || null,
      serves_wine: details.servesWine || null,
      takeout: details.takeout || null,
      delivery: details.delivery || null,
      dine_in: details.dineIn || null,

      // Additional fields to match your requirements
      place_id: details.id || null,
      description: "N/A", // Will be replaced by AI-generated summaries
      cuisine: "N/A", // AI generated
      seating: "Uncertain", // AI generated
      reservation_required: "N/A", // AI generated
      ranking: { rank: "N/A", reason: "N/A" }, // AI generated
      walking_distance: "N/A", // Cannot be determined without a start location
      walking_duration: "N/A",
    };
  } catch (error) {
    console.error(
      "❌ Error fetching place details (New API):",
      error.response?.data || error.message
    );
    return { error: "Failed to fetch place details (New API)" };
  }
};

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

const searchPlacesAndGetDetails = async (
  keyword,
  location,
  radius = 5000,
  maxResults = 10
) => {
  try {
    const places = await searchPlaces(keyword, location, radius, maxResults);
    const task = "trips";
    if (places.error) {
      return { error: places.error };
    }

    const placeDetailsPromises = places.map(async (place, index) => {
      const placeDetails = await getPlaceDetailsNewAPI(place.place_id);
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

    // Add description to each place
    if (
      summaries &&
      placesWithDetails &&
      placesWithDetails.length === summaries.length
    ) {
      placesWithDetails.forEach((place, index) => {
        place.description = summaries[index].summary;
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

module.exports = {
  searchPlaces,
  searchPlacesAndGetDetails,
  searchPlacesAndDetailsHandler,
};
