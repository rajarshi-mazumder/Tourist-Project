const express = require("express");
const axios = require("axios");

const googleSearchController = {
  searchImages: async (req, res) => {
    const { q, page = 1, per_page = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query (q) is required." });
    }

    try {
      const formattedImages = await searchImagesWithGoogle({
        q,
        page,
        per_page,
      });
      res.json(formattedImages);
    } catch (error) {
      console.error("Google Custom Search API error:", error);
      if (error.response) {
        res.status(error.response.status).json({ error: error.response.data });
      } else if (error.request) {
        res
          .status(500)
          .json({ error: "No response from Google Custom Search API" });
      } else {
        res.status(500).json({ error: "An unexpected error occurred" });
      }
    }
  },
  serachAccomodations: async (req, res) => {
    const { cityName, hotelKeyword, page = 1, per_page = 10 } = req.query;

    if (!cityName || !hotelKeyword) {
      return res.status(400).json({
        error:
          "City name (cityName) and hotel keyword (hotelKeyword) are required.",
      });
    }

    try {
      const q = `${hotelKeyword} ${cityName} hotel`;
      const formattedHotels = await searchHotelWithGoogle({
        q,
        page,
        per_page,
      });
      res.json(formattedHotels);
    } catch (error) {
      console.error("Google Custom Search API error:", error);
      if (error.response) {
        res.status(error.response.status).json({ error: error.response.data });
      } else if (error.request) {
        res
          .status(500)
          .json({ error: "No response from Google Custom Search API" });
      } else {
        res.status(500).json({ error: "An unexpected error occurred" });
      }
    }
  },
};

const searchImagesWithGoogle = async ({ q, page = 1, per_page = 10 }) => {
  // Replace with your actual Custom Search Engine ID and API key
  const CSE_ID = process.env.SEARCH_ENGINE_ID;
  const API_KEY = process.env.GOOGLE_SEARCH_API;

  const startIndex = (page - 1) * per_page + 1;

  const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${encodeURIComponent(
    q
  )}&searchType=image&start=${startIndex}&num=${per_page}`;

  console.log("CSE_ID:", CSE_ID, "API_KEY:", API_KEY);

  try {
    const response = await axios.get(apiUrl);

    // console.log("Google Search API Response:", response.data);

    const images = response.data.items || []; // Handle cases where no results are returned.
    const formattedImages = images.map((item) => ({
      title: item.title,
      link: item.link,
      thumbnail: item.image?.thumbnailLink,
      context: item.image?.contextLink,
      width: item.image?.width,
      height: item.image?.height,
    }));
    return formattedImages;
  } catch (error) {
    console.error("Google Custom Search API error:", error);
    throw error;
  }
};

const searchHotelWithGoogle = async ({ q, page = 1, per_page = 10 }) => {
  // Replace with your actual Custom Search Engine ID and API key
  const CSE_ID = process.env.SEARCH_ENGINE_ID;
  const API_KEY = process.env.GOOGLE_SEARCH_API;

  const startIndex = (page - 1) * per_page + 1;

  const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${encodeURIComponent(
    q
  )}&start=${startIndex}&num=${per_page}`;

  console.log("CSE_ID:", CSE_ID, "API_KEY:", API_KEY);

  try {
    const response = await axios.get(apiUrl);

    // console.log("Google Search API Response:", response.data);

    const hotels = response.data.items || []; // Handle cases where no results are returned.
    const formattedHotels = hotels.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));
    return formattedHotels;
  } catch (error) {
    console.error("Google Custom Search API error:", error);
    throw error;
  }
};


module.exports = {
  googleSearchController,
  searchImagesWithGoogle,
};
