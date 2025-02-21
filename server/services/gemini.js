const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function getGeminiFlashResponse(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" }); // Or a more suitable model if available
  const result = await model.generateContent(prompt);
  const response = result.response;
  // console.log(response.text());
  return response.text();
}

module.exports = { getGeminiFlashResponse };
