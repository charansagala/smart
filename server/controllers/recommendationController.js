const Destination = require('../models/Destination');
const { computeRecommendations } = require('../services/recommendationEngine');

// ── Same seed as destinationController (shared source of truth) ──────────────
const SEED_DESTINATIONS = [
    { id: 1, name: 'Bali', location: 'Bali, Indonesia', rating: 4.9, popularity_score: 12400, best_season: 'Summer', cost_level: 'Mid-range', category: 'Beach', description: 'Tropical paradise with rich Hindu culture, stunning rice terraces, and pristine beaches.', attributes: ['Beach', 'Cultural', 'Wellness', 'Surfing', 'Temples'], recommended_duration: '5-7 days', is_active: true },
    { id: 2, name: 'Kyoto', location: 'Kyoto, Japan', rating: 4.8, popularity_score: 10100, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: 'Ancient capital filled with classical Buddhist temples and traditional machiya houses.', attributes: ['Heritage', 'Temples', 'Gardens', 'Food', 'UNESCO'], recommended_duration: '4-6 days', is_active: true },
    { id: 3, name: 'Swiss Alps', location: 'Interlaken, Switzerland', rating: 4.9, popularity_score: 9700, best_season: 'Winter', cost_level: 'Luxury', category: 'Mountain', description: 'Breathtaking alpine scenery with world-class skiing, hiking, and charming villages.', attributes: ['Skiing', 'Hiking', 'Scenic', 'Snow Sports', 'Luxury'], recommended_duration: '7-10 days', is_active: true },
    { id: 4, name: 'Santorini', location: 'Santorini, Greece', rating: 4.8, popularity_score: 9200, best_season: 'Summer', cost_level: 'Luxury', category: 'Beach', description: 'Iconic white-washed buildings perched above the stunning Aegean caldera.', attributes: ['Scenic', 'Romance', 'Luxury', 'Sunsets', 'Wine'], recommended_duration: '4-5 days', is_active: true },
    { id: 5, name: 'Patagonia', location: 'Patagonia, Argentina', rating: 4.7, popularity_score: 7200, best_season: 'Summer', cost_level: 'Mid-range', category: 'Adventure', description: 'Remote wilderness featuring dramatic glaciers, granite peaks, and extraordinary wildlife.', attributes: ['Trekking', 'Wildlife', 'Glaciers', 'Adventure', 'Camping'], recommended_duration: '10-14 days', is_active: true },
    { id: 6, name: 'Tokyo', location: 'Tokyo, Japan', rating: 4.8, popularity_score: 15000, best_season: 'Spring', cost_level: 'Mid-range', category: 'City', description: 'Ultramodern megacity where technology meets deep-rooted traditional culture.', attributes: ['City', 'Tech', 'Food', 'Shopping', 'Anime'], recommended_duration: '5-8 days', is_active: true },
    { id: 7, name: 'Amazon Rainforest', location: 'Manaus, Brazil', rating: 4.6, popularity_score: 5800, best_season: 'Autumn', cost_level: 'Budget', category: 'Nature', description: "Earth's largest tropical rainforest with extraordinary biodiversity.", attributes: ['Wildlife', 'Eco', 'Biodiversity', 'River', 'Indigenous'], recommended_duration: '7-12 days', is_active: true },
    { id: 8, name: 'Machu Picchu', location: 'Cusco Region, Peru', rating: 4.9, popularity_score: 11000, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: "Mystical 15th-century Incan citadel — one of the world's most iconic heritage sites.", attributes: ['Historical', 'Inca', 'Trekking', 'UNESCO', 'Mountains'], recommended_duration: '3-5 days', is_active: true },
    { id: 9, name: 'Maldives', location: 'Malé, Maldives', rating: 4.9, popularity_score: 8900, best_season: 'Winter', cost_level: 'Luxury', category: 'Beach', description: 'Crystal-clear lagoons, coral reefs, and unparalleled luxury in overwater bungalows.', attributes: ['Beach', 'Luxury', 'Snorkeling', 'Romance', 'Overwater Villas'], recommended_duration: '5-7 days', is_active: true },
    { id: 10, name: 'Serengeti', location: 'Serengeti, Tanzania', rating: 4.8, popularity_score: 7600, best_season: 'Summer', cost_level: 'Luxury', category: 'Nature', description: 'Vast ecosystem host to the Great Migration — the greatest wildlife spectacle on Earth.', attributes: ['Safari', 'Wildlife', 'Migration', 'Big Five', 'Photography'], recommended_duration: '7-10 days', is_active: true },
    { id: 11, name: 'Petra', location: 'Ma\'an Governorate, Jordan', rating: 4.8, popularity_score: 6900, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: 'A historical and archaeological city known for rock-cut architecture and water conduit system.', attributes: ['Heritage', 'UNESCO', 'Historical', 'Desert', 'Architecture'], recommended_duration: '2-3 days', is_active: true },
    { id: 12, name: 'Norwegian Fjords', location: 'Flåm, Norway', rating: 4.8, popularity_score: 8100, best_season: 'Summer', cost_level: 'Luxury', category: 'Nature', description: "Dramatic landscapes of deep blue fjords cutting through Norway's mountains.", attributes: ['Scenic', 'Hiking', 'Cruising', 'Northern Lights', 'Adventure'], recommended_duration: '7-10 days', is_active: true },
];

