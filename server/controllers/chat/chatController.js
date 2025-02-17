const { getGeminiFlashResponse } = require('../../services/gemini');

async function chat(req, res) {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await getGeminiFlashResponse(prompt);
    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { chat };
