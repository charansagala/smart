import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useDestinations } from '@/hooks/useDestinations';
import { destinationsAPI } from '@/services/api';
import {
    IconSearch, IconMapPin, IconStar, IconHeart, IconPlus,
    IconEdit, IconTrash, IconBeach, IconMountain, IconBuildingSkyscraper,
    IconTrees, IconTemperature, IconLoader2, IconX, IconAdjustments,
    IconShieldCheck, IconArrowsSort, IconTrendingUp, IconCloud,
    IconTag, IconPhoto,
} from '@tabler/icons-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Beach', 'Mountain', 'City', 'Nature', 'Cultural', 'Adventure'];
const SEASONS = ['All', 'Spring', 'Summer', 'Autumn', 'Winter', 'Year-round'];
const COST_LEVELS = ['All', 'Budget', 'Mid-range', 'Luxury'];
const SORT_OPTIONS = [
    { value: 'rating', label: 'Top Rated' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'name', label: 'Name A–Z' },
];

const CATEGORY_ICONS = {
    Beach: IconBeach, Mountain: IconMountain, City: IconBuildingSkyscraper,
    Nature: IconTrees, Cultural: IconMapPin, Adventure: IconMountain,
};
const CATEGORY_COLORS = {
    Beach: { accent: 'stat-card-blue', dot: '#3b82f6', bg: 'from-blue-900/30 to-blue-950/10' },
    Mountain: { accent: 'stat-card-yellow', dot: '#eab308', bg: 'from-yellow-900/30 to-yellow-950/10' },
    City: { accent: 'stat-card-purple', dot: '#a855f7', bg: 'from-purple-900/30 to-purple-950/10' },
    Nature: { accent: 'stat-card-green', dot: '#22c55e', bg: 'from-green-900/30 to-green-950/10' },
    Cultural: { accent: 'stat-card-red', dot: '#ef4444', bg: 'from-red-900/30 to-red-950/10' },
    Adventure: { accent: 'stat-card-yellow', dot: '#f59e0b', bg: 'from-amber-900/30 to-amber-950/10' },
};
const DEFAULT_COLOR = { accent: 'stat-card-blue', dot: '#3b82f6', bg: 'from-blue-900/30 to-blue-950/10' };

const SEASON_COLORS = {
    Spring: 'text-green-400 bg-green-500/10 border-green-500/20',
    Summer: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    Autumn: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    Winter: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Year-round': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const COST_COLORS = {
    Budget: 'text-green-400',
    'Mid-range': 'text-yellow-400',
    Luxury: 'text-red-400',
};
const COST_ICONS = { Budget: '$', 'Mid-range': '$$', Luxury: '$$$' };

const EMPTY_FORM = {
    name: '', location: '', rating: '', popularity_score: '',
    best_season: 'Year-round', cost_level: 'Mid-range', category: 'Cultural',
    description: '', attributes: '', image_url: '',
};

