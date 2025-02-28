const { getDeepseekResponse } = require("../../services/deepseek");
const { getGeminiFlashResponse } = require("../../services/gemini");


async function callGemini(req, res) {
    try {
        const prompt = req.body.prompt;
        const response = await getGeminiFlashResponse(prompt);
        res.json({ response });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
      }
}

async function callDeepseek(req, res) {
    try {
        const prompt = req.body.prompt;
        const response = await getDeepseekResponse(prompt);
        res.json({ response });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
      }
}

module.exports = {callGemini, callDeepseek};