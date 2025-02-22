// const express = require("express");
const express = require("express");
const router = express.Router();
const tripController = require("../controllers/trips/tripController.js");
const {
  attractionsController,
} = require("../controllers/trips/attractions/attractionsController.js");
const {
  citiesController,
} = require("../controllers/trips/city/citiesController.js");
const {
  googleSearchController,
} = require("../controllers/googleSearch/googleSearchController.js");

router.post("/plan-trip", tripController.generateTrip);
router.post("/attractions", attractionsController.getAttractions);
router.post("/cities", citiesController.getCities);
router.get("/images", googleSearchController.searchImages);
module.exports = router;
