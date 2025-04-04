const express = require('express');
const cors = require('cors');
const tripRoutes = require('./routes/tripRoutes.js')
const foodRoutes = require('./routes/foodRoutes.js');
const llmRoutes = require('./routes/llmRoutes.js');
const axios = require("axios");

const app = express();
const port = process.env.PORT || 4000;
require("dotenv").config();

// Middleware
app.use(
  cors({
    origin:
      // "https://touristproject-client-799087063528.asia-northeast1.run.app",
      "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies if needed
  })
);
app.use(express.json());

// Routes
const { getGeminiFlashResponse } = require('./services/gemini.js');
const { getDeepseekResponse } = require('./services/deepseek.js');

const chatController = require('./controllers/chat/chatController.js');

app.use("/trip", tripRoutes);
app.use("/food", foodRoutes);
app.use("/llm", llmRoutes);
app.post('/chat', chatController.handleClassifiedPrompt);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
