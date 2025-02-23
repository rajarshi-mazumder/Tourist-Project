const { fileURLToPath } = require("url");
const fs = require("fs");
const path = require("path");
const aiController = require("../../aicontrollers/aiController.js");
const parseJsonFromGemini = require("../../aicontrollers/geminiController.js");

const tripPromptResponseStructure = require("../../prompts/tripPromptResponseStructure.json");

const { getHotels } = require("./hotel/hotelDataController.js");

const tripController = {
  generateTrip: async (req, res) => {
    try {
      const { from_city, to_city, days } = req.body;
      const hotels = await getHotels(to_city);

      if (!from_city || !to_city || !days) {
        return res
          .status(400)
          .json({ message: "From city, to city, and days are required" });
      }

      const task = "trips";
      const tripPlannerPromptPath = path.resolve(
        __dirname,
        "../../prompts/TripPlannerPrompt.txt"
      );
      const tripPlannerPrompt = fs.readFileSync(tripPlannerPromptPath, "utf-8");
      const prompt = tripPlannerPrompt
        .replace(/{from_city}/g, from_city)
        .replace(/{to_city}/g, to_city)
        .replace(/{{days}}/g, days);

      let responseText;
      try {
        responseText = await aiController.generateAIResponse(prompt, task);
      } catch (error) {
        console.error("Error generating AI response:", error);
        return res
          .status(500)
          .json({ message: "Failed to generate trip", error: error.message });
      }

      let tripDetails;
      try {
        let content;
        try {
          let parsedResponse = parseJsonFromGemini(responseText);
          let structuredResponse = structureResponse(
            parsedResponse,
            tripPromptResponseStructure
          );
          structuredResponse.accommodations = hotels;

          console.log(
            "Structured Response:",
            JSON.stringify(structuredResponse, null, 2)
          );
          return res.json(structuredResponse);
        } catch (e) {
          console.error("Error extracting content from AI response:", e);
          return res
            .status(500)
            .json({ message: "Failed to extract content", error: e.message });
        }
      } catch (parseError) {
        console.error("Error parsing or transforming AI response:", parseError);
        return res.status(500).json({
          message: "Failed to process AI response",
          error: parseError.message,
        });
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      return res
        .status(500)
        .json({ message: "Failed to generate trip", error: error.message });
    }
  },
};

module.exports = tripController;

function structureResponse(parsedResponse, expectedStructure) {
  const structuredResponse = { ...expectedStructure };

  for (const key in expectedStructure) {
    if (parsedResponse.hasOwnProperty(key)) {
      if (Array.isArray(expectedStructure[key])) {
        structuredResponse[key] = parsedResponse[key] || [];
      } else if (
        typeof expectedStructure[key] === "object" &&
        expectedStructure[key] !== null
      ) {
        structuredResponse[key] =
          structureResponse(parsedResponse[key], expectedStructure[key]) || {};
      } else {
        structuredResponse[key] = parsedResponse[key] || "";
      }
    } else {
      if (Array.isArray(expectedStructure[key])) {
        structuredResponse[key] = [];
      } else if (
        typeof expectedStructure[key] === "object" &&
        expectedStructure[key] !== null
      ) {
        structuredResponse[key] = {};
      } else {
        structuredResponse[key] = "";
      }
    }
  }

  return structuredResponse;
}
