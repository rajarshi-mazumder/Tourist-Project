const { getGeminiFlashResponse } = require('../../services/gemini.js');

exports.handleClassifiedPrompt = async (req, res) => {
  let { prompt, promptType } = req.body;

  try {
    promptType = promptType.replace(/\s/g, '');
    let enhancedPrompt = prompt;

    switch (promptType) {
      case 'Attractions':
        enhancedPrompt = `You are a helpful tourist guide. Please provide information about the following attraction: ${prompt}`;
        break;
      case 'Restaurants':
        enhancedPrompt = `You are a restaurant recommendation expert. Please provide information about the following restaurant: ${prompt}`;
        break;
      case 'Translation':
        enhancedPrompt = `Please translate the following phrase into Japanese: ${prompt}`;
        break;
      case 'Audio Pronunciation':
        enhancedPrompt = `Please provide the audio pronunciation of the following word or phrase: ${prompt}`;
        break;
      case 'General Travel Assistance':
        enhancedPrompt = `You are a helpful travel assistant. Please provide information about the following travel topic: ${prompt}`;
        break;
      case 'Emergency Information':
        enhancedPrompt = `You are a helpful emergency assistant. Please provide information about the following emergency topic: ${prompt}`;
        break;
      default:
        break;
    }

    // Send the enhanced prompt to Gemini
    const { getGeminiFlashResponse } = require('../../services/gemini.js');
    const response = await getGeminiFlashResponse(enhancedPrompt);
    res.json({ response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
};
