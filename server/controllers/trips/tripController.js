import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import aiController from "../../aicontrollers/aiController.js";
import parseJsonFromGemini from "../../aicontrollers/geminiController.js";
import { getHotels } from "../hotel/hotelDataController.js";

import { createRequire } from "module";
import {
  getTrainOptions,
  getFerryOptions,
  getFlightOptions,
  getBusOptions,
  getSubwayOptions,
} from "../transportation/transportationOptionsController.js";
const require = createRequire(import.meta.url);
const tripPromptResponseStructure = require("../../prompts/tripPromptResponseStructure.json");

const tripController = {
  generateTrip: async (req, res) => {
    try {
      const { from_city, to_city, days } = req.body;
      const latitude = 35.6895; // Hardcoded latitude for Tokyo
      const longitude = 139.6917; // Hardcoded longitude for Tokyo
      const hotels = await getHotels(latitude, longitude);

      console.log(`HOTELLS ${JSON.stringify(hotels)} `);
      return;
      if (!from_city || !to_city || !days) {
        return res
          .status(400)
          .json({ message: "From city, to city, and days are required" });
      }

      const task = "trips";
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
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
          const structuredResponse = structureResponse(
            parsedResponse,
            tripPromptResponseStructure
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

export default tripController;

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

async function fetchAndUpdateTransportData(tripResponse) {
  for (let i = 0; i < tripResponse.transportation.length; i++) {
    const routeSegments = tripResponse.transportation[i];

    for (let j = 0; j < routeSegments.length; j++) {
      const segment = routeSegments[j];
      let transportData = [];

      switch (segment.method) {
        case "Train":
          transportData = await getTrainOptions(segment.from, segment.to);
          break;
        case "Flight":
          transportData = await getFlightOptions(segment.from, segment.to);
          break;
        case "Bus":
          transportData = await getBusOptions(segment.from, segment.to);
          break;
        case "Ferry":
          transportData = await getFerryOptions(segment.from, segment.to);
          break;
        case "Subway":
          transportData = await getSubwayOptions(segment.from, segment.to);
          break;
        default:
          console.warn(`Unknown transport method: ${segment.method}`);
      }

      tripResponse.transportation[i][j] =
        transportData.length > 0 ? transportData[0] : segment;
    }
  }

  return tripResponse;
}
