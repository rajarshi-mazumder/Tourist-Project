
const express = require('express');
const cors = require('cors');
const tripRoutes = require('./routes/tripRoutes.js')
const chatRoutes = require('./routes/chatRoutes.js');

const app = express();
const port = process.env.PORT || 4000;
require('dotenv').config();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.10.117:3000"], // Add all allowed origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies if needed
  })
);app.use(express.json());

// Routes
app.use("/trip", tripRoutes);
app.use("/chat", chatRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
