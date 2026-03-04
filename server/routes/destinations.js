const express = require('express');
const router = express.Router();
const {
    getAllDestinations,
    getDestinationById,
    createDestination,
    updateDestination,
    deleteDestination,
} = require('../controllers/destinationController');

// GET    /api/destinations              – list with search/filter/sort
// GET    /api/destinations/:id          – single destination
// POST   /api/destinations              – create
// PUT    /api/destinations/:id          – update
// DELETE /api/destinations/:id          – soft delete

router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);
router.post('/', createDestination);
router.put('/:id', updateDestination);
router.delete('/:id', deleteDestination);

module.exports = router;
