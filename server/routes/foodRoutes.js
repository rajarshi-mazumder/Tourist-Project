const express = require('express');
const router = express.Router();
const { findFoodOptions } = require('../controllers/food/foodController');

router.post('/', findFoodOptions);

module.exports = router