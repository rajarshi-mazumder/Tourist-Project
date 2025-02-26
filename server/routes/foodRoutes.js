const express = require('express');
const router = express.Router();
const { 
    findFoodOptionsNewPlacesAPI,
 } = require('../controllers/food/foodController');

const { getRestaurantDetails } = require('../controllers/food/foodController');

router.post('/new-places', findFoodOptionsNewPlacesAPI);
router.get('/details', getRestaurantDetails);

module.exports = router;
