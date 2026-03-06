const { Trip } = require('../models');

const SEED_TRIPS = [
    { id: 1, name: 'Bali Summer Getaway', destination_id: 1, start_date: '2026-06-01', end_date: '2026-06-07', budget: 1200, status: 'Planning', notes: 'Beach trip with family', traveler_count: 3 },
    { id: 2, name: 'Kyoto Spring Tour', destination_id: 2, start_date: '2026-04-10', end_date: '2026-04-15', budget: 1800, status: 'Confirmed', notes: 'Cherry blossom season', traveler_count: 2 },
    { id: 3, name: 'Swiss Alps Winter', destination_id: 3, start_date: '2026-12-20', end_date: '2026-12-30', budget: 3500, status: 'Planning', notes: 'Skiing holiday', traveler_count: 4 },
];

const getAllTrips = async (req, res) => {
    try {
        const trips = await Trip.findAll({ order: [['created_at', 'DESC']] });
        res.json({ success: true, data: trips });
    } catch (error) {
        // Fallback seed data when DB is unavailable
        res.json({ success: true, data: SEED_TRIPS, source: 'seed' });
    }
};

const createTrip = async (req, res) => {
    try {
        const trip = await Trip.create(req.body);
        res.status(201).json({ success: true, data: trip });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findByPk(req.params.id);
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        await trip.update(req.body);
        res.json({ success: true, data: trip });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findByPk(req.params.id);
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        await trip.destroy();
        res.json({ success: true, message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllTrips, createTrip, updateTrip, deleteTrip };
