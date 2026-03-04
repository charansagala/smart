import { useState, useEffect, useCallback } from 'react';
import { destinationsAPI } from '@/services/api';

// ── Seed data mirrored from the server (used when backend is offline) ──
const SEED = [
    { id: 1, name: 'Bali', location: 'Bali, Indonesia', rating: 4.9, popularity_score: 12400, best_season: 'Summer', cost_level: 'Mid-range', category: 'Beach', description: 'Tropical paradise with rich Hindu culture, stunning rice terraces, and pristine beaches.', attributes: ['Beach', 'Cultural', 'Wellness', 'Surfing', 'Temples'], image_url: '', is_active: true },
    { id: 2, name: 'Kyoto', location: 'Kyoto, Japan', rating: 4.8, popularity_score: 10100, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: 'Ancient capital filled with thousands of classical Buddhist temples and traditional machiya houses.', attributes: ['Heritage', 'Temples', 'Gardens', 'Food', 'UNESCO'], image_url: '', is_active: true },
    { id: 3, name: 'Swiss Alps', location: 'Interlaken, Switzerland', rating: 4.9, popularity_score: 9700, best_season: 'Winter', cost_level: 'Luxury', category: 'Mountain', description: 'Breathtaking alpine scenery with world-class skiing, hiking, and charming villages.', attributes: ['Skiing', 'Hiking', 'Scenic', 'Snow Sports', 'Luxury'], image_url: '', is_active: true },
    { id: 4, name: 'Santorini', location: 'Santorini, Greece', rating: 4.8, popularity_score: 9200, best_season: 'Summer', cost_level: 'Luxury', category: 'Beach', description: 'Iconic white-washed buildings with blue domes perched above the stunning Aegean caldera.', attributes: ['Scenic', 'Romance', 'Luxury', 'Sunsets', 'Wine'], image_url: '', is_active: true },
    { id: 5, name: 'Patagonia', location: 'Patagonia, Argentina', rating: 4.7, popularity_score: 7200, best_season: 'Summer', cost_level: 'Mid-range', category: 'Adventure', description: 'Remote wilderness featuring dramatic glaciers, granite peaks, and extraordinary wildlife.', attributes: ['Trekking', 'Wildlife', 'Glaciers', 'Adventure', 'Camping'], image_url: '', is_active: true },
    { id: 6, name: 'Tokyo', location: 'Tokyo, Japan', rating: 4.8, popularity_score: 15000, best_season: 'Spring', cost_level: 'Mid-range', category: 'City', description: 'Ultramodern megacity where cutting-edge technology meets deep-rooted traditional culture.', attributes: ['City', 'Tech', 'Food', 'Shopping', 'Anime'], image_url: '', is_active: true },
    { id: 7, name: 'Amazon Rainforest', location: 'Manaus, Brazil', rating: 4.6, popularity_score: 5800, best_season: 'Autumn', cost_level: 'Budget', category: 'Nature', description: "Earth's largest tropical rainforest with extraordinary biodiversity and ancient indigenous cultures.", attributes: ['Wildlife', 'Eco', 'Biodiversity', 'River', 'Indigenous'], image_url: '', is_active: true },
    { id: 8, name: 'Machu Picchu', location: 'Cusco Region, Peru', rating: 4.9, popularity_score: 11000, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: "Mystical 15th-century Incan citadel in the Andes — one of the world's most iconic archaeological sites.", attributes: ['Historical', 'Inca', 'Trekking', 'UNESCO', 'Mountains'], image_url: '', is_active: true },
    { id: 9, name: 'Maldives', location: 'Malé, Maldives', rating: 4.9, popularity_score: 8900, best_season: 'Winter', cost_level: 'Luxury', category: 'Beach', description: 'Crystal-clear lagoons, coral reefs, and unparalleled luxury in secluded overwater bungalows.', attributes: ['Beach', 'Luxury', 'Snorkeling', 'Romance', 'Overwater Villas'], image_url: '', is_active: true },
    { id: 10, name: 'Serengeti', location: 'Serengeti, Tanzania', rating: 4.8, popularity_score: 7600, best_season: 'Summer', cost_level: 'Luxury', category: 'Nature', description: 'Vast ecosystem host to the greatest wildlife spectacle on Earth — the annual Great Migration.', attributes: ['Safari', 'Wildlife', 'Migration', 'Big Five', 'Photography'], image_url: '', is_active: true },
];

let localSeed = [...SEED];
let nextLocalId = SEED.length + 1;

export function useDestinations(filters = {}) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useLocal, setUseLocal] = useState(false);

    const applyFilters = useCallback((data, { search, category, season, cost_level, sort }) => {
        let filtered = data.filter(d => d.is_active !== false);
        if (category && category !== 'All') filtered = filtered.filter(d => d.category === category);
        if (season && season !== 'All') filtered = filtered.filter(d => d.best_season === season);
        if (cost_level && cost_level !== 'All') filtered = filtered.filter(d => d.cost_level === cost_level);
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.location.toLowerCase().includes(q) ||
                (d.description || '').toLowerCase().includes(q)
            );
        }
        return filtered.sort((a, b) =>
            sort === 'popularity' ? b.popularity_score - a.popularity_score :
                sort === 'name' ? a.name.localeCompare(b.name) :
                    b.rating - a.rating
        );
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await destinationsAPI.getAll(filters);
            const data = res.data || [];
            setDestinations(data);
            setUseLocal(false);
        } catch {
            // Fallback to local seed
            setDestinations(applyFilters(localSeed, filters));
            setUseLocal(true);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => { load(); }, [load]);

    const create = async (formData) => {
        try {
            const res = await destinationsAPI.create(formData);
            const newDest = res.data;
            setDestinations(prev => [newDest, ...prev]);
            return { success: true, data: newDest };
        } catch {
            // Local fallback
            const newDest = { ...formData, id: nextLocalId++, is_active: true, popularity_score: 0, created_at: new Date() };
            localSeed.unshift(newDest);
            setDestinations(prev => applyFilters([newDest, ...prev.map(d => d)], filters));
            return { success: true, data: newDest };
        }
    };

    const update = async (id, formData) => {
        try {
            const res = await destinationsAPI.update(id, formData);
            const updated = res.data;
            setDestinations(prev => prev.map(d => d.id === id ? updated : d));
            return { success: true, data: updated };
        } catch {
            const updated = { ...localSeed.find(d => d.id === id), ...formData };
            localSeed = localSeed.map(d => d.id === id ? updated : d);
            setDestinations(prev => prev.map(d => d.id === id ? updated : d));
            return { success: true, data: updated };
        }
    };

    const remove = async (id) => {
        try {
            await destinationsAPI.delete(id);
            setDestinations(prev => prev.filter(d => d.id !== id));
            return { success: true };
        } catch {
            localSeed = localSeed.map(d => d.id === id ? { ...d, is_active: false } : d);
            setDestinations(prev => prev.filter(d => d.id !== id));
            return { success: true };
        }
    };

    return { destinations, loading, error, useLocal, refetch: load, create, update, remove };
}
