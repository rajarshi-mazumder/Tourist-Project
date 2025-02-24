const express = require('express');
const router = express.Router();
const { findFoodOptions, findFoodOptionsNewPlacesAPI } = require('../controllers/food/foodController');

router.post('/', findFoodOptions);
router.post('/new-places', findFoodOptionsNewPlacesAPI)

module.exports = router