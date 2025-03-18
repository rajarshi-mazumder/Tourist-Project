const express = require("express");
const cors = require("cors");
const tripRoutes = require("./routes/tripRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
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
app.use("/trip", tripRoutes);
app.use("/chat", chatRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
