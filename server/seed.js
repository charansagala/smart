require('dotenv').config();
const Destination = require('./models/Destination');
const { sequelize } = require('./config/database');

const destinations = [
    { name: 'Bali', location: 'Bali, Indonesia', rating: 4.9, popularity_score: 12400, best_season: 'Summer', cost_level: 'Mid-range', category: 'Beach', description: 'Tropical paradise with rich Hindu culture, stunning rice terraces, and pristine beaches.', attributes: ['Beach', 'Cultural', 'Wellness', 'Surfing', 'Temples'], image_url: '', is_active: true },
    { name: 'Kyoto', location: 'Kyoto, Japan', rating: 4.8, popularity_score: 10100, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: 'Ancient capital filled with thousands of classical Buddhist temples and traditional machiya houses.', attributes: ['Heritage', 'Temples', 'Gardens', 'Food', 'UNESCO'], image_url: '', is_active: true },
    { name: 'Swiss Alps', location: 'Interlaken, Switzerland', rating: 4.9, popularity_score: 9700, best_season: 'Winter', cost_level: 'Luxury', category: 'Mountain', description: 'Breathtaking alpine scenery with world-class skiing, hiking, and charming villages.', attributes: ['Skiing', 'Hiking', 'Scenic', 'Snow Sports', 'Luxury'], image_url: '', is_active: true },
    { name: 'Santorini', location: 'Santorini, Greece', rating: 4.8, popularity_score: 9200, best_season: 'Summer', cost_level: 'Luxury', category: 'Beach', description: 'Iconic white-washed buildings with blue domes perched above the stunning Aegean caldera.', attributes: ['Scenic', 'Romance', 'Luxury', 'Sunsets', 'Wine'], image_url: '', is_active: true },
    { name: 'Patagonia', location: 'Patagonia, Argentina', rating: 4.7, popularity_score: 7200, best_season: 'Summer', cost_level: 'Mid-range', category: 'Adventure', description: 'Remote wilderness featuring dramatic glaciers, granite peaks, and extraordinary wildlife.', attributes: ['Trekking', 'Wildlife', 'Glaciers', 'Adventure', 'Camping'], image_url: '', is_active: true },
    { name: 'Tokyo', location: 'Tokyo, Japan', rating: 4.8, popularity_score: 15000, best_season: 'Spring', cost_level: 'Mid-range', category: 'City', description: 'Ultramodern megacity where cutting-edge technology meets deep-rooted traditional culture.', attributes: ['City', 'Tech', 'Food', 'Shopping', 'Anime'], image_url: '', is_active: true },
    { name: 'Amazon Rainforest', location: 'Manaus, Brazil', rating: 4.6, popularity_score: 5800, best_season: 'Autumn', cost_level: 'Budget', category: 'Nature', description: "Earth's largest tropical rainforest with extraordinary biodiversity and indigenous cultures.", attributes: ['Wildlife', 'Eco', 'Biodiversity', 'River', 'Indigenous'], image_url: '', is_active: true },
    { name: 'Machu Picchu', location: 'Cusco Region, Peru', rating: 4.9, popularity_score: 11000, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: "Mystical 15th-century Incan citadel in the Andes — one of the world's most iconic sites.", attributes: ['Historical', 'Inca', 'Trekking', 'UNESCO', 'Mountains'], image_url: '', is_active: true },
    { name: 'Maldives', location: 'Malé, Maldives', rating: 4.9, popularity_score: 8900, best_season: 'Winter', cost_level: 'Luxury', category: 'Beach', description: 'Crystal-clear lagoons, coral reefs, and unparalleled luxury in overwater bungalows.', attributes: ['Beach', 'Luxury', 'Snorkeling', 'Romance', 'Overwater Villas'], image_url: '', is_active: true },
    { name: 'Serengeti', location: 'Serengeti, Tanzania', rating: 4.8, popularity_score: 7600, best_season: 'Summer', cost_level: 'Luxury', category: 'Nature', description: 'Vast ecosystem hosting the greatest wildlife spectacle on Earth — the Great Migration.', attributes: ['Safari', 'Wildlife', 'Migration', 'Big Five', 'Photography'], image_url: '', is_active: true },
    { name: 'Petra', location: "Ma'an Governorate, Jordan", rating: 4.8, popularity_score: 6900, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: 'A historical city known for rock-cut architecture and ancient water conduit systems.', attributes: ['Heritage', 'UNESCO', 'Historical', 'Desert', 'Architecture'], image_url: '', is_active: true },
    { name: 'Norwegian Fjords', location: 'Flåm, Norway', rating: 4.8, popularity_score: 8100, best_season: 'Summer', cost_level: 'Luxury', category: 'Nature', description: "Dramatic landscapes of deep blue fjords cutting through Norway's spectacular mountains.", attributes: ['Scenic', 'Hiking', 'Cruising', 'Northern Lights', 'Adventure'], image_url: '', is_active: true },
];

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ DB connected');
        await sequelize.sync({ alter: false });

        const existing = await Destination.count();
        if (existing > 0) {
            console.log(`ℹ️  ${existing} destinations already in DB — skipping seed`);
            process.exit(0);
        }

        for (const d of destinations) {
            await Destination.create(d);
            process.stdout.write(`  ✅ Seeded: ${d.name}\n`);
        }
        console.log(`\n🎉 Done! ${destinations.length} destinations seeded into smart_tourism_db`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
})();
