const { getGeminiFlashResponse } = require('../../services/gemini');
const { formatLocation } = require('../../utils/location'); // Add location formatting utility


async function chat(req, res) {
  try {
    const prompt = req.body.message; // Use 'message' instead of 'prompt'
    const location = req.body.location;


    if (!prompt) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const formattedLocation = location ? formatLocation(location) : ''; // Format location data


    const response = await getGeminiFlashResponse(`${prompt} My location is: ${formattedLocation}`);
    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// Add location formatting utility function
function formatLocation(location) {
  return `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
}

module.exports = { chat };

module.exports = { chat };
