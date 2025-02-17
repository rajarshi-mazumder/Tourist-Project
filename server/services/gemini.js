const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getGeminiFlashResponse(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const result = await model.generateContent(prompt);
  const response = result.response;
  console.log(response.text());
  return response.text();
}

module.exports = { getGeminiFlashResponse };
