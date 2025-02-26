const { getDeepseekChatResponse } = require("./deepseek");
const { getOpenAIChatResponse } = require("./openai");
const { formatLocation } = require("../utils/location");
const axios = require("axios");
const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

async function getDistanceAndWalkingTime(origin, destination) {
  const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=walking&key=${googleMapsApiKey}`;
  const distanceMatrixResponse = await axios.get(distanceMatrixUrl);
  const data = distanceMatrixResponse.data;

  if (data.rows[0].elements[0].status === "OK") {
    const distance = data.rows[0].elements[0].distance.text;
    const duration = data.rows[0].elements[0].duration.text;
    return { distance, duration };
  } else {
    return { distance: "N/A", duration: "N/A" };
  }
}

async function buildFindFoodOptionsPrompt(prompt = "", detailedPlaces) {
  let llmPrompt = `${prompt}\n\n
For each of the following places,  Go through all the details of the place thoroughly, 
including reviews, photos, and other relevant information, please provide the following:
1. Describe the place (2-4 sentences) in very simple friendly casual english, 
summarizing the restaurant’s ambiance, unique features, and overall appeal.
Find online from reviews, articles, maps reviews, place reviews etc 
and give a detailed but conbcise description.
2. The primary type of cuisine (e.g., Japanese, Italian, ramen, sushi, etc.) based on the available information.
3. A seating availability estimate for right now – considering current conditions (such as time of day, holiday etc)
 – indicating if the restaurant is usually crowded (i.e. seats are hard to come by) or if it generally has seating available at this time
4. A ranking of the restaurant (a numeric rank and a brief explanation of your ranking decision).
5. A note on reservation requirements: based on available data,
 indicate whether going without a reservation is acceptable ("no reservation is ok") or 
 if a reservation is necessary to dine at this establishment right now. 
 6. Show me your detailed thinking and reasoning for each place, like for eg 'the reviews of this place mentioned this place has english menu,
 so i recommend this place'



Do not skip any places, i need the result as a JSON array for all ${detailedPlaces.length} restaurants
Below are the details for each place:
\n\n`;

  for (const place of detailedPlaces) {
    llmPrompt += `- **${place.name}**\n`;
    llmPrompt += `  ID: ${place.place_id}\n`;
    llmPrompt += `  Address: ${place.vicinity || "N/A"}\n`;
    llmPrompt += `  Rating: ${place.rating || "N/A"}\n`;
    llmPrompt += `  Website: ${place.website || "N/A"}\n`;
    llmPrompt += `  Phone: ${place.formatted_phone_number || "N/A"}\n`;
    if (place.opening_hours) {
      llmPrompt += `  Open Now: ${place.opening_hours.open_now ? "Yes" : "No"}\n`;
    } else {
      llmPrompt += `  Open Now: N/A\n`;
    }
    if (place.photos && place.photos.length > 0) {
      const photoReference = place.photos[0].photo_reference;
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googleMapsApiKey}`;
      llmPrompt += `  Image: ${photoUrl}\n`;
    }
    if (place.reviews && place.reviews.length > 0) {
      llmPrompt += `  Reviews:\n`;
      for (const review of place.reviews) {
        llmPrompt += `    - "${review.text}" by ${review.author_name}\n`;
      }
    }
    llmPrompt += `\n`;
  }
  llmPrompt += `\n Return a JSON array with exactly ${detailedPlaces.length} objects. 
  Each object must have keys: description, primaryCuisine, seatingAvailability, ranking, reservationNote, and reasoning`;

  console.log("Prompt for LLM:", llmPrompt);
  console.log("------------------------------------------------");
  return llmPrompt;
}

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

module.exports = {
  getDistanceAndWalkingTime,
  buildFindFoodOptionsPrompt,
  getPlaceDetails,
};
