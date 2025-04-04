
const { Client } = require("@googlemaps/google-maps-services-js");
// Instantiates a client



const {buildFindFoodOptionsPrompt} = require("../modules/promptBuilder");
const { getOpenAIChatResponse } = require("../../../services/openai");
const { getPlaceDetails } = require("../../../utils/placeDetailsGoogleMaps");
const { getDistanceAndWalkingTime } = require("../../../utils/distanceFromOriginGoogleMaps");
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;


const placesClient = new Client();

async function getFoodPlacesFromGoogleMapsPlacesAPI(origin, foodCategory){
    let allPlaces = [];
    let nextPageToken = null;
    const nearbyRequest = {
        location: origin,
        radius: 500, // 2km
        type: "restaurant",
        keyword: foodCategory,
        key: googleMapsApiKey,
        language: "ja",
        };

    do {
        const response = await placesClient.placesNearby({
            params: { ...nearbyRequest, pagetoken: nextPageToken },
        });
        const nearbyJson = response.data;
        console.log(
            `Page Response (token: ${nextPageToken || "none"}):`,
            JSON.stringify(
            nearbyJson.results.map((r) => ({
                name: r.name,
                place_id: r.place_id,
                distance: "pending", // Distance calculated later
            })),
            null,
            2,
            ),
        );
    
        if (nearbyJson.status !== "OK") {
            console.log(
            "Nearby Status:",
            nearbyJson.status,
            nearbyJson.error_message || "",
            );
            
            return nearbyJson;
            // return res.json(nearbyJson);
        }
    
        allPlaces.push(...nearbyJson.results);
        // Wait briefly for next_page_token to become valid (Google’s API quirk)
        if (nextPageToken)
            await new Promise((resolve) => setTimeout(resolve, 2000));
        } while (false);
    return allPlaces;
}

async function getDistanceAndWalkingTimeForAllPlacesFromOrigin(origin, allPlaces){
    const enhancedResults = await Promise.all(
        allPlaces.map(async (place) => {
        const { lat, lng } = place.geometry.location;
        const destination = `${lat},${lng}`;

        // Use your function to get distance and walking time
        const { distance, duration } = await getDistanceAndWalkingTime(
            origin,
            destination,
        );

        const placeDetails = await getPlaceDetails(place.place_id);

        return {
            ...place,
            ...placeDetails,
            distance, // e.g., "200 m"
            walkingTime: duration, // e.g., "3 mins"
        };
        }),
    );
    return enhancedResults;
}

function appendLLMDataToPlacesData(enhancedResults, llmResponse){
    try {
        const llmResults = JSON.parse(llmResponse);
        if (!Array.isArray(llmResults.restaurants)) {
        console.error("LLM response is not a JSON array:", llmResults);
        // return res
        //     .status(500)
        //     .json({ error: "LLM response is not a JSON array" });
        }
        const combinedResults = enhancedResults.map((place) => {
        const llmResult =
            llmResults.restaurants.find(
            (result) => result.id === place.place_id,
            ) || {};
        let thumbnail_img = null;
        if (place.photos && place.photos.length > 0) {
            const photoReference = place.photos[0].photo_reference;
            thumbnail_img = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googleMapsApiKey}`;
        }
        return {
            formatted_address: place.vicinity || null,
            formatted_phone_number: place.formatted_phone_number || null,
            name: place.name || null,
            opening_hours: place.opening_hours || null,
            photos: place.photos || null,
            rating: place.rating || null,
            reviews: place.reviews || null,
            place_id: place.place_id || null,
            description: llmResult.description || "N/A",
            cuisine: llmResult.cuisine || "N/A",
            seating: llmResult.seating || "Uncertain",
            reservation_required: llmResult.reservation_required || "N/A",
            ranking: llmResult.ranking || { rank: "N/A", reason: "N/A" },
            walking_distance: place.distance || "N/A",
            walking_duration: place.walkingTime || "N/A",
            price_level: place.price_level || null,
            reservable: place.reservable || null,
            user_ratings_total: place.user_ratings_total || null,
            // delivery: place.delivery || null,
            dine_in: place.dine_in || null,
            thumbnail_img: thumbnail_img,
        };
        });
        console.log("Combined Results:", combinedResults);
        return(combinedResults);


    } catch (error) {
        console.error("Error parsing LLM response:", error);
        // res.status(500).json({ error: "Failed to parse LLM response" });
    }
}

//Main service function to handle incoming request
async function foodPlacesOptionsService(origin, foodCategory){

    try {
        const allPlaces = await getFoodPlacesFromGoogleMapsPlacesAPI(origin, foodCategory);
    
       
        const enhancedResults = await getDistanceAndWalkingTimeForAllPlacesFromOrigin(origin, allPlaces);
        console.log("********************************************************");
        console.log("Enhanced results after adding distance and time");
        console.log(enhancedResults);
        console.log("********************************************************");
    
        // console.log('---------------------------------------------------------------');
        const llmPrompt = await buildFindFoodOptionsPrompt("", enhancedResults);
        // Call LLM
        const llmResponse = await getOpenAIChatResponse(llmPrompt);
        if (!llmResponse || llmResponse.trim() === "") {
            console.error("LLM returned an empty response:", llmResponse);
            return;
            // return res.status(500).json({ error: "LLM returned an empty response" });
        }
        console.log("LLM Response:", llmResponse);
        
        const combinedResults = appendLLMDataToPlacesData(enhancedResults, llmResponse);
        //combine LLM results with api results
        return combinedResults;
    
        
    } catch (error) {
    console.error("Error fetching places:", error.message);
    // res.status(500).json({ error: "Failed to fetch places" });
    }
    
}


module.exports = { foodPlacesOptionsService}
