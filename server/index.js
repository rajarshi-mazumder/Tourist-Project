const express = require("express");
const cors = require("cors");
const tripRoutes = require("./routes/tripRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const axios = require("axios");
const parseJsonFromGemini = require("./aicontrollers/geminiController.js");
const fs = require("fs");
const path = require("path");
const app = express();
const port = process.env.PORT || 4000;
require("dotenv").config();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.10.117:3000"], // Add all allowed origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies if needed
  })
);
app.use(express.json());

// Routes
app.use("/trip", tripRoutes);
app.use("/chat", chatRoutes);

const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");
const aiController = require("./aicontrollers/aiController.js");

const hotelSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
  // address: z.string(),
  // distance: z.string().optional(),
  // walkingTime: z.string().optional(),
  description: z.string(),
  // rating: z.number().optional(),
  // website: z.string().optional(),
  // phone: z.string().optional(),
  // openNow: z.boolean().optional(),
  // photos: z.array(z.string()).optional(),
  // reviews: z
  //   .array(
  //     z.object({
  //       author_name: z.string(),
  //       text: z.string(),
  //     })
  //   )
  //   .optional(),
  price_per_night: z.string(),
});

/**
 * Searches for a hotel using Perplexity API and retrieves details including price, reviews, images, and description.
 * @param {string} hotelName - The name of the hotel (e.g., "Park Hyatt Tokyo").
 * @param {string} location - The location of the hotel (e.g., "Shinjuku, Tokyo").
 * @returns {Promise<Object>} - JSON object containing hotel details.
 */
app.post("/perp", async (req, res) => {
  try {
    const { hotelName, location } = req.body;
    const promptFilePath = path.join(
      __dirname,
      "./prompts/HotelDetailsPrompt.txt"
    );
    const schemaFilePath = path.join(
      __dirname,
      "./schemas/hotelDetailsSchema.json"
    );
    const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
    const PERPLEXITY_API_KEY =
      "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";

    const promptTemplate = fs.readFileSync(promptFilePath, "utf8");
    const schemaTemplate = JSON.parse(fs.readFileSync(schemaFilePath, "utf8"));

    const prompt = promptTemplate
      .replace("{{hotelName}}", hotelName)
      .replace("{{location}}", location);
    const IndexItemSchema = z.object({
      hotel: z.array(hotelSchema),
    });
    const payload = {
      model: "r1-1776",
      messages: [
        {
          role: "system",
          content:
            "Respond **only** in JSON format, following the provided schema. Do not include any explanations or additional text.",
        },
        { role: "user", content: prompt },
      ],
      // response_format: {
      //   type: "json_object",
      //   json_schema: {"name":"","price_per_night":""}
      // }
      response_format: zodResponseFormat(IndexItemSchema, "items"),
    };

    const response = await axios.post(PERPLEXITY_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const reformattedData = await reformatHotelDetailsData({
      res: response.data.choices[0].message.content,
    });

    res.json(reformattedData);
    // res.json(response.data.choices[0].message.content);
  } catch (error) {
    console.error("Error querying Perplexity API:", error);
    res.status(500).json({ error: "Failed to retrieve hotel details" });
  }
});

const reformatHotelDetailsData = async ({ res }) => {
  try {
    const task = "trips";
    const hotelDetailsResponseFormatterPromptPath = path.resolve(
      __dirname,
      "./prompts/HotelDetailsFormatterPrompt.txt"
    );
    const hotelDetailsFormatterPrompt = fs.readFileSync(
      hotelDetailsResponseFormatterPromptPath,
      "utf-8"
    );
    const prompt = hotelDetailsFormatterPrompt + res;

    let responseText;
    try {
      responseText = await aiController.generateAIResponse(prompt, task);
    } catch (error) {
      console.error("Error generating AI response:", error);
      return res
        .status(500)
        .json({ message: "Failed to generate trip", error: error.message });
    }
    console.log("RESSPPPP", responseText);
    try {
      try {
        let parsedResponse = parseJsonFromGemini(responseText);

        return parsedResponse;
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
    console.error("Error generating city plan:", error);
    return res.status(500).json({
      message: "Failed to generate city plan",
      error: error.message,
    });
  }
};
// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
