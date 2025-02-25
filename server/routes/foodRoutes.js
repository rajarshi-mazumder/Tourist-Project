const express = require('express');
const router = express.Router();
const { 
    findFoodOptions, 
    findFoodOptionsNewPlacesAPI,
    findFoodOptionsGemini
 } = require('../controllers/food/foodController');

router.post('/', findFoodOptions);
router.post('/new-places', findFoodOptionsNewPlacesAPI)
router.post('/ask-gemini', findFoodOptionsGemini)

module.exports = router