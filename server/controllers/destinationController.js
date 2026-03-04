const { Op } = require('sequelize');
const Destination = require('../models/Destination');

// ─── Seed data (used when DB is unavailable) ─────────────────────────────────
const seedDestinations = [
    {
        id: 1,
        name: 'Bali',
        location: 'Bali, Indonesia',
        rating: 4.9,
        popularity_score: 12400,
        best_season: 'Summer',
        cost_level: 'Mid-range',
        category: 'Beach',
        description: 'Tropical paradise with rich Hindu culture, stunning rice terraces, and pristine beaches. Known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs.',
        attributes: ['Beach', 'Cultural', 'Wellness', 'Surfing', 'Temples'],
        image_url: '',
        is_active: true,
        created_at: new Date('2025-01-01'),
    },
    {
        id: 2,
        name: 'Kyoto',
        location: 'Kyoto, Japan',
        rating: 4.8,
        popularity_score: 10100,
        best_season: 'Spring',
        cost_level: 'Mid-range',
        category: 'Cultural',
        description: 'Ancient capital filled with thousands of classical Buddhist temples, gardens, and traditional wooden machiya houses. Experience geisha culture in the Gion district.',
        attributes: ['Heritage', 'Temples', 'Gardens', 'Food', 'UNESCO'],
        image_url: '',
        is_active: true,
        created_at: new Date('2025-01-02'),
    },
    {
        id: 3,
        name: 'Swiss Alps',
        location: 'Interlaken, Switzerland',
        rating: 4.9,
        popularity_score: 9700,
        best_season: 'Winter',
        cost_level: 'Luxury',
        category: 'Mountain',
        description: 'Breathtaking alpine scenery with world-class skiing, hiking, and charming villages. The Swiss Alps offer some of the most spectacular mountain vistas on Earth.',
        attributes: ['Skiing', 'Hiking', 'Scenic', 'Snow Sports', 'Luxury'],
        image_url: '',
        is_active: true,
        created_at: new Date('2025-01-03'),
    },
    {
        id: 4,
        name: 'Santorini',
        location: 'Santorini, Greece',
        rating: 4.8,
        popularity_score: 9200,
        best_season: 'Summer',
        cost_level: 'Luxury',
        category: 'Beach',
        description: 'Iconic white-washed buildings with blue domes perched above the stunning Aegean caldera. Famous for breathtaking sunsets and volcanic black sand beaches.',
        attributes: ['Scenic', 'Romance', 'Luxury', 'Sunsets', 'Wine'],
        image_url: '',
        is_active: true,
        created_at: new Date('2025-01-04'),
    },
    {
        id: 5,
        name: 'Patagonia',
        location: 'Patagonia, Argentina',
        rating: 4.7,
        popularity_score: 7200,
        best_season: 'Summer',
        cost_level: 'Mid-range',
        category: 'Adventure',
        description: 'Remote wilderness at the southern tip of South America, featuring dramatic glaciers, granite peaks, and extraordinary wildlife including penguins and condors.',
        attributes: ['Trekking', 'Wildlife', 'Glaciers', 'Adventure', 'Camping'],
        image_url: '',
        is_active: true,
        created_at: new Date('2025-01-05'),
    },
    {
        id: 6,
        name: 'Tokyo',
        location: 'Tokyo, Japan',
        rating: 4.8,
        popularity_score: 15000,
        best_season: 'Spring',
        cost_level: 'Mid-range',
        category: 'City',
        description: 'Ultramodern megacity where cutting-edge technology meets deep-rooted traditional culture. Explore neon-lit skyscrapers, ancient temples, and an unmatched culinary scene.',
        attributes: ['City', 'Tech', 'Food', 'Shopping', 'Anime'],
        image_url: '',
        is_active: true,
        created_at: new Date('2025-01-06'),
    },
    {
        id: 7,
        name: 'Amazon Rainforest',
        location: 'Manaus, Brazil',
        rating: 4.6,
        popularity_score: 5800,
        best_season: 'Autumn',
        cost_level: 'Budget',
        category: 'Nature',
        description: "Earth's largest tropical rainforest, home to an extraordinary density of biodiversity. Explore river ecosystems, canopy walks, and ancient indigenous cultures.",
        attributes: ['Wildlife', 'Eco', 'Biodiversity', 'River', 'Indigenous'],
        image_url: '',
        is_active: true,
        created_at: new Date('2025-01-07'),
    },
    {
        id: 8,
        name: 'Machu Picchu',
        location: 'Cusco Region, Peru',
        rating: 4.9,
        popularity_score: 11000,
        best_season: 'Spring',
        cost_level: 'Mid-range',
        category: 'Cultural',
        description: "Mystical 15th-century Incan citadel set high in the Andes Mountains, often called the 'Lost City of the Incas'. One of the world's most iconic archaeological sites.",
        attributes: ['Historical', 'Inca', 'Trekking', 'UNESCO', 'Mountains'],
        image_url: '',
        is_active: true,
        created_at: new Date('2025-01-08'),
    },
    {
        id: 9,
        name: 'Maldives',
        location: 'Malé, Maldives',
        rating: 4.9,
        popularity_score: 8900,
        best_season: 'Winter',
        cost_level: 'Luxury',
        category: 'Beach',
        description: 'Archipelago of 26 natural atolls in the Indian Ocean. Famous for crystal-clear water bungalows, coral reefs, and unparalleled luxury in secluded island resorts.',
        attributes: ['Beach', 'Luxury', 'Snorkeling', 'Romance', 'Overwater Villas'],
        image_url: '',
        is_active: true,
        created_at: new Date('2025-01-09'),
    },
    {
        id: 10,
        name: 'Serengeti',
        location: 'Serengeti, Tanzania',
        rating: 4.8,
        popularity_score: 7600,
        best_season: 'Summer',
        cost_level: 'Luxury',
        category: 'Nature',
        description: 'Vast ecosystem host to the greatest wildlife spectacle on Earth — the annual Great Migration of over 1.5 million wildebeest across endless golden savannahs.',
        attributes: ['Safari', 'Wildlife', 'Migration', 'Big Five', 'Photography'],
        image_url: '',
        is_active: true,
        created_at: new Date('2025-01-10'),
    },
];

