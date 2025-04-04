const elasticClient = require("../../services/elasticSearch");

async function saveCityResponse(cityName, response) {
  try {
    if (!response || typeof response !== "object") {
      throw new Error("Invalid response format: Expected an object.");
    }

    console.log("🔍 Saving city response:", JSON.stringify(response, null, 2));

    const result = await elasticClient.index({
      index: "city_responses",
      id: cityName.toLowerCase(),
      document: {
        city: cityName,
        response: JSON.stringify(response), // ✅ Store as a JSON string to avoid formatting issues
        timestamp: new Date(),
      },
    });

    console.log("✅ Successfully saved to Elasticsearch:", result);
  } catch (error) {
    console.error("❌ Error saving city response:", error);
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

function cleanElasticResponse(rawData) {
  try {
    if (typeof rawData === "string") {
      return JSON.parse(rawData); // ✅ Convert JSON string back to object
    }
    return rawData; // ✅ Already an object, return as-is
  } catch (error) {
    console.error("❌ Error parsing ElasticSearch response:", error);
    return {}; // Return empty object if parsing fails
  }
}
module.exports = { saveCityResponse, cleanElasticResponse, searchCityResponse };
