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
let llmPrompt = `${prompt}\n\nI'm trying to find food options around me, and these are the options I have, as below. I want you to provide a brief description (10-15 words) and a ranking (1-5, with 1 being the best) for each place based on type of food, ambiance, atmosphere, reviews, accessibility based on distance and time of day, and anything else relevant. Return the results in the following format:\n\n`;

  for (const place of detailedPlaces) {
    llmPrompt += `${place.name}: Description - , Ranking - \n`;
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
    console.log('OpenAI Response:', openaiResponse);
    const responses = openaiResponse.split('\n');
    const updatedPlaces = detailedPlaces.map((place, index) => {
      const response = responses[index];
      if (response) {
        const [description, ranking] = response.split(', Ranking - ');
        return {
          ...place,
          description: description ? description.replace(`${place.name}: Description - `, '').trim() : null,
          ranking: ranking ? parseInt(ranking.trim()) : null,
        };
      }
      return place;
    });

    res.json(updatedPlaces);
}

module.exports = { chat };
