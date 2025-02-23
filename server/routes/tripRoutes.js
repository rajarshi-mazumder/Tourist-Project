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
const {
  getHotelsHandler,
} = require("../controllers/trips/hotel/hotelDataController.js");

router.post("/plan-trip", tripController.generateTrip);
router.post("/attractions", attractionsController.getAttractions);
router.post("/cities", citiesController.getCities);
router.post("/city-plan", citiesController.generateCityPlan);
router.get("/city-plan", citiesController.generateCityPlan);
router.get("/images", googleSearchController.searchImages);
router.get("/hotels", getHotelsHandler);

module.exports = router;
