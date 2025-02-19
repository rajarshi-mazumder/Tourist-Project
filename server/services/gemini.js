const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const axios = require('axios'); // For making API requests
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY; // Your Google Maps API Key

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

async function getGeminiFlashResponse(prompt, location) {
    // 1. Get Nearby Places using Google Maps Places API
    console.log("Trying to find restaurants");
    console.log(location);
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=5000&type=restaurant&key=${googleMapsApiKey}`; // Adjust radius as needed
    console.log(placesUrl);
    const placesResponse = await axios.get(placesUrl);

    const places = placesResponse.data.results;

    if (!places || places.length === 0) {
        return "No restaurants found near your location.";
    }

    // 2. Enrich Place Details (Optional, but highly recommended)
    const detailedPlaces = [];
    for (const place of places) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,formatted_phone_number,website,opening_hours,photo,review&key=${googleMapsApiKey}`; // Add fields as needed
      const detailsResponse = await axios.get(detailsUrl);
      detailedPlaces.push(detailsResponse.data.result);
    }



    // 3. Prepare Prompt for Gemini
    let geminiPrompt = `${prompt}\n\nFind options for food near me:\n`;

    for (const place of detailedPlaces) {
      const { distance, duration } = await getDistanceAndWalkingTime(
        location,
        place.formatted_address
      );

      geminiPrompt += `- **${place.name}**\n`;
      geminiPrompt += `  Address: ${place.formatted_address || "N/A"}\n`;
      geminiPrompt += `  Distance: ${distance}\n`;
      geminiPrompt += `  Walking Time: ${duration}\n`;
      geminiPrompt += `  Rating: ${place.rating || "N/A"}\n`;
      geminiPrompt += `  Website: ${place.website || "N/A"}\n`;
      geminiPrompt += `  Phone: ${place.formatted_phone_number || "N/A"}\n`;
      if (place.opening_hours)
        geminiPrompt += `  Open Now: ${place.opening_hours.open_now || "N/A"}\n`;
      if (place.photos && place.photos.length > 0) {
        const photoReference = place.photos[0].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googleMapsApiKey}`;
        geminiPrompt += `  Image: ${photoUrl}\n`; // Include image URL for Gemini to potentially use (Gemini's image understanding is evolving)
      }

      if (place.reviews && place.reviews.length > 0) {
        geminiPrompt += `  Reviews:\n`;
        for (const review of place.reviews) {
          geminiPrompt += `    - "${review.text}" by ${review.author_name}\n`;
        }
      }
      geminiPrompt += `\n`;
    }

    // 4. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" }); // Or a more suitable model if available
    const result = await model.generateContent(geminiPrompt);
    const response = result.response;
    console.log(response.text());
    return response.text();
}

module.exports = { getGeminiFlashResponse };



// Example usage (you'll need to get the user's location):
// async function test() {
//     const userLocation = "35.6895,139.6917"; // Example: Tokyo coordinates.  You'll need a way to get the user's actual location.
//     const prompt = "Show me the best food options around me.  I'm interested in places with great reviews and unique dishes.";
//     const geminiResponse = await getGeminiFlashResponse(prompt, userLocation);
//     console.log(geminiResponse);
// }

// test();
