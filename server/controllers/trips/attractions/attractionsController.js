const aiController = require("../../../aicontrollers/aiController");
const fs = require("fs");
const path = require("path");
const parseJsonFromGemini = require("../../../aicontrollers/geminiController");
const { searchPlaces } = require("../../maps/mapsController");
const { error } = require("console");
const { AttractionType } = require("../../../constants");

const attractionsController = {
  getAttractionsFromGemini: async (req, res) => {
    const { location, keywords, month, season, dailyForecast } = req.body;
    const task = "trips";

    try {
      // Load the prompt template
      const attractionsPromptPath = path.resolve(
        __dirname,
        "../../../prompts/PlaceAttractionsPrompt.txt"
      );
      const attractionsPrompt = fs.readFileSync(attractionsPromptPath, "utf-8");

      // Format keywords correctly for the prompt (convert array to string like ["nature", "festivals"])
      const formattedKeywords = keywords.map((k) => `"${k}"`).join(", ");

      // Prepare weather JSON for injection into the prompt
      const weatherJson = JSON.stringify(
        {
          month,
          season,
          dailyForecast,
        },
        null,
        2
      );

      // Replace placeholders in the prompt
      const prompt = attractionsPrompt
        .replace(/{LOCATION_PROVIDED}/g, location)
        .replace(/{KEYWORDS_PROVIDED}/g, formattedKeywords)
        .replace(/{CURRENT_MONTH}/g, month)
        .replace(/{CURRENT_SEASON}/g, season)
        .replace(/{WEATHER_FORECAST_JSON}/g, weatherJson);

      console.log("Generated Prompt:\n", prompt);

      // Call AI service (e.g., Gemini/Perplexity)
      let responseText;
      try {
        responseText = await aiController.generateAIResponse(prompt, task);
      } catch (aiError) {
        console.error("Error generating AI response:", aiError);
        return res.status(500).json({
          success: false,
          message: "Failed to generate attractions",
          error: aiError.message,
        });
      }
      // Parse the AI response
      let attractions;
      try {
        attractions = parseJsonFromGemini(responseText);
        if (!attractions || !attractions.attractions) {
          throw new Error("Invalid AI response format");
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        return res.status(500).json({
          success: false,
          message: "Failed to process AI response",
          error: parseError.message,
        });
      }

      // Assign AttractionType.GEMINI_ATTRACTION to attractions
      if (
        attractions &&
        attractions.attractions &&
        Array.isArray(attractions.attractions)
      ) {
        attractions.attractions.forEach((attraction) => {
          attraction.type = AttractionType.GEMINI_ATTRACTION;
        });
      }

      return res.status(200).json(attractions);
    } catch (error) {
      console.error("Unexpected error in getAttractions:", error);
      return res.status(500).json({
        success: false,
        message: "Unexpected error in fetching attractions",
        error: error.message,
      });
    }
  },

  getAttractionsFromMaps: async (req, res) => {
    req.setTimeout(60000); // Set timeout to 60 seconds
    const { keywords, location } = req.body;
    var datetime = new Date();
    console.log(datetime.toISOString().slice(0, 10));
    datesToVisit = datetime.toISOString().slice(0, 10);
    const plannedDates = datesToVisit;
    let allPlaces = [];
    try {
      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];

        const places = await searchPlaces(keyword, location);
        if (places.error) {
          return res.status(500).json({
            success: false,
            message: "Failed to get attractions from maps",
            error: places.error,
          });
        }
        // const usefulPlacesData = extractUsefulBits([places]);
        // allPlaces.push(...usefulPlacesData);
        allPlaces.push(...places);
      }

      // Assign AttractionType.GOOGLE_MAP_ATTRACTION to attractions
      allPlaces.forEach((place) => {
        place.type = AttractionType.GOOGLE_MAP_ATTRACTION;
      });

      res.status(200).json({ attractions: allPlaces }); // Send initial response

      // //moved to a separate route
      // for (const place of usefulPlacesData) {
      //   const enrichedPlace = await enrichAttractionsUsingGemini({
      //     location,
      //     keywords: [keyword],
      //     month,
      //     season,
      //     dailyForecast,
      //     plannedDates,
      //     googlePlacesData: [place],
      //   });
      //   allAttractions.push(...enrichedPlace.attractions);
      // }

      // return res.status(200).json({ attractions: allAttractions });
    } catch (error) {
      console.error("Unexpected error in getAttrationFromMaps:", error);
      return res.status(500).json({
        success: false,
        message: "Unexpected error in fetching attractions from maps",
        error: error.message,
      });
    }
  },
  enrichAttractionsUsingGemini: async (req, res) => {
    const {
      location,
      keywords,
      month,
      season,
      dailyForecast,
      plannedDates,
      googlePlacesData,
    } = req.body;
    const task = "trips";

    try {
      // Load the prompt template
      const attractionsPromptPath = path.resolve(
        __dirname,
        "../../../prompts/AttractionsPrompt.txt"
      );
      const attractionsPrompt = fs.readFileSync(attractionsPromptPath, "utf-8");
      // Format keywords correctly for the prompt (convert array to string like ["nature", "festivals"])
      const formattedKeywords = keywords.map((k) => `"${k}"`).join(", ");

      // Prepare JSON for injection into the prompt
      const weatherJson = JSON.stringify(
        { month, season, dailyForecast },
        null,
        2
      );
      const plannedDatesJson = JSON.stringify(plannedDates, null, 2);

      // Replace placeholders in the prompt
      const prompt = attractionsPrompt
        .replace(/{LOCATION_PROVIDED}/g, location)
        .replace(/{KEYWORDS_PROVIDED}/g, formattedKeywords)
        .replace(/{CURRENT_MONTH}/g, month)
        .replace(/{CURRENT_SEASON}/g, season)
        .replace(/{WEATHER_FORECAST_JSON}/g, weatherJson)
        .replace(/{PLANNED_DATES}/g, plannedDatesJson)
        .replace(/{GOOGLE_PLACES_JSON}/g, JSON.stringify(googlePlacesData));

      console.log("Generated Prompt:\n", prompt);

      let responseText;
      try {
        responseText = await aiController.generateAIResponse(prompt, task);
        console.log(`GEMINI response ${JSON.stringify(responseText)}`);
      } catch (aiError) {
        console.error("Error generating AI response:", aiError);
        return res.status(500).json({
          success: false,
          message: "Failed to generate attractions",
          error: aiError.message,
        });
      }

      // Parse the AI response
      let attractions;

      try {
        attractions = parseJsonFromGemini(responseText);
        if (!attractions || !attractions.attractions) {
          throw new Error("Invalid AI response format");
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        return res.status(500).json({
          success: false,
          message: "Failed to process AI response",
        });
      }

      // Assign AttractionType.GEMINI_ATTRACTION to attractions
      if (
        attractions &&
        attractions.attractions &&
        Array.isArray(attractions.attractions)
      ) {
        attractions.attractions.forEach((attraction) => {
          attraction.type = AttractionType.GEMINI_ATTRACTION;
        });
      }

      return res.status(200).json(attractions);
    } catch (error) {
      console.error("Unexpected error in getAttractions:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process AI response",
        error: aiError.message,
      });
    }
  },
};

function extractUsefulBits(placesData) {
  return placesData.flat().map((place) => {
    return {
      name: place.name,
      address: place.formatted_address,
      rating: place.rating ?? null,
      reviews_count: place.user_ratings_total ?? null,
      types: place.types ?? [],
      status: place.business_status ?? "UNKNOWN",
      open_now: place.opening_hours?.open_now ?? null,
      price_level: place.price_level ?? null, // only exists for some places
      plus_code: place.plus_code?.compound_code ?? null,
    };
  });
}

module.exports = { attractionsController };
