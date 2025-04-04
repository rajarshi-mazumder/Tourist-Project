const DeepseekAI = require('openai'); // Assuming deepseek uses the openai package

const openai = new DeepseekAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1', // Replace with the actual Deepseek API endpoint
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

async function getDeepseekResponse(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-reasoner", // Replace with the actual Deepseek model
      messages: [{ role: "user", content: prompt }],
      

    });
     // Log the token usage details
     console.log("Token usage:", completion.usage);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Deepseek:", error);
    throw new Error("Failed to get response from Deepseek");
  }
}

module.exports = { getDeepseekResponse };
