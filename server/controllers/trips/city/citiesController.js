const aiController = require("../../../aicontrollers/aiController");
const fs = require("fs");
const path = require("path");
const parseJsonFromGemini = require("../../../aicontrollers/geminiController");
const citiesController = {
  getCities: async (req, res) => {
    const { country_name, days } = req.body;
    const task = "trips";
    try {
      const citiesPromptPath = path.resolve(
        __dirname,
        "../../prompts/CitiesPrompt.txt"
      );
      const citiesPrompt = fs.readFileSync(citiesPromptPath, "utf-8");

      // Replacing placeholders in the prompt
      const prompt = citiesPrompt
        .replace(/{country_name}/g, country_name)
        .replace(/{num_days}/g, days);
      console.log("Prompt", prompt);

      try {
        responseText = await aiController.generateAIResponse(prompt, task);
      } catch (error) {
        console.error("Error generating AI response:", error);
        return {
          success: false,
          message: "Failed to generate attractions",
          error: error.message,
        };
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
        return {
          success: false,
          message: "Failed to process AI response",
          error: parseError.message,
        };
      }
    } catch (error) {
      console.error("Error processing getCities function:", error);
      return {
        success: false,
        message: "Unexpected error in fetching cities",
        error: error.message,
      };
    }
  },
};

module.exports = { citiesController };
