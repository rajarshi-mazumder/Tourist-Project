const OpenAI = require('openai');
require('dotenv').config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const { zodResponseFormat } = require('openai/helpers/zod');
const { z } = require('zod');

const RestaurantSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
  // address: z.string(),
  // distance: z.string().optional(),
  // walkingTime: z.string().optional(),
  description: z.string(),
  cuisine: z.string(),
  seating: z.string(),
  reservation_required: z.string(),
  reasoning: z.string(),
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
  ranking: z
    .object({
      rank: z.number().int(),
      reason: z.string(),
    })
    .optional(),
});

const IndexItemSchema = z.object({
  restaurants: z.array(RestaurantSchema),
});

async function getOpenAIChatResponse(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: prompt }],
      response_format: zodResponseFormat(IndexItemSchema, "items"),

    });
     // Log the token usage details
     console.log("Token usage:", completion.usage);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error("Failed to get response from OpenAI");
  }
}

module.exports = { getOpenAIChatResponse };
