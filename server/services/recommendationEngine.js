/**
 * Tourism Recommendation Scoring Engine
 *
 * Scoring matrix (max possible = 8 points):
 *   season match   → +3
 *   category match → +2 per matched category (capped at +4 for multi-category)
 *   budget match   → +2  (exact)  /  +1  (adjacent)
 *   rating weight  → +1  (scaled: rating/5)
 *
 * Each destination also gets a normalised % score (0–100).
 */

// Category → season affinity (fallback hints when season not stored)
const SEASON_AFFINITY = {
    Beach: ['Summer', 'Spring'],
    Mountain: ['Winter', 'Spring', 'Autumn'],
    City: ['Year-round', 'Spring', 'Autumn'],
    Nature: ['Spring', 'Autumn', 'Summer'],
    Cultural: ['Year-round', 'Spring', 'Autumn'],
    Adventure: ['Summer', 'Spring', 'Autumn'],
};

// Budget adjacency (for partial match)
const BUDGET_ORDER = ['Budget', 'Mid-range', 'Luxury'];

/**
 * Map raw user categories (e.g. "heritage") to Destination.category values
 */
const USER_CAT_MAP = {
    beach: 'Beach',
    mountains: 'Mountain',
    mountain: 'Mountain',
    heritage: 'Cultural',
    cultural: 'Cultural',
    city: 'City',
    nature: 'Nature',
    adventure: 'Adventure',
};

const normaliseCategory = (raw) => USER_CAT_MAP[raw?.toLowerCase()] || raw;

/**
 * Score a single destination against user preferences.
 * Returns { total, breakdown }
 */
function scoreDestination(dest, prefs) {
    const { categories = [], season, budget, days } = prefs;
    const breakdown = {};
    let total = 0;

    // ── 1. Season match (+3) ─────────────────────────────────────────────
    const destSeason = dest.best_season || 'Year-round';
    if (destSeason === 'Year-round' || destSeason === season) {
        breakdown.season = 3;
    } else {
        // Check if dest category naturally fits the requested season
        const affinity = SEASON_AFFINITY[dest.category] || [];
        breakdown.season = affinity.includes(season) ? 1 : 0;
    }
    total += breakdown.season;

    // ── 2. Category match (+2 per match, max +4) ─────────────────────────
    const normCats = categories.map(normaliseCategory);
    const catMatches = normCats.filter(c => c === dest.category).length;
    breakdown.category = Math.min(catMatches * 2, 4);
    total += breakdown.category;

    // ── 3. Budget match (+2 exact, +1 adjacent) ──────────────────────────
    const userBudgetIdx = BUDGET_ORDER.indexOf(budget);
    const destBudgetIdx = BUDGET_ORDER.indexOf(dest.cost_level);
    if (userBudgetIdx === destBudgetIdx) {
        breakdown.budget = 2;
    } else if (Math.abs(userBudgetIdx - destBudgetIdx) === 1) {
        breakdown.budget = 1;
    } else {
        breakdown.budget = 0;
    }
    total += breakdown.budget;

    // ── 4. Rating weight (+1 scaled) ────────────────────────────────────
    const ratingScore = parseFloat(dest.rating || 4) / 5;
    breakdown.rating = parseFloat(ratingScore.toFixed(2));
    total += breakdown.rating;

    // ── 5. Days bonus (+0.5 if destination duration fits travel days) ────
    if (dest.recommended_duration && days) {
        const match = dest.recommended_duration.match(/(\d+)/g);
        if (match) {
            const minDays = parseInt(match[0]);
            const maxDays = parseInt(match[match.length - 1]);
            if (days >= minDays && days <= maxDays) {
                breakdown.days = 0.5;
                total += 0.5;
            } else {
                breakdown.days = 0;
            }
        }
    }

    // ── Normalise to 0–100 ───────────────────────────────────────────────
    const MAX_SCORE = 10.5; // 3 + 4 + 2 + 1 + 0.5
    const matchPercent = Math.min(Math.round((total / MAX_SCORE) * 100), 100);

    return { total: parseFloat(total.toFixed(2)), matchPercent, breakdown };
}

/**
 * Generate a human-readable reason string from breakdown.
 */
function buildReason(dest, prefs, breakdown) {
    const parts = [];
    if (breakdown.season >= 3) parts.push(`ideal for ${prefs.season} travel`);
    else if (breakdown.season === 1) parts.push(`reasonably good in ${prefs.season}`);
    if (breakdown.category > 0) parts.push(`matches your ${dest.category.toLowerCase()} preference`);
    if (breakdown.budget === 2) parts.push(`fits your ${prefs.budget} budget`);
    else if (breakdown.budget === 1) parts.push(`close to your budget range`);
    if (parseFloat(dest.rating) >= 4.8) parts.push(`exceptional rating of ${dest.rating}`);
    if (breakdown.days > 0) parts.push(`ideal for a ${prefs.days}-day trip`);

    return parts.length > 0
        ? parts.map((p, i) => i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p).join(', ') + '.'
        : `Solid all-round destination worth exploring.`;
}

/**
 * Main engine function.
 * @param {Array}  destinations  - all active destinations (from DB or seed)
 * @param {Object} prefs         - { categories, season, budget, days }
 * @param {number} topN          - how many results to return (default 5)
 * @returns {Array} sorted recommendation objects
 */
function computeRecommendations(destinations, prefs, topN = 5) {
    const scored = destinations
        .filter(d => d.is_active !== false)
        .map(dest => {
            const { total, matchPercent, breakdown } = scoreDestination(dest, prefs);
            return {
                destination: dest,
                score: total,
                matchPercent,
                breakdown,
                reason: buildReason(dest, prefs, breakdown),
            };
        })
        .sort((a, b) => b.score - a.score || b.destination.rating - a.destination.rating);

    return scored.slice(0, topN).map((r, i) => ({
        rank: i + 1,
        destination: r.destination,
        score: r.score,
        matchPercent: r.matchPercent,
        breakdown: r.breakdown,
        reason: r.reason,
    }));
}

module.exports = { computeRecommendations, scoreDestination };
