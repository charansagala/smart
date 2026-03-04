const Destination = require('../models/Destination');
const TourismTrend = require('../models/TourismTrend');
const Recommendation = require('../models/Recommendation');
const { Op } = require('sequelize');

// Seed data fallbacks
const SEED_DESTS = [
    { name: 'Tokyo', rating: 4.8, visits: 15000, best_season: 'Spring' },
    { name: 'Bali', rating: 4.9, visits: 12400, best_season: 'Summer' },
    { name: 'Machu Picchu', rating: 4.9, visits: 11000, best_season: 'Spring' },
    { name: 'Kyoto', rating: 4.8, visits: 10100, best_season: 'Spring' },
    { name: 'Swiss Alps', rating: 4.9, visits: 9700, best_season: 'Winter' },
];

const SEED_TRENDS = [
    { month: 'Sep', visitors: 3200 },
    { month: 'Oct', visitors: 4100 },
    { month: 'Nov', visitors: 3800 },
    { month: 'Dec', visitors: 5200 },
    { month: 'Jan', visitors: 4700 },
    { month: 'Feb', visitors: 5900 },
    { month: 'Mar', visitors: 6400 },
];

const SEED_RECS = [
    { target: 'Bali', user: 'Guest_910', score: '95%', match: 'Budget & Beach' },
    { target: 'Tokyo', user: 'Guest_442', score: '91%', match: 'City & Culture' },
    { target: 'Swiss Alps', user: 'Guest_019', score: '88%', match: 'Winter & Mountain' },
    { target: 'Santorini', user: 'Guest_773', score: '85%', match: 'Romance & Beach' },
    { target: 'Patagonia', user: 'Guest_221', score: '82%', match: 'Adventure & Nature' },
];

/**
 * Predict next month's visitors based on a simple linear trend of the last N months.
 */
const predictNextMonth = (historicalData, key = 'visitors') => {
    if (!historicalData || historicalData.length < 2) return { predictedValue: historicalData[0]?.[key] || 0, percentChange: '+0%' };
    const n = historicalData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
        const x = i + 1;
        const y = historicalData[i][key];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    let nextValue = Math.round(slope * (n + 1) + intercept);
    if (nextValue < 0) nextValue = 0;

    const lastValue = historicalData[n - 1][key] || 1;
    const change = ((nextValue - lastValue) / lastValue) * 100;
    const sign = change >= 0 ? '+' : '';

    return {
        predictedValue: nextValue,
        percentChange: `${sign}${change.toFixed(1)}%`
    };
};

// GET /api/analytics/summary
const getSummary = async (req, res) => {
    try {
        let totalDestinations = 12; // fallback
        let avgRating = 4.8;

        try {
            const dests = await Destination.findAll({ where: { is_active: true } });
            if (dests.length > 0) {
                totalDestinations = dests.length;
                const sumRatings = dests.reduce((acc, curr) => acc + parseFloat(curr.rating || 0), 0);
                avgRating = (sumRatings / totalDestinations).toFixed(1);
            }
        } catch (e) { }

        const prediction = predictNextMonth(SEED_TRENDS, 'visitors');

        const summary = [
            { id: 'destinations', label: 'Total Destinations', value: totalDestinations.toString(), icon: 'map' },
            { id: 'rating', label: 'Average Rating', value: avgRating.toString(), icon: 'star' },
            { id: 'visitors', label: 'YTD Visitors', value: '33,300', icon: 'users' },
            { id: 'forecast', label: 'Next Month Forecast', value: prediction.predictedValue.toLocaleString(), icon: 'trend', delta: prediction.percentChange },
        ];

        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/analytics/popular
const getPopular = async (req, res) => {
    try {
        let popular = [];
        try {
            const dests = await Destination.findAll({
                order: [['popularity_score', 'DESC']],
                limit: 5
            });
            if (dests.length > 0) {
                popular = dests.map(d => ({ name: d.name, visits: d.popularity_score }));
            } else throw new Error();
        } catch (e) {
            popular = SEED_DESTS.map(d => ({ name: d.name, visits: d.visits }));
        }

        res.json({ success: true, data: popular });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/analytics/trends
const getTrends = async (req, res) => {
    try {
        // Linear regression prediction
        const prediction = predictNextMonth(SEED_TRENDS, 'visitors');

        const forecastTrend = [
            ...SEED_TRENDS,
            { month: 'Apr (Forecast)', visitors: prediction.predictedValue, forecast: true }
        ];

        res.json({
            success: true,
            data: {
                chartData: forecastTrend,
                recentRecommendations: SEED_RECS
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getSummary, getPopular, getTrends };
