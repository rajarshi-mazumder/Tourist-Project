const fs = require("fs");
const path = require("path");

function parseJsonFromGemini(jsonStr) {
  try {
    // Define the file path where the raw response will be stored
    const filePath = path.join(process.cwd(), "ai_response_raw.json");

    // Write the raw AI response to a file for debugging
    fs.writeFileSync(filePath, jsonStr, "utf-8");
    console.log(`Raw AI response saved to ${filePath}`);

    // Parse the outer JSON to access Gemini's response structure
    let parsedResponse = JSON.parse(jsonStr);

    // Extract the actual text content containing the JSON
    const jsonText =
      parsedResponse?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!jsonText) {
      console.error("Error: Could not extract JSON text from AI response.");
      return null;
    }

    // Remove markdown-style JSON formatting (```json ... ```)
    const cleanJsonText = jsonText.replace(/^```json\s*|\s*```$/g, "").trim();

    // Parse the extracted JSON text
    parsedResponse = JSON.parse(cleanJsonText);

    return parsedResponse;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}
module.exports = parseJsonFromGemini;
