const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');

// POST /api/recommendations
// Body: { categories, season, budget, days }
router.post('/', getRecommendations);

module.exports = router;