let nextId = seedDestinations.length + 1; // mock in-memory ID counter

// ─── Helper: try DB first, fallback gracefully ────────────────────────────────
const tryDB = async (fn, fallback) => {
    try {
        return await fn();
    } catch {
        return fallback;
    }
};

// ─── GET /api/destinations ────────────────────────────────────────────────────
const getAllDestinations = async (req, res) => {
    try {
        const { search, category, season, cost_level, sort = 'rating' } = req.query;

        const where = { is_active: true };
        if (category && category !== 'All') where.category = category;
        if (season && season !== 'All') where.best_season = season;
        if (cost_level && cost_level !== 'All') where.cost_level = cost_level;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ];
        }

        const order = sort === 'popularity'
            ? [['popularity_score', 'DESC']]
            : sort === 'name'
                ? [['name', 'ASC']]
                : [['rating', 'DESC']];

        const destinations = await tryDB(
            () => Destination.findAll({ where, order }),
            (() => {
                let data = [...seedDestinations];
                if (category && category !== 'All') data = data.filter(d => d.category === category);
                if (season && season !== 'All') data = data.filter(d => d.best_season === season);
                if (cost_level && cost_level !== 'All') data = data.filter(d => d.cost_level === cost_level);
                if (search) {
                    const q = search.toLowerCase();
                    data = data.filter(d =>
                        d.name.toLowerCase().includes(q) ||
                        d.location.toLowerCase().includes(q) ||
                        d.description.toLowerCase().includes(q)
                    );
                }
                return data.sort((a, b) =>
                    sort === 'popularity' ? b.popularity_score - a.popularity_score :
                        sort === 'name' ? a.name.localeCompare(b.name) :
                            b.rating - a.rating
                );
            })()
        );

        res.json({ success: true, data: destinations, total: destinations.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/destinations/:id ────────────────────────────────────────────────
const getDestinationById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const destination = await tryDB(
            () => Destination.findOne({ where: { id, is_active: true } }),
            seedDestinations.find(d => d.id === id)
        );
        if (!destination) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        res.json({ success: true, data: destination });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── POST /api/destinations ───────────────────────────────────────────────────
const createDestination = async (req, res) => {
    try {
        const { name, location, rating, popularity_score, best_season, cost_level, category, description, attributes, image_url } = req.body;

        if (!name || !location) {
            return res.status(400).json({ success: false, message: 'Name and location are required' });
        }

        const destination = await tryDB(
            () => Destination.create({ name, location, rating, popularity_score, best_season, cost_level, category, description, attributes, image_url }),
            (() => {
                const newDest = {
                    id: nextId++,
                    name, location,
                    rating: parseFloat(rating) || 4.0,
                    popularity_score: parseInt(popularity_score) || 0,
                    best_season: best_season || 'Year-round',
                    cost_level: cost_level || 'Mid-range',
                    category: category || 'Cultural',
                    description: description || '',
                    attributes: attributes || [],
                    image_url: image_url || '',
                    is_active: true,
                    created_at: new Date(),
                };
                seedDestinations.push(newDest);
                return newDest;
            })()
        );

        res.status(201).json({ success: true, data: destination, message: 'Destination created successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── PUT /api/destinations/:id ────────────────────────────────────────────────
const updateDestination = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const destination = await tryDB(
            async () => {
                const dest = await Destination.findByPk(id);
                if (!dest) return null;
                await dest.update(req.body);
                return dest;
            },
            (() => {
                const idx = seedDestinations.findIndex(d => d.id === id);
                if (idx === -1) return null;
                seedDestinations[idx] = { ...seedDestinations[idx], ...req.body };
                return seedDestinations[idx];
            })()
        );

        if (!destination) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        res.json({ success: true, data: destination, message: 'Destination updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── DELETE /api/destinations/:id ────────────────────────────────────────────
const deleteDestination = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await tryDB(
            async () => {
                const dest = await Destination.findByPk(id);
                if (!dest) return false;
                await dest.update({ is_active: false }); // soft delete
                return true;
            },
            (() => {
                const idx = seedDestinations.findIndex(d => d.id === id);
                if (idx === -1) return false;
                seedDestinations[idx].is_active = false;
                return true;
            })()
        );

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        res.json({ success: true, message: 'Destination deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllDestinations,
    getDestinationById,
    createDestination,
    updateDestination,
    deleteDestination,
};
