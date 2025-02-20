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
  geminiPrompt += `\n\nReturn your response in the following JSON-like format:\n{\n  "restaurants": [\n    {\n      "name": "Restaurant Name",\n      "address": "Address",\n      "description": "Description",\n      "rating": 4.5,\n      "website": "Website URL",\n      "phone": "Phone Number",\n      "openNow": true,\n      "photos": ["Photo URL 1", "Photo URL 2"],\n      "reviews": [{"author_name": "Author Name", "text": "Review Text"}],\n      "distance": "1.2 km",\n      "walkingTime": "15 mins",\n      "ranking": {"rank": 1, "reason": "Reason for ranking"}\n    },\n    // ... more restaurants\n  ]\n}\n`;
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

    // 3. Build Gemini Prompt
    const geminiPrompt = await buildGeminiPrompt(prompt, formattedLocation, detailedPlaces);

    // 4. Call Gemini
    const geminiResponse = await getGeminiFlashResponse(geminiPrompt);
    if (!geminiResponse || geminiResponse.trim() === "") {
      console.error("Gemini returned an empty response:", geminiResponse);
      return res.status(500).json({ error: "Gemini returned an empty response" });
    }
    console.log("Gemini Response:", geminiResponse);

    // 5. Format Response
    const restaurants = [];
    const lines = geminiResponse.split('\n');
    let currentRestaurant = null;
    let restaurantIndex = 0;
    let descriptions = {};
    let ranking = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- **')) {
        if (currentRestaurant) {
          restaurants.push(currentRestaurant);
        }
        const name = trimmedLine.substring(3, trimmedLine.length - 2);
        currentRestaurant = { name, description: "" };
        descriptions[name] = "";
        restaurantIndex++;
      } else if (trimmedLine.startsWith('Address:')) {
        currentRestaurant.address = trimmedLine.substring(8).trim();
      } else if (trimmedLine.startsWith('Rating:')) {
        currentRestaurant.rating = trimmedLine.substring(7).trim();
      } else if (trimmedLine.startsWith('Website:')) {
        currentRestaurant.website = trimmedLine.substring(8).trim();
      } else if (trimmedLine.startsWith('Phone:')) {
        currentRestaurant.phone = trimmedLine.substring(6).trim();
      } else if (trimmedLine.startsWith('Open Now:')) {
        currentRestaurant.openNow = trimmedLine.substring(9).trim();
      } else if (trimmedLine.startsWith('Image:')) {
        currentRestaurant.image = trimmedLine.substring(6).trim();
      } else if (trimmedLine.startsWith('Reviews:')) {
        currentRestaurant.reviews = [];
        let reviewLine = "";
        for (let i = lines.indexOf(line) + 1; i < lines.length; i++) {
          reviewLine = lines[i].trim();
          if (reviewLine.startsWith('-')) {
            currentRestaurant.reviews.push(reviewLine.substring(2).trim());
          } else if (reviewLine.length === 0) {
            break;
          }
        }
      } else if (trimmedLine.length > 0 && currentRestaurant) {
        descriptions[currentRestaurant.name] += trimmedLine + " ";
      } else if (trimmedLine.startsWith('Rank')) {
        console.log("Ranking section found");
        const rankLines = lines.slice(lines.indexOf(line));
        for (const rankLine of rankLines) {
          const trimmedRankLine = rankLine.trim();
          if (trimmedRankLine.startsWith('Rank')) {
            continue;
          } else if (trimmedRankLine.length === 0) {
            break;
          } else {
            const [rank, restaurantName, reason] = trimmedRankLine.split(/\.|\:/);
            ranking[restaurantName.trim()] = { rank: rank.trim(), reason: reason.trim() };
          }
        }
      }
    }
    console.log("Parsed Restaurants:", restaurants);
    if (currentRestaurant) {
      restaurants.push(currentRestaurant);
    }

    for (let i = 0; i < restaurants.length; i++) {
      const place = detailedPlaces[i];
      const { distance, duration } = await getDistanceAndWalkingTime(
        formattedLocation,
        place.formatted_address
      );
      restaurants[i].distance = distance;
      restaurants[i].walkingTime = duration;
      restaurants[i].description = descriptions[restaurants[i].name].trim();
      restaurants[i].ranking = ranking[restaurants[i].name];
      restaurants[i].address = place.formatted_address;
      restaurants[i].rating = place.rating;
      restaurants[i].website = place.website;
      restaurants[i].phone = place.formatted_phone_number;
      restaurants[i].openNow = place.opening_hours ? place.opening_hours.open_now : null;
      restaurants[i].photos = place.photos ? place.photos.map(photo => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${googleMapsApiKey}`) : [];
      restaurants[i].reviews = place.reviews ? place.reviews.map(review => ({ author_name: review.author_name, text: review.text })) : [];
      restaurants[i].distance = distance;
      restaurants[i].walkingTime = duration;
    }

    const jsonResponse = {
      restaurants: restaurants
    };

    res.json({ restaurants });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { chat };
