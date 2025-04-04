const express = require('express');
const router = express.Router();
const { 
    fetchFoodPlaces,
 } = require('../controllers/food/foodController');

const { fetchFoodPlaceDetails } = require('../controllers/food/foodController');

router.post('/new-places', fetchFoodPlaces);
router.get('/details', fetchFoodPlaceDetails);

module.exports = router;
