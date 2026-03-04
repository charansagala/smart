const Destination = require('../models/Destination');
const { generateItinerary } = require('../services/tripPlannerEngine');

// ── Shared fallback data ──────────────────────────────────────────────────
const SEED_DESTINATIONS = [
    { id: 1, name: 'Bali', location: 'Bali, Indonesia', rating: 4.9, popularity_score: 12400, best_season: 'Summer', cost_level: 'Mid-range', category: 'Beach', description: 'Tropical paradise with rich Hindu culture.', attributes: ['Beach', 'Cultural', 'Wellness', 'Surfing', 'Temples'], is_active: true },
    { id: 2, name: 'Kyoto', location: 'Kyoto, Japan', rating: 4.8, popularity_score: 10100, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: 'Ancient capital filled with classical temples.', attributes: ['Heritage', 'Temples', 'Gardens', 'Food', 'UNESCO'], is_active: true },
    { id: 3, name: 'Swiss Alps', location: 'Interlaken, Switzerland', rating: 4.9, popularity_score: 9700, best_season: 'Winter', cost_level: 'Luxury', category: 'Mountain', description: 'Breathtaking alpine scenery.', attributes: ['Skiing', 'Hiking', 'Scenic', 'Snow Sports', 'Luxury'], is_active: true },
    { id: 4, name: 'Santorini', location: 'Santorini, Greece', rating: 4.8, popularity_score: 9200, best_season: 'Summer', cost_level: 'Luxury', category: 'Beach', description: 'Iconic white-washed buildings over the Aegean.', attributes: ['Scenic', 'Romance', 'Luxury', 'Sunsets', 'Wine'], is_active: true },
    { id: 5, name: 'Patagonia', location: 'Patagonia, Argentina', rating: 4.7, popularity_score: 7200, best_season: 'Summer', cost_level: 'Mid-range', category: 'Adventure', description: 'Remote wilderness with glaciers and condors.', attributes: ['Trekking', 'Wildlife', 'Glaciers', 'Adventure', 'Camping'], is_active: true },
    { id: 6, name: 'Tokyo', location: 'Tokyo, Japan', rating: 4.8, popularity_score: 15000, best_season: 'Spring', cost_level: 'Mid-range', category: 'City', description: 'Ultramodern megacity meets traditional culture.', attributes: ['City', 'Tech', 'Food', 'Shopping'], is_active: true },
];

const planTrip = async (req, res) => {
    try {
        const { destinationIds = [], travelDays, budget } = req.body;

        if (!travelDays || isNaN(travelDays) || travelDays < 1) {
            return res.status(400).json({ success: false, message: 'Invalid travel days' });
        }

        let destinations = [];
        try {
            destinations = await Destination.findAll({ where: { is_active: true } });
            destinations = destinations.map(d => d.get({ plain: true }));
        } catch {
            destinations = SEED_DESTINATIONS;
        }

        let selectedDests = [];
        if (destinationIds.length > 0) {
            selectedDests = destinations.filter(d => destinationIds.includes(d.id));
        } else {
            // If no destinations selected, just pick top 3 based on budget (or overall rating)
            selectedDests = destinations
                .filter(d => !budget || d.cost_level === budget)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 3);
            if (selectedDests.length === 0) {
                selectedDests = destinations.sort((a, b) => b.rating - a.rating).slice(0, 3);
            }
        }

        if (selectedDests.length === 0) {
            return res.status(400).json({ success: false, message: 'No matching destinations found' });
        }

        const itinerary = require('../services/tripPlannerEngine').generateItinerary(selectedDests, parseInt(travelDays), budget);

        res.json({
            success: true,
            data: {
                itinerary,
                summary: {
                    days: travelDays,
                    budget,
                    destinations: selectedDests.map(d => d.name)
                }
            }
        });
    } catch (error) {
        console.error('Trip planner error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { planTrip };
