import "dotenv/config";
import express from "express";
import cors from "cors";
import tripRoutes from "./routes/tripRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

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

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
