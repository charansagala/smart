/**
 * Trip Itinerary Optimizer Engine
 *
 * Inputs:
 * - selectedDestinations: Array of full destination objects
 * - travelDays: Number of days
 * - budgetLevel: string ('Budget', 'Mid-range', 'Luxury')
 *
 * Logic:
 * We need to create a day-by-day itinerary. Since we don't have real geographic coordinates,
 * we will "group" destinations or just distribute them across the days.
 * If there are more days than destinations, a destination might be spread across multiple days
 * with different activities.
 * If there are more destinations than days, we select the top-rated ones that fit the budget.
 */

// Simple mock coordinates to calculate distances for optimization
const DEMO_COORDS = {
    1: { lat: -8.3405, lng: 115.0920 }, // Bali
    2: { lat: 35.0116, lng: 135.7681 }, // Kyoto
    3: { lat: 46.6863, lng: 7.8632 },   // Swiss Alps
    4: { lat: 36.3932, lng: 25.4615 },  // Santorini
    5: { lat: -41.8102, lng: -68.9063 }, // Patagonia
    6: { lat: 35.6762, lng: 139.6503 }, // Tokyo
    7: { lat: -3.1190, lng: -60.0217 }, // Amazon
    8: { lat: -13.1631, lng: -72.5450 }, // Machu Picchu
    9: { lat: 4.1755, lng: 73.5093 },   // Maldives
    10: { lat: -2.3333, lng: 34.8333 }, // Serengeti
    // defaults
};

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const DAILY_BUDGET_MAP = {
    'Budget': 50,
    'Mid-range': 150,
    'Luxury': 500
};

/**
 * Generate an Optimized Itinerary
 */
function generateItinerary(destinations, travelDays, budgetLevel) {
    if (!destinations || destinations.length === 0) return [];
    if (travelDays < 1) return [];

    const maxDailyBudget = DAILY_BUDGET_MAP[budgetLevel] || 150;

    // 1. Sort destinations by rating DESC to prioritize best ones
    let sortedDests = [...destinations].sort((a, b) => b.rating - a.rating);

    // 2. Select top N destinations based on travelDays.
    // E.g., assume 1 destination per 1-3 days.
    const numDestsToVisit = Math.min(Math.ceil(travelDays / 2), sortedDests.length);
    const selectedDests = sortedDests.slice(0, Math.max(1, numDestsToVisit));

    // 3. TSP-like sort (Greedy closest neighbor)
    let itineraryRoute = [];
    let currentLoc = selectedDests[0];
    itineraryRoute.push(currentLoc);
    const unvisited = selectedDests.slice(1);

    while (unvisited.length > 0) {
        const coord1 = DEMO_COORDS[currentLoc.id] || { lat: 0, lng: 0 };
        let nearestIdx = 0;
        let minDistance = Infinity;

        unvisited.forEach((dest, idx) => {
            const coord2 = DEMO_COORDS[dest.id] || { lat: 0, lng: 0 };
            const dist = getDistance(coord1.lat, coord1.lng, coord2.lat, coord2.lng);
            if (dist < minDistance) {
                minDistance = dist;
                nearestIdx = idx;
            }
        });

        currentLoc = unvisited.splice(nearestIdx, 1)[0];
        itineraryRoute.push(currentLoc);
    }

    // 4. Distribute days among the route
    const itinerary = [];
    const daysPerDest = Math.ceil(travelDays / itineraryRoute.length);

    let currentDay = 1;
    itineraryRoute.forEach((dest) => {
        let daysToSpend = Math.min(daysPerDest, travelDays - currentDay + 1);
        if (itineraryRoute.indexOf(dest) === itineraryRoute.length - 1) {
            daysToSpend = travelDays - currentDay + 1; // Remaining days to last dest
        }

        for (let i = 0; i < daysToSpend; i++) {
            if (currentDay > travelDays) break;

            // Generate some mock activities
            const isFirstDay = i === 0;
            const isLastDay = i === daysToSpend - 1;

            const activities = [];
            if (isFirstDay && currentDay !== 1) {
                activities.push({
                    id: `${currentDay}-1`,
                    type: 'Transport',
                    title: `Travel to ${dest.name}`,
                    time: '09:00 AM',
                    cost: Math.round(maxDailyBudget * 0.2),
                    done: false
                });
                activities.push({
                    id: `${currentDay}-2`,
                    type: 'Stay',
                    title: `Check-in at Hotel in ${dest.location}`,
                    time: '02:00 PM',
                    cost: Math.round(maxDailyBudget * 0.4),
                    done: false
                });
                activities.push({
                    id: `${currentDay}-3`,
                    type: 'Dining',
                    title: `Dinner Local Cuisine`,
                    time: '07:30 PM',
                    cost: Math.round(maxDailyBudget * 0.2),
                    done: false
                });
            } else {
                activities.push({
                    id: `${currentDay}-1`,
                    type: 'Sightseeing',
                    title: `Explore ${dest.category} highlights of ${dest.name}`,
                    time: '09:30 AM',
                    cost: Math.round(maxDailyBudget * 0.1),
                    done: false
                });
                activities.push({
                    id: `${currentDay}-2`,
                    type: 'Dining',
                    title: `Lunch at highly rated restaurant`,
                    time: '01:00 PM',
                    cost: Math.round(maxDailyBudget * 0.15),
                    done: false
                });
                activities.push({
                    id: `${currentDay}-3`,
                    type: 'Sightseeing',
                    title: `Afternoon ${dest.attributes ? dest.attributes[0] : 'activity'}`,
                    time: '03:30 PM',
                    cost: Math.round(maxDailyBudget * 0.1),
                    done: false
                });
            }

            itinerary.push({
                day: currentDay,
                date: `Day ${currentDay}`,
                location: dest.name,
                destination_id: dest.id,
                activities
            });

            currentDay++;
        }
    });

    return itinerary;
}

module.exports = { generateItinerary };
