import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { recommendationsAPI } from '@/services/api';
import {
    IconSparkles, IconMapPin, IconStar, IconLoader2, IconTrophy,
    IconBeach, IconMountain, IconBuildingSkyscraper, IconTrees,
    IconTemperature, IconCalendar, IconWallet, IconClock, IconRoute,
    IconCheck, IconChevronDown, IconChevronUp, IconX, IconInfoCircle,
    IconBulb, IconArrowRight, IconAward,
} from '@tabler/icons-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
    { id: 'beach', label: 'Beach', icon: IconBeach, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/25' },
    { id: 'mountains', label: 'Mountains', icon: IconMountain, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/25' },
    { id: 'heritage', label: 'Heritage', icon: IconBuildingSkyscraper, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' },
    { id: 'nature', label: 'Nature', icon: IconTrees, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/25' },
    { id: 'city', label: 'City', icon: IconBuildingSkyscraper, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/25' },
    { id: 'adventure', label: 'Adventure', icon: IconMountain, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/25' },
];

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'Year-round'];
const BUDGETS = ['Budget', 'Mid-range', 'Luxury'];
const DAY_PRESETS = [
    { label: 'Weekend', days: 3 },
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
    { label: '1 Month', days: 30 },
];

const BUDGET_ICONS = { Budget: '$', 'Mid-range': '$$', Luxury: '$$$' };
const SEASON_COLORS = {
    Spring: 'text-green-400 bg-green-500/10 border-green-500/20',
    Summer: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    Autumn: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    Winter: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Year-round': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};
const COST_COLORS = { Budget: 'text-green-400', 'Mid-range': 'text-yellow-400', Luxury: 'text-red-400' };

const RANK_STYLES = [
    { border: 'border-yellow-500/40', glow: 'shadow-yellow-500/20', medal: 'text-yellow-400', label: 'Best Match' },
    { border: 'border-slate-400/40', glow: 'shadow-slate-400/20', medal: 'text-slate-400', label: '2nd Place' },
    { border: 'border-amber-600/40', glow: 'shadow-amber-600/20', medal: 'text-amber-600', label: '3rd Place' },
    { border: 'border-[hsl(var(--border))]', glow: '', medal: 'text-[hsl(var(--muted-foreground))]', label: '4th' },
    { border: 'border-[hsl(var(--border))]', glow: '', medal: 'text-[hsl(var(--muted-foreground))]', label: '5th' },
];

const CATEGORY_ICON_MAP = {
    Beach: IconBeach, Mountain: IconMountain, City: IconBuildingSkyscraper,
    Nature: IconTrees, Cultural: IconBuildingSkyscraper, Adventure: IconMountain,
};

// ── Score breakdown bar ───────────────────────────────────────────────────────
function BreakdownBar({ label, value, max, color = 'bg-[hsl(var(--primary))]' }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-16 text-[hsl(var(--muted-foreground))] shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-6 text-right font-mono font-semibold text-[hsl(var(--foreground))]">{value}</span>
        </div>
    );
}

// ── Animated rank badge ───────────────────────────────────────────────────────
function RankBadge({ rank }) {
    if (rank === 1) return (
        <div className="flex items-center gap-1 bg-yellow-500/15 border border-yellow-500/30 rounded-full px-2.5 py-1">
            <IconTrophy size={13} className="text-yellow-400" />
            <span className="text-[11px] font-bold text-yellow-400">Best Match</span>
        </div>
    );
    if (rank === 2) return (
        <div className="flex items-center gap-1 bg-slate-500/15 border border-slate-400/30 rounded-full px-2.5 py-1">
            <IconAward size={13} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-400">#2 Pick</span>
        </div>
    );
    if (rank === 3) return (
        <div className="flex items-center gap-1 bg-amber-600/15 border border-amber-600/30 rounded-full px-2.5 py-1">
            <IconAward size={13} className="text-amber-600" />
            <span className="text-[11px] font-bold text-amber-600">#3 Pick</span>
        </div>
    );
    return (
        <div className="flex items-center gap-1 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-full px-2.5 py-1">
            <span className="text-[11px] font-mono text-[hsl(var(--muted-foreground))]">#{rank}</span>
        </div>
    );
}

// ── Recommendation Card ────────────────────────────────────────────────────────
function RecommendationCard({ rec, delay }) {
    const [expanded, setExpanded] = useState(false);
    const rs = RANK_STYLES[rec.rank - 1] || RANK_STYLES[4];
    const CatIcon = CATEGORY_ICON_MAP[rec.category] || IconMapPin;
    const attrs = Array.isArray(rec.attributes) ? rec.attributes : [];

    // Score colour
    const scoreColor =
        rec.matchPercent >= 80 ? 'text-green-400' :
            rec.matchPercent >= 60 ? 'text-yellow-400' : 'text-red-400';

    const progressColor =
        rec.matchPercent >= 80 ? 'bg-green-400' :
            rec.matchPercent >= 60 ? 'bg-yellow-400' : 'bg-red-400';

    return (
        <div
            className={`animate-fade-in-up animate-delay-${delay} rounded-[var(--radius)] border ${rs.border} bg-[hsl(var(--card))] shadow-lg ${rs.glow ? `shadow-lg ${rs.glow}` : ''} overflow-hidden transition-all duration-200`}
            style={{ animationDelay: `${(rec.rank - 1) * 80}ms` }}
        >
            {/* Top colour stripe */}
            <div className={`h-1 ${rec.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                    rec.rank === 2 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                        rec.rank === 3 ? 'bg-gradient-to-r from-amber-600 to-yellow-700' :
                            'bg-[hsl(var(--border))]'
                }`} />

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                        <CatIcon size={22} stroke={1.5} className={rs.medal} />
                    </div>

                    {/* Name + location */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h3 className="font-bold text-base leading-tight">{rec.name}</h3>
                            <RankBadge rank={rec.rank} />
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                            <IconMapPin size={11} />{rec.location}
                        </p>
                    </div>

                    {/* Match % */}
                    <div className="text-right shrink-0">
                        <div className={`text-2xl font-bold font-mono ${scoreColor}`}>{rec.matchPercent}%</div>
                        <div className="text-[10px] text-[hsl(var(--muted-foreground))]">match score</div>
                    </div>
                </div>

                {/* Match progress bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-[hsl(var(--muted-foreground))]">Compatibility</span>
                        <span className={`font-mono font-semibold ${scoreColor}`}>{rec.matchPercent}/100</span>
                    </div>
                    <div className="relative h-2.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                        <div
                            className={`h-full ${progressColor} rounded-full transition-all duration-700`}
                            style={{ width: `${rec.matchPercent}%`, transitionDelay: `${(rec.rank - 1) * 120 + 300}ms` }}
                        />
                    </div>
                </div>

                {/* Meta badges */}
                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1 text-yellow-400">
                        <IconStar size={12} className="fill-yellow-400" />
                        <span className="font-bold font-mono">{Number(rec.rating).toFixed(1)}</span>
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${COST_COLORS[rec.cost_level]}`}>
                        <IconWallet size={12} />
                        <span>{BUDGET_ICONS[rec.cost_level]} {rec.cost_level}</span>
                    </div>
                    <div className={`flex items-center gap-1 border rounded-full px-2 py-0.5 ${SEASON_COLORS[rec.best_season]}`}>
                        <IconCalendar size={10} />
                        <span className="text-[10px] font-medium">{rec.best_season}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] py-0">{rec.category}</Badge>
                </div>

                {/* AI reason */}
                <div className="flex items-start gap-2 mb-4 p-3 rounded-[var(--radius)] bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))]">
                    <IconBulb size={14} className="text-[hsl(var(--primary))] mt-0.5 shrink-0" />
                    <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed italic">{rec.reason}</p>
                </div>

                {/* Attribute tags */}
                {attrs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {attrs.slice(0, 5).map(attr => (
                            <Badge key={attr} variant="outline" className="text-[10px] py-0">{attr}</Badge>
                        ))}
                        {attrs.length > 5 && (
                            <Badge variant="outline" className="text-[10px] py-0 text-[hsl(var(--muted-foreground))]">+{attrs.length - 5}</Badge>
                        )}
                    </div>
                )}

                {/* Expandable breakdown */}
                <button
                    onClick={() => setExpanded(e => !e)}
                    className="w-full flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors py-2 border-t border-[hsl(var(--border))] pt-3"
                >
                    <span className="flex items-center gap-1.5"><IconInfoCircle size={12} /> Score breakdown</span>
                    {expanded ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
                </button>

                {expanded && (
                    <div className="pt-3 space-y-2 animate-fade-in-up">
                        <BreakdownBar label="Season" value={rec.breakdown?.season ?? 0} max={3} color="bg-blue-400" />
                        <BreakdownBar label="Category" value={rec.breakdown?.category ?? 0} max={4} color="bg-purple-400" />
                        <BreakdownBar label="Budget" value={rec.breakdown?.budget ?? 0} max={2} color="bg-green-400" />
                        <BreakdownBar label="Rating" value={parseFloat(rec.breakdown?.rating ?? 0).toFixed(1)} max={1} color="bg-yellow-400" />
                        {rec.breakdown?.days != null && (
                            <BreakdownBar label="Days" value={rec.breakdown?.days ?? 0} max={0.5} color="bg-red-400" />
                        )}
                        <div className="pt-1 border-t border-[hsl(var(--border))] flex justify-between text-xs">
                            <span className="text-[hsl(var(--muted-foreground))]">Total score</span>
                            <span className="font-mono font-bold">{rec.score} pts</span>
                        </div>
                    </div>
                )}

                {/* CTA */}
                <Button size="sm" className="w-full mt-3">
                    <IconRoute size={14} /> Plan this Trip <IconArrowRight size={13} />
                </Button>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Recommendations() {
    const [selectedCats, setSelectedCats] = useState([]);
    const [season, setSeason] = useState('');
    const [budget, setBudget] = useState('');
    const [days, setDays] = useState('');
    const [customDays, setCustomDays] = useState('');

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const resultsRef = useRef(null);

    const toggleCat = (id) => {
        setSelectedCats(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const isValid = selectedCats.length > 0 && season && budget && (days || customDays);

    // Client-side fallback scoring (when server is offline)
    const localScore = (prefs) => {
        const SEED = [
            { id: 1, name: 'Bali', location: 'Bali, Indonesia', rating: 4.9, popularity_score: 12400, best_season: 'Summer', cost_level: 'Mid-range', category: 'Beach', description: 'Tropical paradise with rich Hindu culture.', attributes: ['Beach', 'Cultural', 'Wellness', 'Surfing', 'Temples'], recommended_duration: '5-7 days', is_active: true },
            { id: 2, name: 'Kyoto', location: 'Kyoto, Japan', rating: 4.8, popularity_score: 10100, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: 'Ancient capital filled with classical temples.', attributes: ['Heritage', 'Temples', 'Gardens', 'Food', 'UNESCO'], recommended_duration: '4-6 days', is_active: true },
            { id: 3, name: 'Swiss Alps', location: 'Interlaken, Switzerland', rating: 4.9, popularity_score: 9700, best_season: 'Winter', cost_level: 'Luxury', category: 'Mountain', description: 'Breathtaking alpine scenery.', attributes: ['Skiing', 'Hiking', 'Scenic', 'Snow Sports', 'Luxury'], recommended_duration: '7-10 days', is_active: true },
            { id: 4, name: 'Santorini', location: 'Santorini, Greece', rating: 4.8, popularity_score: 9200, best_season: 'Summer', cost_level: 'Luxury', category: 'Beach', description: 'Iconic white-washed buildings over the Aegean.', attributes: ['Scenic', 'Romance', 'Luxury', 'Sunsets', 'Wine'], recommended_duration: '4-5 days', is_active: true },
            { id: 5, name: 'Patagonia', location: 'Patagonia, Argentina', rating: 4.7, popularity_score: 7200, best_season: 'Summer', cost_level: 'Mid-range', category: 'Adventure', description: 'Remote wilderness with glaciers and condors.', attributes: ['Trekking', 'Wildlife', 'Glaciers', 'Adventure', 'Camping'], recommended_duration: '10-14 days', is_active: true },
            { id: 6, name: 'Tokyo', location: 'Tokyo, Japan', rating: 4.8, popularity_score: 15000, best_season: 'Spring', cost_level: 'Mid-range', category: 'City', description: 'Ultramodern megacity meets traditional culture.', attributes: ['City', 'Tech', 'Food', 'Shopping'], recommended_duration: '5-8 days', is_active: true },
            { id: 7, name: 'Amazon Rainforest', location: 'Manaus, Brazil', rating: 4.6, popularity_score: 5800, best_season: 'Autumn', cost_level: 'Budget', category: 'Nature', description: "Earth's largest tropical rainforest.", attributes: ['Wildlife', 'Eco', 'Biodiversity'], recommended_duration: '7-12 days', is_active: true },
            { id: 8, name: 'Machu Picchu', location: 'Cusco Region, Peru', rating: 4.9, popularity_score: 11000, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: 'Mystical Incan citadel in the Andes.', attributes: ['Historical', 'Inca', 'Trekking', 'UNESCO'], recommended_duration: '3-5 days', is_active: true },
            { id: 9, name: 'Maldives', location: 'Malé, Maldives', rating: 4.9, popularity_score: 8900, best_season: 'Winter', cost_level: 'Luxury', category: 'Beach', description: 'Crystal-clear lagoons and overwater villas.', attributes: ['Beach', 'Luxury', 'Snorkeling', 'Romance'], recommended_duration: '5-7 days', is_active: true },
            { id: 10, name: 'Serengeti', location: 'Serengeti, Tanzania', rating: 4.8, popularity_score: 7600, best_season: 'Summer', cost_level: 'Luxury', category: 'Nature', description: 'The Great Migration — wildlife spectacle.', attributes: ['Safari', 'Wildlife', 'Big Five'], recommended_duration: '7-10 days', is_active: true },
            { id: 11, name: 'Petra', location: "Ma'an, Jordan", rating: 4.8, popularity_score: 6900, best_season: 'Spring', cost_level: 'Mid-range', category: 'Cultural', description: 'Rock-cut Nabataean city — UNESCO World Heritage.', attributes: ['Heritage', 'UNESCO', 'Historical', 'Desert'], recommended_duration: '2-3 days', is_active: true },
            { id: 12, name: 'Norwegian Fjords', location: 'Flåm, Norway', rating: 4.8, popularity_score: 8100, best_season: 'Summer', cost_level: 'Luxury', category: 'Nature', description: 'Dramatic fjords cutting through Norwegian mountains.', attributes: ['Scenic', 'Hiking', 'Cruising', 'Northern Lights'], recommended_duration: '7-10 days', is_active: true },
        ];
        const CAT_MAP = { beach: 'Beach', mountains: 'Mountain', mountain: 'Mountain', heritage: 'Cultural', cultural: 'Cultural', city: 'City', nature: 'Nature', adventure: 'Adventure' };
        const BUDGET_ORDER = ['Budget', 'Mid-range', 'Luxury'];
        const normCats = prefs.categories.map(c => CAT_MAP[c.toLowerCase()] || c);

        const scored = SEED.map(dest => {
            let total = 0, breakdown = {};
            // season
            breakdown.season = (dest.best_season === 'Year-round' || dest.best_season === prefs.season) ? 3 : 0;
            total += breakdown.season;
            // category
            breakdown.category = Math.min(normCats.filter(c => c === dest.category).length * 2, 4);
            total += breakdown.category;
            // budget
            const bi = BUDGET_ORDER.indexOf(prefs.budget), di = BUDGET_ORDER.indexOf(dest.cost_level);
            breakdown.budget = bi === di ? 2 : Math.abs(bi - di) === 1 ? 1 : 0;
            total += breakdown.budget;
            // rating
            breakdown.rating = parseFloat((dest.rating / 5).toFixed(2));
            total += breakdown.rating;

            const matchPercent = Math.min(Math.round((total / 10.5) * 100), 100);
            const reasons = [];
            if (breakdown.season >= 3) reasons.push(`ideal for ${prefs.season} travel`);
            if (breakdown.category > 0) reasons.push(`matches your ${dest.category.toLowerCase()} preference`);
            if (breakdown.budget === 2) reasons.push(`fits your ${prefs.budget} budget`);
            if (parseFloat(dest.rating) >= 4.8) reasons.push(`exceptional rating of ${dest.rating}`);
            const reason = reasons.length ? reasons.map((r, i) => i === 0 ? r.charAt(0).toUpperCase() + r.slice(1) : r).join(', ') + '.' : 'Great all-round destination.';

            return { ...dest, score: parseFloat(total.toFixed(2)), matchPercent, breakdown, reason };
        }).sort((a, b) => b.score - a.score || b.rating - a.rating).slice(0, 5);

        return scored.map((d, i) => ({ ...d, rank: i + 1 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResults(null);
        setSubmitted(true);

        const numDays = parseInt(customDays || days);
        const prefs = { categories: selectedCats, season, budget, days: numDays };

        try {
            const res = await recommendationsAPI.get(prefs);
            setResults(res.recommendations);
        } catch {
            // Offline fallback
            setResults(localScore(prefs));
        } finally {
            setLoading(false);
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    };

    const handleReset = () => {
        setSelectedCats([]); setSeason(''); setBudget(''); setDays(''); setCustomDays('');
        setResults(null); setSubmitted(false);
    };

    return (
        <div className="flex min-h-screen">
            {/* ── Left: Preference Form ─────────────────────────────────────── */}
            <div className="w-80 border-r border-[hsl(var(--border))] flex flex-col bg-[hsl(var(--card)/0.4)] overflow-y-auto">
                {/* Header */}
                <div className="px-6 pt-7 pb-5 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-[hsl(var(--primary)/0.2)] border border-[hsl(var(--primary)/0.4)] flex items-center justify-center">
                            <IconSparkles size={14} className="text-[hsl(var(--primary))]" />
                        </div>
                        <h1 className="text-base font-bold font-mono">AI Preferences</h1>
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Tell us what you're looking for and we'll find the best matches.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 px-5 py-5 gap-5">

                    {/* ─ Categories ─ */}
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2.5">
                            Preferred Categories *
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORY_OPTIONS.map(cat => {
                                const active = selectedCats.includes(cat.id);
                                return (
                                    <button type="button" key={cat.id} onClick={() => toggleCat(cat.id)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius)] border text-xs font-medium transition-all ${active
                                                ? `${cat.bg} ${cat.color} border-current`
                                                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                                            }`}
                                    >
                                        <cat.icon size={14} stroke={1.8} />
                                        {cat.label}
                                        {active && <IconCheck size={11} className="ml-auto shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedCats.length > 0 && (
                            <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1.5 flex items-center gap-1">
                                <IconCheck size={10} className="text-green-400" />
                                {selectedCats.length} selected
                            </p>
                        )}
                    </div>

                    {/* ─ Travel Season ─ */}
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2.5 flex items-center gap-1">
                            <IconCalendar size={11} /> Travel Season *
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {SEASONS.map(s => (
                                <button type="button" key={s} onClick={() => setSeason(s)}
                                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${season === s
                                            ? 'bg-[hsl(var(--primary))] text-white border-transparent'
                                            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                                        }`}>{s}</button>
                            ))}
                        </div>
                    </div>

                    {/* ─ Budget ─ */}
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2.5 flex items-center gap-1">
                            <IconWallet size={11} /> Budget Level *
                        </div>
                        <div className="flex flex-col gap-2">
                            {BUDGETS.map(b => (
                                <button type="button" key={b} onClick={() => setBudget(b)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] border text-sm font-medium transition-all ${budget === b
                                            ? 'bg-[hsl(var(--primary)/0.12)] border-[hsl(var(--primary)/0.5)] text-[hsl(var(--primary))]'
                                            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                                        }`}
                                >
                                    <span className={`font-bold font-mono text-sm ${COST_COLORS[b]}`}>{BUDGET_ICONS[b]}</span>
                                    <span>{b}</span>
                                    {budget === b && <IconCheck size={14} className="ml-auto text-[hsl(var(--primary))]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─ Travel Days ─ */}
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2.5 flex items-center gap-1">
                            <IconClock size={11} /> Number of Days *
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                            {DAY_PRESETS.map(p => (
                                <button type="button" key={p.label}
                                    onClick={() => { setDays(String(p.days)); setCustomDays(''); }}
                                    className={`py-2 rounded-[var(--radius)] border text-xs font-medium transition-all ${days === String(p.days) && !customDays
                                            ? 'bg-[hsl(var(--primary))] text-white border-transparent'
                                            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                                        }`}>
                                    {p.label}
                                    <span className="block text-[10px] font-normal opacity-70">{p.days} days</span>
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <input
                                type="number" min="1" max="365" placeholder="Custom days…"
                                value={customDays}
                                onChange={e => { setCustomDays(e.target.value); setDays(''); }}
                                className="flex h-9 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-1 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                            />
                            {customDays && (
                                <button type="button" onClick={() => setCustomDays('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                                    <IconX size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ─ Actions ─ */}
                    <div className="mt-auto pt-4 border-t border-[hsl(var(--border))] flex flex-col gap-2">
                        <Button type="submit" disabled={!isValid || loading} className="w-full shadow-lg shadow-red-500/20">
                            {loading
                                ? <><IconLoader2 size={15} className="animate-spin" /> Calculating…</>
                                : <><IconSparkles size={15} /> Get Recommendations</>
                            }
                        </Button>
                        {submitted && (
                            <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="w-full text-xs">
                                <IconX size={13} /> Reset
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* ── Right: Results ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-8">
                {/* Default state */}
                {!submitted && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] flex items-center justify-center mb-5">
                            <IconSparkles size={36} stroke={1.2} className="text-[hsl(var(--primary))] opacity-70" />
                        </div>
                        <h2 className="text-xl font-bold font-mono mb-2">AI-Powered Matching</h2>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm leading-relaxed mb-6">
                            Fill in your travel preferences on the left and our scoring engine will find your perfect destinations — ranked by compatibility.
                        </p>
                        <div className="grid grid-cols-2 gap-3 max-w-sm text-left">
                            {[
                                { icon: IconCalendar, label: 'Season match', pts: '+3 pts', color: 'text-blue-400' },
                                { icon: IconMapPin, label: 'Category match', pts: '+2 pts', color: 'text-purple-400' },
                                { icon: IconWallet, label: 'Budget match', pts: '+2 pts', color: 'text-green-400' },
                                { icon: IconStar, label: 'Rating weight', pts: '+1 pt', color: 'text-yellow-400' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2.5 p-3 rounded-[var(--radius)] bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                                    <item.icon size={16} className={item.color} />
                                    <div>
                                        <p className="text-xs font-medium">{item.label}</p>
                                        <p className={`text-[11px] font-mono font-bold ${item.color}`}>{item.pts}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <IconLoader2 size={20} className="text-[hsl(var(--primary))] animate-spin" />
                            <div>
                                <p className="font-semibold font-mono">Calculating your matches…</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">Scoring {12} destinations against your preferences</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-44 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Results */}
                {!loading && results && (
                    <div ref={resultsRef}>
                        {/* Results header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold font-mono">Your Top Matches</h2>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                                    {results.length} destinations ranked for your{' '}
                                    <span className="text-[hsl(var(--foreground))] font-medium">{season}</span>,{' '}
                                    <span className="text-[hsl(var(--foreground))] font-medium">{budget}</span> trip
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {selectedCats.map(c => {
                                    const cat = CATEGORY_OPTIONS.find(o => o.id === c);
                                    return cat ? (
                                        <Badge key={c} variant="outline" className={`text-[10px] ${cat.color}`}>
                                            {cat.label}
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        </div>

                        {/* Animated ranking list */}
                        <div className="space-y-4">
                            {results.map((rec, i) => (
                                <RecommendationCard key={rec.id || i} rec={rec} delay={(i % 4) + 1} />
                            ))}
                        </div>

                        {results.length === 0 && (
                            <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">
                                <IconX size={44} className="mx-auto mb-3 opacity-20" />
                                <p className="font-medium">No matches found</p>
                                <p className="text-sm">Try adjusting your preferences</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
