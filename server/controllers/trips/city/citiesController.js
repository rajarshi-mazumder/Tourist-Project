const aiController = require("../../../aicontrollers/aiController");
const fs = require("fs");
const path = require("path");
const parseJsonFromGemini = require("../../../aicontrollers/geminiController");
const {
  searchImagesWithGoogle,
} = require("../../googleSearch/googleSearchController"); // Import the function
const { getHotels } = require("../hotel/hotelDataController");
const citiesWithDataSchema = require("../../../schemas/citiesWithDataSchema.json");
const { AttractionType } = require("../../../constants");
const {
  saveCityResponse,
  searchCityResponse,
  cleanElasticResponse,
} = require("../../elasticSearch/elasticSearchController");

const citiesController = {
  getCities: async (req, res) => {
    const { country_name, days } = req.body;
    const task = "trips";
    try {
      const citiesPromptPath = path.resolve(
        __dirname,
        "../../../prompts/CitiesPrompt.txt"
      );
      const citiesPrompt = fs.readFileSync(citiesPromptPath, "utf-8");

      // Replacing placeholders in the prompt
      const prompt = citiesPrompt
        .replace(/{country_name}/g, country_name)
        .replace(/{num_days}/g, days);

      try {
        responseText = await aiController.generateAIResponse(
          prompt,
          task,
          citiesWithDataSchema
        );
      } catch (error) {
        console.error("Error generating AI response:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to generate attractions",
          error: error.message,
        });
      }

      try {
        // Parse AI Response
        let cities = parseJsonFromGemini(responseText);

        if (!cities || !cities.recommended_places) {
          throw new Error("Invalid AI response format");
        }

        return res.status(200).json(cities); // Return the formatted cities data
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        return res.status(500).json({
          success: false,
          message: "Failed to process AI response",
          error: parseError.message,
        });
      }
    } catch (error) {
      console.error("Error processing getCities function:", error);
      return res.status(500).json({
        success: false,
        message: "Unexpected error in fetching cities",
        error: error.message,
      });
    }
  },

  getImagesForCities: async (cities) => {
    // Add Google Images for each city
    const imagePromises = cities.recommended_places.map(async (city) => {
      try {
        console.log("City Name:", city.Name);
        const formattedImages = await searchImagesWithGoogle({
          q: city.Name,
          per_page: 3,
        }); // Fetch images
        city["googleImages"] = formattedImages;

        console.log(`${city.Name}, ${formattedImages}`);
      } catch (error) {
        console.error(`Error fetching images for ${city.Name}:`, error);
        city["googleImages"] = []; // Set to empty array in case of error
      }
    });

    await Promise.all(imagePromises);
  },
  generateCityPlan: async (req, res) => {
    try {
      const { cityName, days } = req.body;

      if (!cityName || !days) {
        return res
          .status(400)
          .json({ message: "cityName and days are required" });
      }

      console.log(`🔍 Checking cache for city: ${cityName}`);

      // Check if cached response exists
      const cachedResponse = await searchCityResponse(cityName);
      if (cachedResponse) {
        console.log(`✅ Returning cached response for ${cityName}`);
        const resp = cleanElasticResponse(cachedResponse);
        // return res.json(resp); // Ensure the format matches frontend expectations
        return res.json(resp);
      }

      console.log(`🚀 No cache found. Generating AI response for ${cityName}`);

      // Fetch hotel details before calling AI
      const hotels = await getHotels(cityName, "");

      const task = "trips";
      const cityPlannerPromptPath = path.resolve(
        __dirname,
        "../../../prompts/CityPlannerPrompt.txt"
      );
      const tripPlannerPrompt = fs.readFileSync(cityPlannerPromptPath, "utf-8");

      const prompt = tripPlannerPrompt
        .replace(/{city_name}/g, cityName)
        .replace(/{{days}}/g, days);

      let responseText;
      try {
        responseText = await aiController.generateAIResponse(prompt, task);
      } catch (error) {
        console.error("❌ Error generating AI response:", error);
        return res
          .status(500)
          .json({ message: "Failed to generate trip", error: error.message });
      }

      let parsedResponse;
      try {
        parsedResponse = parseJsonFromGemini(responseText);
        parsedResponse.accommodations = hotels;

        // Assign AttractionType.GEMINI_ATTRACTION to attractions
        if (Array.isArray(parsedResponse.attractions)) {
          parsedResponse.attractions.forEach((attraction) => {
            attraction.type = AttractionType.GEMINI_ATTRACTION;
          });
        }
      } catch (error) {
        console.error("❌ Error parsing AI response:", error);
        return res
          .status(500)
          .json({ message: "Failed to extract content", error: error.message });
      }

      try {
        console.log(
          `💾 Saving response to Elasticsearch for city: ${cityName}`
        );
        await saveCityResponse(cityName, parsedResponse);
        console.log(`✅ Response saved successfully`);

        return res.json(parsedResponse);
      } catch (error) {
        console.error("❌ Error saving to Elasticsearch:", error);
        return res.status(500).json({
          message: "Failed to save city response",
          error: error.message,
        });
      }
    } catch (error) {
      console.error("❌ Error generating city plan:", error);
      return res.status(500).json({
        message: "Failed to generate city plan",
        error: error.message,
      });
    }
  },
};

module.exports = { citiesController };
