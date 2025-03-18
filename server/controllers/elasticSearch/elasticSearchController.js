const elasticClient = require("../../services/elasticSearch");

async function saveCityResponse(city, response) {
  try {
    const doc = {
      city: city.toLowerCase(), // Store lowercase for case-insensitive search
      response,
      timestamp: new Date(),
    };

    const result = await elasticClient.index({
      index: "city_responses",
      body: doc,
    });

    console.log(`Saved response for ${city}:`, result);
    return result;
  } catch (err) {
    console.error("Error saving city response:", err);
  }
}

async function searchCityResponse(city) {
  const result = await elasticClient.search({
    index: "city_responses", // Searching inside this index (table)
    body: {
      query: {
        match: { city: city.toLowerCase() }, // Find matching city document
      },
    },
  });

  if (result.hits.hits.length > 0) {
    return result.hits.hits[0]._source.response; // Return AI response if found
  }

  return null; // No cached response found
}

module.exports = { saveCityResponse, searchCityResponse };
