const { getDeepseekChatResponse } = require("../../services/deepseek");
const { getOpenAIChatResponse } = require("../../services/openai");
const { formatLocation } = require("../../utils/location");
const axios = require("axios");

const { Client } = require("@googlemaps/google-maps-services-js");
// Instantiates a client
const placesClient = new Client();


const {buildFindFoodOptionsPrompt} = require("./modules/promptBuilder");
const {getPlaceDetails} = require("../../utils/placeDetailsGoogleMaps");
const { getDistanceAndWalkingTime } = require("../../utils/distanceFromOriginGoogleMaps");
const { foodPlacesOptionsService } = require("./services/foodPlacesService");
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

//Obsolete function


async function fetchFoodPlaces(req, res) {
  // Initialize the Google Maps client with your API key
  console.log("This is new places api");
  const origin = "35.6561224,139.7529898";
  // Coordinates from your example (Tokyo area)
  // const latitude = 35.6561224;
  // const longitude = 139.7529898;
  const foodCategory = req.body.foodCategory || "restaurants"; // Default to "restaurants"

  const combinedResults = await foodPlacesOptionsService(origin, foodCategory);

  res.send(combinedResults);

}

async function fetchFoodPlaceDetails(req, res) {
  const placeId = req.query.place_id;

  if (!placeId) {
    return res.status(400).json({ error: "Missing placeId parameter" });
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
  fetchFoodPlaces,
  fetchFoodPlaceDetails,
};
