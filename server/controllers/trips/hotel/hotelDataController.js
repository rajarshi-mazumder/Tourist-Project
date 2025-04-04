const axios = require("axios");
const { searchPlacesAndGetDetails } = require("../../maps/mapsController");
const {
  searchHotelPriceWithGoogle,
} = require("../../googleSearch/googleSearchController");
const fs = require("fs");
const path = require("path");
const aiController = require("../../../aicontrollers/aiController");
const parseJsonFromGemini = require("../../../aicontrollers/geminiController");

async function getHotelsFromRakutenAPI(location, keyword) {
  try {
    const applicationId = process.env.RAKUTEN_APP_ID;
    const encodedCityName = encodeURIComponent(location);
    const encodedKeywords = encodeURIComponent(keyword);
    const baseUrl = `https://app.rakuten.co.jp/services/api/Travel/KeywordHotelSearch/20170426?applicationId=${applicationId}&format=json&keyword=${encodedCityName}%20${encodedKeywords}%20en`;
    console.log(`API URL: ${baseUrl}`);

    const hotelResponse = await axios.get(baseUrl);

    const hotels =
      hotelResponse.data?.hotels?.map((hotel) => {
        const hotelInfo = hotel.hotel[0].hotelBasicInfo;
        return {
          hotelName: hotelInfo.hotelName,
          hotelInformationUrl: hotelInfo.hotelInformationUrl,
          hotelImageUrl: hotelInfo.hotelImageUrl,
          hotelThumbnailUrl: hotelInfo.hotelThumbnailUrl,
          address1: hotelInfo.address1,
          address2: hotelInfo.address2,
          telephoneNo: hotelInfo.telephoneNo,
          access: hotelInfo.access,
          hotelMinCharge: hotelInfo.hotelMinCharge,
          reviewCount: hotelInfo.reviewCount,
          reviewAverage: hotelInfo.reviewAverage,
        };
      }) || [];

    return hotels;
  } catch (error) {
    return error;
  }
}

async function getHotelsFromRakuten(req, res) {
  const { location, keyword } = req.body;
  try {
    const hotels = await getHotelsFromRakutenAPI(keyword, location);
    res.status(200).json(hotels);
  } catch (error) {
    console.error("🚨 Error in getHotelsFromMaps:", error);
    res.status(500).json({ message: error.message });
  }
}

async function getHotelsFromMaps(req, res) {
  try {
    const { keyword, location } = req.body;
    const result = await searchPlacesAndGetDetails(keyword, location);

    return res.json(result);
  } catch (error) {
    console.error("Error in searchPlacesAndDetailsHandler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const getHotelPriceFromPerplexity = async (req, res) => {
  const { hotelName, location } = req.body;

  try {
    const hotelPriceInfo = await getHotelInfoFromPerplexity(
      hotelName,
      location
    );

    return res.status(200).json(hotelPriceInfo);
  } catch (error) {
    console.error("🚨 Error in getHotelPriceFromPerplexity:", error);
    return res.status(500).json({ message: error.message });
  }
};

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
const PERPLEXITY_MODEL = "r1-1776";

async function getHotelInfoFromPerplexity(hotelName, location) {
  try {
    const promptFilePath = path.join(
      __dirname,
      "../../../prompts/HotelDetailsPrompt.txt"
    );

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      throw new Error(
        "Perplexity API key is missing in environment variables."
      );
    }

    const promptTemplate = fs.readFileSync(promptFilePath, "utf8");

    const prompt = promptTemplate
      .replace("{{hotelName}}", hotelName)
      .replace("{{location}}", location);

    const payload = {
      model: PERPLEXITY_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Respond **only** in JSON format, following the provided schema. Do not include any explanations or additional text.",
        },
        { role: "user", content: prompt },
      ],
    };

    const response = await axios.post(PERPLEXITY_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Directly return the content from Perplexity, remove reformatting
    const hotelDetails = response.data.choices[0].message.content;
    const hotelPriceDetails = await extractHotelPrice(hotelDetails);
    return hotelPriceDetails;
  } catch (error) {
    console.error("Error in getHotelInfoFromPerplexity:", error);
    throw new Error(
      `Failed to get hotel info from Perplexity: ${error.message}`
    );
  }
}

async function extractHotelPrice(hotelDetails) {
  try {
    const task = "trips";
    const hotelDetailsFormatterPromptPath = path.resolve(
      __dirname,
      "../../../prompts/HotelDetailsFormatterPrompt.txt"
    );
    const hotelDetailsFormatterPrompt = fs.readFileSync(
      hotelDetailsFormatterPromptPath,
      "utf-8"
    );
    const prompt = hotelDetailsFormatterPrompt + hotelDetails;

    let responseText;
    try {
      responseText = await aiController.generateAIResponse(prompt, task);
      let parsedResponse = parseJsonFromGemini(responseText);
      return parsedResponse;
    } catch (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getHotels: getHotelsFromRakutenAPI,
  getHotelsFromMaps,
  getHotelPriceFromPerplexity,
  getHotelsFromRakuten,
};
