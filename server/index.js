
const express = require('express');
const cors = require('cors');
const tripRoutes = require('./routes/tripRoutes.js')
const foodRoutes = require('./routes/foodRoutes.js');

const app = express();
const port = process.env.PORT || 4000;
require('dotenv').config();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Routes
const { getGeminiFlashResponse } = require('./services/gemini.js');

app.use("/trip", tripRoutes);
app.use("/food", foodRoutes);

app.post('/gemini', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const response = await getGeminiFlashResponse(prompt);
    res.json({ response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
