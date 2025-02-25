const express = require('express');
const router = express.Router();
const { 
    findFoodOptions, 
    findFoodOptionsNewPlacesAPI,
    findFoodOptionsGemini
 } = require('../controllers/food/foodController');

const { getRestaurantDetails } = require('../controllers/food/foodController');

router.post('/', findFoodOptions);
router.post('/new-places', findFoodOptionsNewPlacesAPI);
router.get('/details', getRestaurantDetails);

module.exports = router;
