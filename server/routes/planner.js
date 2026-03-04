const express = require('express');
const router = express.Router();
const { planTrip } = require('../controllers/tripPlannerController');

// POST /api/plan-trip
router.post('/', planTrip);

module.exports = router;
