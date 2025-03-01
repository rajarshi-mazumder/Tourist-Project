const aiController = require("../../../aicontrollers/aiController");
const fs = require("fs");
const path = require("path");
const parseJsonFromGemini = require("../../../aicontrollers/geminiController");
const attractionsController = {
  getAttractions: async (req, res) => {
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
};

module.exports = { attractionsController };
