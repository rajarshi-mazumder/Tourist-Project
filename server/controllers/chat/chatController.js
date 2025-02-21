const { getOpenAIChatResponse } = require('../../services/openai');
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

async function buildLlmPrompt(prompt, location, detailedPlaces) {
let llmPrompt = `${prompt}\n\n I'm trying to find food options around me, and these are the options I have, as below.
I want you to rank these places based on  type of food, ambiance, atmosphere, reviews, 
accesibility based on distance, time of day, etc, and and anything else relevant.
For every place, give a brief description based on above parameters.
Finally, rank the recommendations based on whcih one you recommend most based on above factors, and explain why.
:\n`;

  for (const place of detailedPlaces) {
    llmPrompt += `- **${place.name}**\n`;
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
    llmPrompt += `  Please provide a small description of this place in  10-15 words, including the type of food, ambiance, atmosphere, and anything else relevant.\n`;
  }

  for (const place of detailedPlaces) {
    llmPrompt += `\n\nDescribe the following restaurant in detail, including the type of food, ambiance, atmosphere, and anything else relevant:\n`;
    llmPrompt += `- **${place.name}**\n`;
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
  }
  
  // llmPrompt += `\n\nReturn your response in the following JSON-like format:\n{\n  "restaurants": [\n    {\n      "name": "Restaurant Name",\n      "address": "Address",\n      "description": "Description",\n      "rating": 4.5,\n      "website": "Website URL",\n      "phone": "Phone Number",\n      "openNow": true,\n      "photos": ["Photo URL 1", "Photo URL 2"],\n      "reviews": [{"author_name": "Author Name", "text": "Review Text"}],\n      "distance": "1.2 km",\n      "walkingTime": "15 mins",\n      "ranking": {"rank": 1, "reason": "Reason for ranking"}\n    },\n    // ... more restaurants\n  ]\n}\n`;
  console.log('OpenAI Prompt:', llmPrompt);
  // console.log('-------------------');
  return llmPrompt;
}

async function chat(req, res) {
 
    const prompt = req.body.message;
    const location = req.body.location;

    if (!prompt) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const formattedLocation = location ? formatLocation(location) : '';
    // console.log(`Maps API key: ${googleMapsApiKey}`);
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${formattedLocation}&radius=1000&type=restaurant&key=${googleMapsApiKey}`;
    const placesResponse = await axios.get(placesUrl);
    const places = placesResponse.data.results;

    if (!places || places.length === 0) {
      console.error("Google Places API returned no results:", placesResponse.data);
      return res.json({ response: "No restaurants found near your location." });
    }


    // 2. Enrich Place Details
    const detailedPlaces = [];
    for (const place of places) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,formatted_phone_number,website,opening_hours,photo,review&key=${googleMapsApiKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      detailedPlaces.push(detailsResponse.data.result);
    }

    // 3. Build OpenAI Prompt
    const llmPrompt = await buildLlmPrompt(prompt, formattedLocation, detailedPlaces);

    // 4. Call OpenAI
    const openaiResponse = await getOpenAIChatResponse(llmPrompt);
    if (!openaiResponse || openaiResponse.trim() === "") {
      console.error("OpenAI returned an empty response:", openaiResponse);
      return res.status(500).json({ error: "OpenAI returned an empty response" });
    }

    let cleanedResponse = openaiResponse;
    
    console.log("Cleaned OpenAI Response:", cleanedResponse);
    
    // res.json(cleanedResponse);
    try {
      const responseJson = JSON.parse(cleanedResponse);
      res.json(responseJson);
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", error);
      res.status(500).json({ error: "Failed to parse OpenAI response as JSON", rawResponse: cleanedResponse });
    }

  
}

module.exports = { chat };
