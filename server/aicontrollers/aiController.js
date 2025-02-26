const aiModels = require("../aiModels.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

const aiController = {
  generateAIResponse: async (prompt, task, schema) => {
    try {
      const modelName = aiModels[task];

      if (!modelName) {
        throw new Error(`No AI model found for task: ${task}`);
      }

      let responseText;

      if (modelName === "gemini") {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-001",
        });

        let formattedPrompt = prompt;
        if (schema) {
          formattedPrompt = `
            Please provide the response in the following JSON format:
            ${JSON.stringify(schema, null, 2)}

            Based on the following prompt:
            ${prompt}
          `;
        }

        const response = await model.generateContent(formattedPrompt);
        responseText =
          typeof response.response === "string"
            ? response.response
            : JSON.stringify(response.response);
      } else {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const completion = await openai.chat.completions.create({
          model: modelName,
          messages: [{ role: "user", content: prompt }],
        });
        responseText = completion.choices[0].message.content;
      }

      return responseText;
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  },
};

module.exports = aiController;
