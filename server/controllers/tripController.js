const { Trip } = require('../models');

const getAllTrips = async (req, res) => {
    try {
        const trips = await Trip.findAll({ order: [['created_at', 'DESC']] });
        res.json({ success: true, data: trips });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: [] });
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
