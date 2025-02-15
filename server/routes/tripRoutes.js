import express from "express";
const router = express.Router();
import tripController from "../controllers/trips/tripController.js";

router.post("/plan-trip", tripController.generateTrip);

export default router;
