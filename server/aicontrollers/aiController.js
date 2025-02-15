import aiModels from "../aiModels.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const aiController = {
  generateAIResponse: async (prompt, task) => {
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
        const response = await model.generateContent(prompt);
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

export default aiController;