// ─── DestinationForm ──────────────────────────────────────────────────────────
function DestinationForm({ initial = EMPTY_FORM, onSave, onCancel, saving }) {
    const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
    const [uploading, setUploading] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await destinationsAPI.uploadImage(formData);
            if (res?.imageUrl) {
                set('image_url', `http://localhost:5000${res.imageUrl}`);
            }
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            rating: parseFloat(form.rating) || 4.0,
            popularity_score: parseInt(form.popularity_score) || 0,
            attributes: typeof form.attributes === 'string'
                ? form.attributes.split(',').map(s => s.trim()).filter(Boolean)
                : form.attributes,
        };
        onSave(payload);
    };

    const attrStr = typeof form.attributes === 'string'
        ? form.attributes
        : (form.attributes || []).join(', ');

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <IconMapPin size={11} /> Name *
                    </label>
                    <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Bali" required />
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <IconMapPin size={11} /> Location *
                    </label>
                    <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Bali, Indonesia" required />
                </div>

                <div>
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <IconStar size={11} /> Rating
                    </label>
                    <Input type="number" step="0.1" min="0" max="5" value={form.rating}
                        onChange={e => set('rating', e.target.value)} placeholder="4.5" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <IconTrendingUp size={11} /> Popularity Score
                    </label>
                    <Input type="number" min="0" value={form.popularity_score}
                        onChange={e => set('popularity_score', e.target.value)} placeholder="5000" />
                </div>

                <div>
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <IconBuildingSkyscraper size={11} /> Category
                    </label>
                    <Select value={form.category} onValueChange={v => set('category', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <IconCloud size={11} /> Best Season
                    </label>
                    <Select value={form.best_season} onValueChange={v => set('best_season', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {SEASONS.filter(s => s !== 'All').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="col-span-2">
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <IconTag size={11} /> Cost Level
                    </label>
                    <div className="flex gap-2">
                        {COST_LEVELS.filter(c => c !== 'All').map(c => (
                            <button type="button" key={c} onClick={() => set('cost_level', c)}
                                className={`flex-1 py-1.5 rounded-[var(--radius)] border text-xs font-medium transition-all ${form.cost_level === c
                                    ? 'bg-[hsl(var(--primary))] border-transparent text-white'
                                    : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                                    }`}>
                                {COST_ICONS[c]} {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5">Description</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)}
                        rows={3} placeholder="Describe this destination..."
                        className="flex w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
                    />
                </div>

                <div className="col-span-2">
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <IconTag size={11} /> Attributes (comma-separated)
                    </label>
                    <Input value={attrStr} onChange={e => set('attributes', e.target.value)}
                        placeholder="e.g. Beach, UNESCO, Trekking, Food" />
                </div>

                <div className="col-span-2">
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <IconPhoto size={11} /> Image (URL or Upload)
                    </label>
                    <div className="flex gap-2 items-center">
                        <Input value={form.image_url} onChange={e => set('image_url', e.target.value)}
                            placeholder="https://example.com/image.jpg" className="flex-1" />
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">OR</span>
                        <div className="relative">
                            <Input type="file" onChange={handleUpload} className="w-56 cursor-pointer" accept="image/*" disabled={uploading} />
                            {uploading && <IconLoader2 className="absolute right-2 top-2 animate-spin text-[hsl(var(--primary))]" size={16} />}
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                    {saving ? <><IconLoader2 size={14} className="animate-spin" /> Saving…</> : 'Save Destination'}
                </Button>
            </DialogFooter>
        </form>
    );
}

// ─── DeleteConfirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ dest, onConfirm, onCancel, deleting }) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Are you sure you want to delete <span className="font-semibold text-[hsl(var(--foreground))]">{dest.name}</span>?
                This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 p-3 rounded-[var(--radius)] bg-red-500/10 border border-red-500/20">
                <IconMapPin size={16} className="text-red-400 shrink-0" />
                <div>
                    <p className="text-sm font-medium">{dest.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{dest.location}</p>
                </div>
            </div>
            <DialogFooter className="gap-2">
                <Button variant="outline" onClick={onCancel} disabled={deleting}>Cancel</Button>
                <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
                    {deleting ? <><IconLoader2 size={14} className="animate-spin" /> Deleting…</> : <><IconTrash size={14} /> Delete</>}
                </Button>
            </DialogFooter>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Destinations() {
    // Filters
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [season, setSeason] = useState('All');
    const [costLevel, setCostLevel] = useState('All');
    const [sort, setSort] = useState('rating');

    // UI
    const [adminMode, setAdminMode] = useState(false);
    const [liked, setLiked] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);  // destination object
    const [delTarget, setDelTarget] = useState(null);  // destination object
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Feedback
    const [toast, setToast] = useState(null);
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [expandedMapId, setExpandedMapId] = useState(null);

    const filters = useMemo(() => ({ search, category, season, cost_level: costLevel, sort }), [search, category, season, costLevel, sort]);
    const { destinations, loading, useLocal, create, update, remove } = useDestinations(filters);

    const toggleLike = (id) => setLiked(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    // ── Admin handlers
    const handleCreate = async (data) => {
        setSaving(true);
        const result = await create(data);
        setSaving(false);
        setAddOpen(false);
        if (result.success) showToast(`"${data.name}" added successfully!`);
        else showToast('Failed to create destination', 'error');
    };

    const handleUpdate = async (data) => {
        setSaving(true);
        const result = await update(editTarget.id, data);
        setSaving(false);
        setEditTarget(null);
        if (result.success) showToast(`"${data.name}" updated successfully!`);
        else showToast('Failed to update destination', 'error');
    };

    const handleDelete = async () => {
        setDeleting(true);
        const result = await remove(delTarget.id);
        setDeleting(false);
        const name = delTarget.name;
        setDelTarget(null);
        if (result.success) showToast(`"${name}" deleted`);
        else showToast('Failed to delete destination', 'error');
    };

    const activeFilters = [category, season, costLevel].filter(f => f !== 'All').length;

    return (
        <div className="flex flex-col min-h-screen relative">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius)] border text-sm font-medium shadow-xl animate-fade-in-up ${toast.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-green-500/10 border-green-500/30 text-green-400'
                    }`}>
                    {toast.type === 'error' ? <IconX size={14} /> : <IconShieldCheck size={14} />}
                    {toast.msg}
                </div>
            )}

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="px-8 pt-8 pb-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.3)]">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-2xl font-bold font-mono">Destination Database</h1>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                            {loading ? 'Loading…' : `${destinations.length} destinations`}
                            {useLocal && <span className="ml-2 text-[10px] text-yellow-400 border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 rounded">Offline Mode</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Admin toggle */}
                        <button
                            onClick={() => setAdminMode(a => !a)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] border text-xs font-medium transition-all ${adminMode
                                ? 'bg-[hsl(var(--primary)/0.15)] border-[hsl(var(--primary)/0.5)] text-[hsl(var(--primary))]'
                                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                                }`}
                        >
                            <IconShieldCheck size={13} />
                            {adminMode ? 'Admin ON' : 'Admin'}
                        </button>
                        {adminMode && (
                            <Button size="sm" onClick={() => setAddOpen(true)}>
                                <IconPlus size={15} /> Add Destination
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search row */}
                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                        <Input
                            placeholder="Search by name, location, description…"
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                                <IconX size={14} />
                            </button>
                        )}
                    </div>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-40">
                            <IconArrowsSort size={13} className="mr-1 text-[hsl(var(--muted-foreground))]" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <button
                        onClick={() => setShowFilters(f => !f)}
                        className={`flex items-center gap-1.5 px-3 rounded-[var(--radius)] border text-xs font-medium transition-all relative ${showFilters || activeFilters > 0
                            ? 'bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.4)] text-[hsl(var(--primary))]'
                            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                            }`}
                    >
                        <IconAdjustments size={14} /> Filters
                        {activeFilters > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[hsl(var(--primary))] text-white text-[9px] flex items-center justify-center font-bold">
                                {activeFilters}
                            </span>
                        )}
                    </button>
                </div>

                {/* Category pills */}
                <div className="flex gap-2 flex-wrap mb-3">
                    {CATEGORIES.map(cat => {
                        const CatIcon = CATEGORY_ICONS[cat];
                        return (
                            <button key={cat} onClick={() => setCategory(cat)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${category === cat
                                    ? 'bg-[hsl(var(--primary))] text-white border-transparent shadow shadow-red-500/30'
                                    : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                                    }`}
                            >
                                {CatIcon && <CatIcon size={11} />} {cat}
                            </button>
                        );
                    })}
                </div>

                {/* Expandable filters */}
                {showFilters && (
                    <div className="flex gap-3 flex-wrap pt-3 border-t border-[hsl(var(--border))] animate-fade-in-up">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium whitespace-nowrap">Season:</span>
                            <div className="flex gap-1.5">
                                {SEASONS.map(s => (
                                    <button key={s} onClick={() => setSeason(s)}
                                        className={`px-2.5 py-1 rounded-full text-xs border transition-all ${season === s
                                            ? 'bg-[hsl(var(--primary))] text-white border-transparent'
                                            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                                            }`}>{s}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">Cost:</span>
                            <div className="flex gap-1.5">
                                {COST_LEVELS.map(c => (
                                    <button key={c} onClick={() => setCostLevel(c)}
                                        className={`px-2.5 py-1 rounded-full text-xs border transition-all ${costLevel === c
                                            ? 'bg-[hsl(var(--primary))] text-white border-transparent'
                                            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                                            }`}>{c === 'All' ? c : `${COST_ICONS[c]} ${c}`}</button>
                                ))}
                            </div>
                        </div>
                        {activeFilters > 0 && (
                            <button onClick={() => { setCategory('All'); setSeason('All'); setCostLevel('All'); }}
                                className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                                <IconX size={11} /> Clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Cards grid ─────────────────────────────────────────────────── */}
            <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading && Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="card-glow animate-pulse">
                        <div className="h-28 rounded-t-[var(--radius)] bg-[hsl(var(--muted))]" />
                        <CardContent className="p-4 space-y-2">
                            <div className="h-4 bg-[hsl(var(--muted))] rounded w-3/4" />
                            <div className="h-3 bg-[hsl(var(--muted))] rounded w-1/2" />
                            <div className="h-10 bg-[hsl(var(--muted))] rounded" />
                        </CardContent>
                    </Card>
                ))}

                {!loading && destinations.map((dest, i) => {
                    const colors = CATEGORY_COLORS[dest.category] || DEFAULT_COLOR;
                    const CatIcon = CATEGORY_ICONS[dest.category] || IconMapPin;
                    const attrs = Array.isArray(dest.attributes) ? dest.attributes : [];

                    return (
                        <Card key={dest.id} className={`card-glow ${colors.accent} animate-fade-in-up animate-delay-${(i % 4) + 1} flex flex-col group`}>
                            {/* Banner */}
                            <div className={`h-32 rounded-t-[var(--radius)] bg-gradient-to-br ${colors.bg} flex items-center justify-center relative overflow-hidden`}>
                                <div className="absolute inset-0">
                                    <div className="absolute top-3 left-4 w-24 h-24 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: colors.dot }} />
                                    <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full opacity-10 blur-xl" style={{ backgroundColor: colors.dot }} />
                                </div>

                                {dest.image_url ? (
                                    <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover absolute inset-0 rounded-t-[var(--radius)] opacity-60" />
                                ) : (
                                    <CatIcon size={40} stroke={1.2} style={{ color: colors.dot }} className="opacity-50 relative z-10" />
                                )}

                                {/* Season badge */}
                                <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${SEASON_COLORS[dest.best_season] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>
                                    {dest.best_season}
                                </div>

                                {/* Like */}
                                <button onClick={() => toggleLike(dest.id)}
                                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors z-10">
                                    <IconHeart size={13} className={liked.has(dest.id) ? 'text-red-500 fill-red-500' : 'text-white/80'} />
                                </button>

                                {/* Admin buttons (overlay on hover) */}
                                {adminMode && (
                                    <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={() => setEditTarget(dest)}
                                            className="w-7 h-7 rounded bg-blue-500/80 hover:bg-blue-500 flex items-center justify-center transition-colors">
                                            <IconEdit size={13} className="text-white" />
                                        </button>
                                        <button onClick={() => setDelTarget(dest)}
                                            className="w-7 h-7 rounded bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors">
                                            <IconTrash size={13} className="text-white" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <CardContent className="p-4 flex-1 flex flex-col">
                                {/* Name + rating */}
                                <div className="flex items-start justify-between mb-1.5">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="font-semibold text-sm leading-snug">{dest.name}</p>
                                        <p className="text-[11px] text-[hsl(var(--muted-foreground))] flex items-center gap-1 mt-0.5">
                                            <IconMapPin size={10} />{dest.location}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <IconStar size={12} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-bold font-mono">{Number(dest.rating).toFixed(1)}</span>
                                    </div>
                                </div>

                                {/* Badges row */}
                                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                    <Badge variant="secondary" className="text-[10px] py-0 font-medium">{dest.category}</Badge>
                                    <span className={`text-[11px] font-bold ${COST_COLORS[dest.cost_level]}`}>
                                        {COST_ICONS[dest.cost_level]}
                                    </span>
                                    {dest.popularity_score > 0 && (
                                        <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                                            <IconTrendingUp size={10} className="text-green-400" />
                                            {dest.popularity_score.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {dest.description && (
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-3 flex-1 line-clamp-2">
                                        {dest.description}
                                    </p>
                                )}

                                {/* Attribute tags */}
                                {attrs.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap mb-3">
                                        {attrs.slice(0, 4).map(attr => (
                                            <Badge key={attr} variant="outline" className="text-[10px] py-0">{attr}</Badge>
                                        ))}
                                        {attrs.length > 4 && (
                                            <Badge variant="outline" className="text-[10px] py-0 text-[hsl(var(--muted-foreground))]">
                                                +{attrs.length - 4}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2 mt-auto">
                                    <Button
                                        size="sm"
                                        className="flex-1 text-xs h-8 bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.25)] border border-[hsl(var(--primary)/0.3)] transition-colors"
                                        onClick={() => setExpandedMapId(expandedMapId === dest.id ? null : dest.id)}
                                    >
                                        <IconMapPin size={13} className="mr-1.5" />
                                        {expandedMapId === dest.id ? 'Hide Maps' : 'View map'}
                                    </Button>
                                    {adminMode && (
                                        <Button size="sm" variant="outline" className="h-8 px-2.5" onClick={() => setEditTarget(dest)}>
                                            <IconEdit size={13} />
                                        </Button>
                                    )}
                                </div>

                                {/* Expanded Google Maps Iframe */}
                                {expandedMapId === dest.id && (
                                    <div className="mt-3 w-full h-40 rounded-md overflow-hidden animate-fade-in-up shadow-inner border border-[hsl(var(--border))]">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(dest.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                        ></iframe>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                {!loading && destinations.length === 0 && (
                    <div className="col-span-full text-center py-20 text-[hsl(var(--muted-foreground))]">
                        <IconSearch size={44} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium mb-1">No destinations found</p>
                        <p className="text-xs">Try adjusting your search or filters</p>
                        {adminMode && (
                            <Button className="mt-4" onClick={() => setAddOpen(true)}>
                                <IconPlus size={14} /> Add Destination
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Add Dialog ─────────────────────────────────────────────────── */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Destination</DialogTitle>
                        <DialogDescription>Fill in the details to add a new destination to the database.</DialogDescription>
                    </DialogHeader>
                    <DestinationForm onSave={handleCreate} onCancel={() => setAddOpen(false)} saving={saving} />
                </DialogContent>
            </Dialog>

            {/* ── Edit Dialog ────────────────────────────────────────────────── */}
            <Dialog open={!!editTarget} onOpenChange={open => !open && setEditTarget(null)}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Destination</DialogTitle>
                        <DialogDescription>Update the details for <strong>{editTarget?.name}</strong>.</DialogDescription>
                    </DialogHeader>
                    {editTarget && (
                        <DestinationForm
                            initial={{
                                ...editTarget,
                                attributes: Array.isArray(editTarget.attributes) ? editTarget.attributes.join(', ') : (editTarget.attributes || ''),
                            }}
                            onSave={handleUpdate}
                            onCancel={() => setEditTarget(null)}
                            saving={saving}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ──────────────────────────────────────────────── */}
            <Dialog open={!!delTarget} onOpenChange={open => !open && setDelTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Delete Destination</DialogTitle>
                        <DialogDescription>This will permanently remove the destination.</DialogDescription>
                    </DialogHeader>
                    {delTarget && (
                        <DeleteConfirm
                            dest={delTarget}
                            onConfirm={handleDelete}
                            onCancel={() => setDelTarget(null)}
                            deleting={deleting}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
