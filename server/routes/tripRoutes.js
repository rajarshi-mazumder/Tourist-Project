// const express = require("express");
const express = require('express');
const router = express.Router();
const tripController = require("../controllers/trips/tripController.js");
const { attractionsController } = require('../controllers/attractions/attractionsController.js');

router.post("/plan-trip", tripController.generateTrip);
router.post("/attractions", attractionsController.getAttractions);
module.exports = router;
