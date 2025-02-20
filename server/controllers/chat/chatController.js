const { getGeminiFlashResponse } = require('../../services/gemini');
const { formatLocation } = require('../../utils/location');
const axios = require('axios');
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

async function buildGeminiPrompt(prompt, location, detailedPlaces) {
  let geminiPrompt = `${prompt}\n\nFind options for food near me:\n`;

  for (const place of detailedPlaces) {
    geminiPrompt += `- **${place.name}**\n`;
    geminiPrompt += `  Address: ${place.formatted_address || "N/A"}\n`;
    geminiPrompt += `  Rating: ${place.rating || "N/A"}\n`;
    geminiPrompt += `  Website: ${place.website || "N/A"}\n`;
    geminiPrompt += `  Phone: ${place.formatted_phone_number || "N/A"}\n`;
    if (place.opening_hours) {
      geminiPrompt += `  Open Now: ${place.opening_hours.open_now ? "Yes" : "No"}\n`;
    } else {
      geminiPrompt += `  Open Now: N/A\n`;
    }
    if (place.photos && place.photos.length > 0) {
      const photoReference = place.photos[0].photo_reference;
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googleMapsApiKey}`;
      geminiPrompt += `  Image: ${photoUrl}\n`;
    }

    if (place.reviews && place.reviews.length > 0) {
      geminiPrompt += `  Reviews:\n`;
      for (const review of place.reviews) {
        geminiPrompt += `    - "${review.text}" by ${review.author_name}\n`;
      }
    }
    geminiPrompt += `\n`;
    geminiPrompt += `  Please provide a description of this place, including the type of food, ambiance, atmosphere, and anything else relevant.\n`;
  }

  for (const place of detailedPlaces) {
    geminiPrompt += `\n\nDescribe the following restaurant in detail, including the type of food, ambiance, atmosphere, and anything else relevant:\n`;
    geminiPrompt += `- **${place.name}**\n`;
    geminiPrompt += `  Address: ${place.formatted_address || "N/A"}\n`;
    geminiPrompt += `  Rating: ${place.rating || "N/A"}\n`;
    geminiPrompt += `  Website: ${place.website || "N/A"}\n`;
    geminiPrompt += `  Phone: ${place.formatted_phone_number || "N/A"}\n`;
    if (place.opening_hours) {
      geminiPrompt += `  Open Now: ${place.opening_hours.open_now ? "Yes" : "No"}\n`;
    } else {
      geminiPrompt += `  Open Now: N/A\n`;
    }
    if (place.photos && place.photos.length > 0) {
      const photoReference = place.photos[0].photo_reference;
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googleMapsApiKey}`;
      geminiPrompt += `  Image: ${photoUrl}\n`;
    }

    if (place.reviews && place.reviews.length > 0) {
      geminiPrompt += `  Reviews:\n`;
      for (const review of place.reviews) {
        geminiPrompt += `    - "${review.text}" by ${review.author_name}\n`;
      }
    }
  }
  geminiPrompt += `\n\nRank the above restaurants from best to worst based on your assessment, providing a detailed explanation for your ranking.  Which restaurant is your top recommendation and why?`;
  console.log('Gemini Prompt:', geminiPrompt);
  console.log('-------------------');
  return geminiPrompt;
}

async function chat(req, res) {
  try {
    const prompt = req.body.message;
    const location = req.body.location;

    if (!prompt) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const formattedLocation = location ? formatLocation(location) : '';
    console.log(`Maps API key: ${googleMapsApiKey}`);
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${formattedLocation}&radius=1000&type=restaurant&key=${googleMapsApiKey}`;
    const placesResponse = await axios.get(placesUrl);
    const places = placesResponse.data.results;

    if (!places || places.length === 0) {
      return res.json({ response: "No restaurants found near your location." });
    }

    // 2. Enrich Place Details
    const detailedPlaces = [];
    for (const place of places) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,formatted_phone_number,website,opening_hours,photo,review&key=${googleMapsApiKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      detailedPlaces.push(detailsResponse.data.result);
    }

    // 3. Build Gemini Prompt
    const geminiPrompt = await buildGeminiPrompt(prompt, formattedLocation, detailedPlaces);

    // 4. Call Gemini
    const geminiResponse = await getGeminiFlashResponse(geminiPrompt);

    // 5. Format Response
    const restaurants = [];
    // Split the gemini response into descriptions for each restaurant and the overall recommendation
    const geminiDescriptions = geminiResponse.split('Please provide a description of this place, including the type of food, ambiance, atmosphere, and anything else relevant.\n\n');
    geminiDescriptions.shift(); // Remove the first element, which is the initial prompt
    const recommendation = geminiResponse.split('Based on the above restaurants, which one do you recommend and why? Please provide a detailed explanation of your reasoning.\n\n')[1];

    for (let i = 0; i < detailedPlaces.length; i++) {
      const place = detailedPlaces[i];
      const { distance, duration } = await getDistanceAndWalkingTime(
        formattedLocation,
        place.formatted_address
      );

      const restaurant = {
        name: place.name || "N/A",
        address: place.formatted_address || "N/A",
        distance: distance,
        walking_time: duration,
        rating: place.rating || "N/A",
        website: place.website || "N/A",
        phone_number: place.phone_number || "N/A",
        open_now: place.opening_hours ? (place.opening_hours.open_now ? "Yes" : "No") : "N/A",
        photos: place.photos ? place.photos.map(photo => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${googleMapsApiKey}`) : [],
        reviews: place.reviews ? place.reviews.map(review => ({ author_name: review.author_name, text: review.text })) : [],
        description: geminiDescriptions[i] ? geminiDescriptions[i].split('\n\n')[0] : "N/A" // Add the description for each restaurant
      };
      restaurants.push(restaurant);
    }

    const jsonResponse = {
      restaurants: restaurants,
      gemini_recommendation: recommendation
    };
    res.json(jsonResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { chat };
