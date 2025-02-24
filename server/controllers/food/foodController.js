const { getOpenAIChatResponse } = require('../../services/openai');
const { formatLocation } = require('../../utils/location');
const axios = require('axios');
const crypto = require('crypto');
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

/**
 * Build a prompt that instructs OpenAI to synthesize additional details:
 * - A concise description that includes ambiance and any special features
 * - The primary type of cuisine based on the provided details
 * - A seating/crowding estimate (i.e. whether the restaurant is typically crowded or usually has seating available)
 * - A ranking and explanation.
 * The response should be in JSON format.
 */
async function buildFindFoodOptionsPrompt(prompt = "", location, detailedPlaces) {
  let llmPrompt = `${prompt}\n\n
For each of the following places, please provide the following in simple, friendly, casual English:
1. A concise description (1-2 sentences) summarizing the restaurant’s ambiance, unique features, and overall appeal.
2. The primary type of cuisine (e.g., Japanese, Italian, ramen, sushi, etc.) based on the available information.
3. A seating availability estimate for right now – considering current conditions (such as time of day, holiday etc)
 – indicating if the restaurant is usually crowded (i.e. seats are hard to come by) or if it generally has seating available at this time
4. A ranking of the restaurant (a numeric rank and a brief explanation of your ranking decision).
5. A note on reservation requirements: based on available data (including the "reservable" metric and reviews),
 indicate whether going without a reservation is acceptable ("no reservation is ok") or 
 if a reservation is necessary to dine at this establishment right now. 

Below are the details for each place:
\n\n`;

  for (const place of detailedPlaces) {
    llmPrompt += `- **${place.name}**\n`;
    llmPrompt += `  ID: ${place.id}\n`;
    llmPrompt += `  Address: ${place.formatted_address || "N/A"}\n`;
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

  console.log("OpenAI Prompt:", llmPrompt);
  return llmPrompt;
}

async function findFoodOptions(req, res) {
  const prompt = req.body.message || "";
  const location = req.body.location;
  const foodCategory = req.body.foodCategory || "restaurants";

  let formattedLocation = location ? formatLocation(location) : '';
  // For testing purposes, we use a fixed location
  formattedLocation = '35.6561224,139.7529898';

  const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${formattedLocation}&radius=1000&keyword=${foodCategory}&key=${googleMapsApiKey}`;
  console.log('Places URL:', placesUrl);
  const placesResponse = await axios.get(placesUrl);
  const places = placesResponse.data.results;

  if (!places || places.length === 0) {
    console.error("Google Places API returned no results:", placesResponse.data);
    return res.json({ response: "No restaurants found near your location." });
  }

  // Enrich Place Details
  const detailedPlaces = [];
  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,formatted_phone_number,website,opening_hours,photo,review,price_level,reservable,user_ratings_total,delivery,dine_in&key=${googleMapsApiKey}`;
    const detailsResponse = await axios.get(detailsUrl);
    const detailedPlace = detailsResponse.data.result;
    detailedPlace.id = detailedPlace.id || crypto.randomBytes(16).toString('hex');
    detailedPlaces.push(detailedPlace);
  }
  console.log('Detailed Places:', detailedPlaces);

  // Build OpenAI prompt with additional instructions for cuisine and seating info.
  const llmPrompt = await buildFindFoodOptionsPrompt(prompt, formattedLocation, detailedPlaces);

  // Call OpenAI
  const openaiResponse = await getOpenAIChatResponse(llmPrompt);
  if (!openaiResponse || openaiResponse.trim() === "") {
    console.error("OpenAI returned an empty response:", openaiResponse);
    return res.status(500).json({ error: "OpenAI returned an empty response" });
  }
  console.log('OpenAI Response:', openaiResponse);

  try {
    const llmResults = JSON.parse(openaiResponse);
    if (!Array.isArray(llmResults.restaurants)) {
      console.error('OpenAI response is not a JSON array:', llmResults);
      return res.status(500).json({ error: 'OpenAI response is not a JSON array' });
    }

    // Add walking distance to detailedPlaces
    for (const place of detailedPlaces) {
      const origin = formattedLocation;
      const destination = place.formatted_address;
      const { distance, duration } = await getDistanceAndWalkingTime(origin, destination);
      place.walking_distance = distance;
      place.walking_duration = duration;
    }

    const combinedResults = detailedPlaces.map(place => {
      const llmResult = llmResults.restaurants.find(result => result.id === place.id) || {};
      return {
        formatted_address: place.formatted_address || null,
        formatted_phone_number: place.formatted_phone_number || null,
        name: place.name || null,
        opening_hours: place.opening_hours || null,
        photos: place.photos || null,
        rating: place.rating || null,
        reviews: place.reviews || null,
        id: place.id || null,
        description: llmResult.description || 'N/A',
        cuisine: llmResult.cuisine || 'N/A',
        seating: llmResult.seating || 'Uncertain',
        reservation_required: llmResult.reservation_required || 'N/A',
        ranking: llmResult.ranking || { rank: 'N/A', reason: 'N/A' },
        walking_distance: place.walking_distance || 'N/A',
        walking_duration: place.walking_duration || 'N/A',
        price_level: place.price_level || null,
        reservable: place.reservable || null,
        user_ratings_total: place.user_ratings_total || null,
        delivery: place.delivery || null,
        dine_in: place.dine_in || null,
      };
    });
    console.log("Combined Results:", combinedResults);
    res.send(combinedResults);
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    res.status(500).json({ error: 'Failed to parse OpenAI response' });
  }
}

module.exports = { findFoodOptions };
