const aiController = require("../../../aicontrollers/aiController");
const fs = require("fs");
const path = require("path");
const parseJsonFromGemini = require("../../../aicontrollers/geminiController");
const {
  searchImagesWithGoogle,
} = require("../../googleSearch/googleSearchController"); // Import the function

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
        responseText = await aiController.generateAIResponse(prompt, task);
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
};

module.exports = { citiesController };