// ── Validation ────────────────────────────────────────────────────────────────
const VALID_SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'Year-round'];
const VALID_BUDGETS = ['Budget', 'Mid-range', 'Luxury'];
const VALID_CATS = ['beach', 'mountains', 'mountain', 'heritage', 'cultural', 'city', 'nature', 'adventure'];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/recommendations
// Body: { categories: string[], season: string, budget: string, days: number }
// ─────────────────────────────────────────────────────────────────────────────
const getRecommendations = async (req, res) => {
    try {
        const { categories = [], season, budget, days } = req.body;

        // ── Validate ─────────────────────────────────────────────────────────
        const errors = [];
        if (!Array.isArray(categories) || categories.length === 0)
            errors.push('categories must be a non-empty array');
        if (!season || !VALID_SEASONS.includes(season))
            errors.push(`season must be one of: ${VALID_SEASONS.join(', ')}`);
        if (!budget || !VALID_BUDGETS.includes(budget))
            errors.push(`budget must be one of: ${VALID_BUDGETS.join(', ')}`);
        if (!days || isNaN(days) || days < 1 || days > 365)
            errors.push('days must be a number between 1 and 365');
        if (errors.length > 0)
            return res.status(400).json({ success: false, errors });

        const prefs = { categories, season, budget, days: parseInt(days) };

        // ── Fetch destinations (DB → seed fallback) ───────────────────────────
        let destinations;
        try {
            destinations = await Destination.findAll({ where: { is_active: true } });
            if (!destinations || destinations.length === 0) throw new Error('empty');
            // Convert Sequelize instances to plain objects
            destinations = destinations.map(d => d.get({ plain: true }));
        } catch {
            destinations = SEED_DESTINATIONS;
        }

        // ── Run scoring engine ────────────────────────────────────────────────
        const recommendations = computeRecommendations(destinations, prefs, 5);

        // ── Build response ────────────────────────────────────────────────────
        res.json({
            success: true,
            preferences: prefs,
            total: recommendations.length,
            recommendations: recommendations.map(r => ({
                rank: r.rank,
                id: r.destination.id,
                name: r.destination.name,
                location: r.destination.location,
                category: r.destination.category,
                cost_level: r.destination.cost_level,
                best_season: r.destination.best_season,
                rating: r.destination.rating,
                popularity_score: r.destination.popularity_score,
                attributes: r.destination.attributes || [],
                description: r.destination.description,
                image_url: r.destination.image_url || '',
                score: r.score,
                matchPercent: r.matchPercent,
                breakdown: r.breakdown,
                reason: r.reason,
            })),
        });
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getRecommendations };
