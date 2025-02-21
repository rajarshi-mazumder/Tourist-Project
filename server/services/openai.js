const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const { zodResponseFormat } = require('openai/helpers/zod');
const { z } = require('zod');

const RestaurantSchema = z.object({
  name: z.string(),
  address: z.string(),
  description: z.string(),
  rating: z.number().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  openNow: z.boolean().optional(),
  photos: z.array(z.string()).optional(),
  reviews: z
    .array(
      z.object({
        author_name: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  distance: z.string().optional(),
  walkingTime: z.string().optional(),
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
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: zodResponseFormat(IndexItemSchema, "items"),

    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error("Failed to get response from OpenAI");
  }
}

module.exports = { getOpenAIChatResponse };
