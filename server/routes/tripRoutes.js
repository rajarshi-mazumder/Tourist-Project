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
  getHotelsFromMaps,
  getHotelPriceFromPerplexity,
  getHotelsFromRakuten,
} = require("../controllers/trips/hotel/hotelDataController.js");
const {
  searchPlacesAndDetailsHandler,
} = require("../controllers/maps/mapsController.js");

router.post("/plan-trip", tripController.generateTrip);
router.post("/cities", citiesController.getCities);
router.post("/city-plan", citiesController.generateCityPlan);
router.get("/images", googleSearchController.searchImages);
router.post("/hotels-from-maps", getHotelsFromMaps);
router.post("/hotels-from-rakuten", getHotelsFromRakuten);
router.post("/search-places", searchPlacesAndDetailsHandler);
router.post("/attractions", attractionsController.getAttractionsFromGemini);
router.post(
  "/attractions-from-maps",
  attractionsController.getAttractionsFromMaps
);
router.post(
  "/enrich-attractions",
  attractionsController.enrichAttractionsUsingGemini
);

router.post("/get-hotel-price", getHotelPriceFromPerplexity);

module.exports = router;
