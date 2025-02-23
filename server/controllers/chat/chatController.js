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
let llmPrompt = `${prompt}\n\nI'm trying to find food options around me, and these are the options I have, as below. 
I want you to provide a brief description (10-15 words) and a ranking (with 1 being the best) 
for each place based on type of food, ambiance, atmosphere, reviews, accessibility based on distance and time of day, 
and anything else relevant. Do not skip any of the places, I want each of them in the rankings\n\n`;

  for (const place of detailedPlaces) {
    llmPrompt += `- **${place.name} (ID: ${place.id})**\n`;
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
    llmPrompt += `  Description and Ranking: Description - , Ranking - \n`;
  }

  console.log('OpenAI Prompt:', llmPrompt);
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
    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,formatted_phone_number,website,opening_hours,photo,review&key=${googleMapsApiKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      const detailedPlace = detailsResponse.data.result;
      detailedPlace.id = require('crypto').randomBytes(16).toString('hex'); // Assign a unique ID
      detailedPlaces.push(detailedPlace);
    }

    // 3. Build OpenAI Prompt
    const llmPrompt = await buildLlmPrompt(prompt, formattedLocation, detailedPlaces);

    // 4. Call OpenAI
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
      const combinedResults = detailedPlaces.map(place => {
        const llmResult = llmResults.restaurants.find(result => result.id === place.id) || {};
        console.log(place);
        return {
          ...place,
          description: llmResult.description || 'N/A',
          ranking: llmResult.ranking || 'N/A',
        };
      });
      res.send(combinedResults);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      res.status(500).json({ error: 'Failed to parse OpenAI response' });
    }
}

module.exports = { chat };
