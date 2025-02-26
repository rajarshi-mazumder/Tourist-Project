
const axios = require("axios");
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

async function getPlaceDetails(placeId) {
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,formatted_phone_number,website,opening_hours,photo,review,price_level,reservable,user_ratings_total,delivery,dine_in&key=${googleMapsApiKey}`;
  try {
    const detailsResponse = await axios.get(detailsUrl);
    return detailsResponse.data.result;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}

module.exports = { getPlaceDetails };