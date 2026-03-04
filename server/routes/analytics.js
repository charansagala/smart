const express = require('express');
const router = express.Router();
const { getSummary, getPopular, getTrends } = require('../controllers/analyticsController');

router.get('/summary', getSummary);
router.get('/popular', getPopular);
router.get('/trends', getTrends);

module.exports = router;
