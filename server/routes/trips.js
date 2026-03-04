const express = require('express');
const router = express.Router();
const { getAllTrips, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController');

router.get('/', getAllTrips);
router.post('/', createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
