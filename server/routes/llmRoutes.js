const express = require('express');
const { callGemini, callDeepseek } = require('../controllers/llm/llmController');
const router = express.Router();


router.post('/deepseek', callDeepseek);
router.post('/gemini', callGemini);

module.exports = router;
