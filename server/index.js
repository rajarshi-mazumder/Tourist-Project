
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
app.use("/trip", tripRoutes);
app.use("/food", foodRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
