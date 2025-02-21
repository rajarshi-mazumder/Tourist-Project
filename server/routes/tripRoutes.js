// const express = require("express");
const express = require('express');
const router = express.Router();
const tripController = require("../controllers/trips/tripController.js");

router.post("/plan-trip", tripController.generateTrip);

module.exports = router;
