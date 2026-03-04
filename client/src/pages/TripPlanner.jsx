import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { plannerAPI, destinationsAPI } from '@/services/api';
import {
    IconRoute, IconCalendar, IconMapPin, IconClock, IconWallet, IconCheck,
    IconBed, IconToolsKitchen2, IconCamera, IconCar, IconPlus, IconTrash,
    IconSparkles, IconLoader2, IconX, IconInfoCircle,
} from '@tabler/icons-react';

const TYPE_ICONS = { Stay: IconBed, Dining: IconToolsKitchen2, Sightseeing: IconCamera, Transport: IconCar };
const TYPE_COLORS = { Stay: 'text-blue-400', Dining: 'text-orange-400', Sightseeing: 'text-purple-400', Transport: 'text-green-400' };
const BUDGETS = ['Budget', 'Mid-range', 'Luxury'];

export default function TripPlanner() {
    const [destinations, setDestinations] = useState([]);
    const [selectedDests, setSelectedDests] = useState([]);
    const [days, setDays] = useState('3');
    const [budget, setBudget] = useState('Mid-range');
    const [tripName, setTripName] = useState('My AI Planned Trip');

    const [itinerary, setItinerary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeDayIdx, setActiveDayIdx] = useState(0);

    // Load destinations once to supply the multiselect
    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const res = await destinationsAPI.getAll({});
                setDestinations(res.data);
            } catch (err) {
                setDestinations([
                    { id: 1, name: 'Bali', location: 'Indonesia' },
                    { id: 2, name: 'Kyoto', location: 'Japan' },
                    { id: 3, name: 'Swiss Alps', location: 'Switzerland' }
                ]);
            }
        };
        fetchDestinations();
    }, []);

    const toggleDestination = (id) => {
        setSelectedDests(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await plannerAPI.planTrip({
                destinationIds: selectedDests,
                travelDays: parseInt(days),
                budget,
            });
            if (res.data?.itinerary) {
                setItinerary(res.data.itinerary);
                setActiveDayIdx(0);
            }
        } catch (err) {
            console.error(err);
            // Fallback local if API fails or backend error
            const mockResult = Array.from({ length: Math.min(parseInt(days), 7) }).map((_, i) => ({
                day: i + 1,
                date: `Day ${i + 1}`,
                location: selectedDests.length > 0 ? destinations.find(d => d.id === selectedDests[0])?.name || 'Selected Place' : 'Random City',
                activities: [
                    { id: `${i}-1`, type: 'Sightseeing', title: `Explore highlights of Day ${i + 1}`, time: '09:00 AM', cost: 20, done: false },
                    { id: `${i}-2`, type: 'Dining', title: `Lunch at local restaurant`, time: '01:00 PM', cost: 15, done: false }
                ]
            }));
            setItinerary(mockResult);
            setActiveDayIdx(0);
        } finally {
            setLoading(false);
        }
    };

    // derived metrics from generated itinerary
    const allActivities = itinerary.flatMap(d => d.activities || []);
    const totalBudget = allActivities.reduce((s, a) => s + (a.cost || 0), 0);
    const completed = allActivities.filter(a => a.done).length;
    const progressPct = allActivities.length > 0 ? Math.round((completed / allActivities.length) * 100) : 0;

    const toggleDone = (dayIdx, actId) => {
        setItinerary(prev => prev.map((d, i) => i !== dayIdx ? d : {
            ...d, activities: d.activities.map(a => a.id === actId ? { ...a, done: !a.done } : a),
        }));
    };

    const deleteActivity = (dayIdx, actId) => {
        setItinerary(prev => prev.map((d, i) => i !== dayIdx ? d : {
            ...d, activities: d.activities.filter(a => a.id !== actId),
        }));
    };

    const activeDay = itinerary[activeDayIdx];

    return (
        <div className="flex flex-col md:flex-row min-h-screen relative bg-[hsl(var(--background))]">
            {/* ── Left Sidebar: Setup & Planner Controls ──────────────────────────────── */}
            <div className="w-full md:w-80 border-r border-[hsl(var(--border))] flex flex-col bg-[hsl(var(--card)/0.4)]">
                <div className="p-5 border-b border-[hsl(var(--border))]">
                    <h1 className="text-xl font-bold font-mono flex items-center gap-2 mb-1">
                        <IconRoute className="text-[hsl(var(--primary))]" size={20} /> Trip Planner
                    </h1>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                        Configure your trip preferences below, and we will generate a fully optimized day-by-day travel plan.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-6">
                    {/* Form Group 1: Destinations */}
                    <div>
                        <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest flex items-center gap-1.5 mb-3">
                            <IconMapPin size={12} /> Destinations
                        </label>
                        <div className="space-y-2 mb-2">
                            {destinations.slice(0, 6).map(dest => {
                                const isSelected = selectedDests.includes(dest.id);
                                return (
                                    <button
                                        key={dest.id}
                                        onClick={() => toggleDestination(dest.id)}
                                        className={`flex w-full items-center justify-between p-2 rounded-[var(--radius)] border border-[hsl(var(--border))] text-xs font-medium transition-all ${isSelected ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]' : 'hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                                            }`}
                                    >
                                        <span>{dest.name}</span>
                                        <span className="text-[10px] text-[hsl(var(--muted-foreground))] line-clamp-1">{dest.location}</span>
                                        {isSelected && <IconCheck size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedDests.length > 0 && (
                            <p className="text-[10px] text-green-400 flex items-center gap-1">
                                <IconCheck size={10} /> {selectedDests.length} selected
                            </p>
                        )}
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] italic mt-1 leading-snug">
                            Select desired locations. If left blank, we will pick the top-rated ones for your budget.
                        </p>
                    </div>

                    {/* Form Group 2: Days */}
                    <div>
                        <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest flex items-center gap-1.5 mb-3">
                            <IconCalendar size={12} /> Travel Days
                        </label>
                        <Input
                            type="number" min="1" max="30" value={days} onChange={e => setDays(e.target.value)}
                            className="font-mono"
                        />
                    </div>

                    {/* Form Group 3: Budget */}
                    <div>
                        <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest flex items-center gap-1.5 mb-3">
                            <IconWallet size={12} /> Budget Level
                        </label>
                        <Select value={budget} onValueChange={setBudget}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {BUDGETS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleGenerate} disabled={loading || !days || Number(days) < 1}
                        className="w-full shadow-lg shadow-red-500/20 py-5"
                    >
                        {loading ? <><IconLoader2 size={16} className="animate-spin" /> Optimizing Plan...</> : <><IconSparkles size={16} /> Generate Itinerary</>}
                    </Button>

                    {itinerary.length > 0 && (
                        <div className="pt-4 border-t border-[hsl(var(--border))]">
                            <h3 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-3">View Days</h3>
                            <div className="space-y-1.5">
                                {itinerary.map((d, i) => (
                                    <button key={d.day} onClick={() => setActiveDayIdx(i)}
                                        className={`w-full text-left p-3 rounded-[var(--radius)] border transition-all ${activeDayIdx === i ? 'border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.1)]' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'}`}>
                                        <div className="flex justify-between mb-0.5">
                                            <span className={`text-xs font-bold font-mono ${activeDayIdx === i ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>Day {d.day}</span>
                                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{d.date}</span>
                                        </div>
                                        <div className="text-xs font-medium truncate">{d.location}</div>
                                        <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{d.activities.length} activities</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Panel: Itinerary ──────────────────────────────────────────────── */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto relative">
                {!itinerary.length && !loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mb-6">
                            <IconRoute className="text-[hsl(var(--primary))] opacity-70" size={32} />
                        </div>
                        <h2 className="text-xl font-bold font-mono mb-2">No Plan Generated</h2>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mb-6">
                            Use the planner form on the left to set your inputs. We will calculate the most optimal route, estimate budgets, and plot out a daily schedule.
                        </p>
                    </div>
                )}
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <IconLoader2 size={32} className="text-[hsl(var(--primary))] animate-spin mb-4" />
                        <h2 className="text-lg font-bold font-mono">Running TSP Optimizer</h2>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Calculating paths and minimizing budget constraints...</p>
                    </div>
                )}

                {itinerary.length > 0 && !loading && (
                    <div className="animate-fade-in-up">
                        {/* Header Summary */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                            <div className="flex-1">
                                <Input value={tripName} onChange={e => setTripName(e.target.value)}
                                    className="text-2xl font-bold font-mono bg-transparent border-none px-0 h-auto focus:ring-0 shadow-none hover:bg-[hsl(var(--muted)/0.5)] transition-colors rounded-none outline-none"
                                />
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                                    <span className="flex items-center gap-1"><IconCalendar size={13} /> {itinerary.length} Days Planner</span>
                                    <span className="flex items-center gap-1"><IconMapPin size={13} /> {selectedDests.length > 0 ? `${selectedDests.length} Selected` : 'Auto-Selected Best Picks'}</span>
                                    <span className="flex items-center gap-1 font-mono text-green-400 font-bold"><IconWallet size={13} /> ~${totalBudget} Est.</span>
                                </div>
                            </div>
                        </div>

                        {/* Overall Progress */}
                        <div className="mb-6 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] p-4 shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Itinerary Progress</span>
                                    <span className="font-mono font-bold text-[hsl(var(--primary))]">{progressPct}%</span>
                                </div>
                                <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                                    <div className="h-full bg-[hsl(var(--primary))] rounded-full transition-all duration-500 shadow-[0_0_10px_hsl(var(--primary))]" style={{ width: `${progressPct}%` }} />
                                </div>
                            </div>
                            <div className="flex gap-4 text-xs font-mono border-l border-[hsl(var(--border))] pl-6 my-1">
                                <div>
                                    <p className="text-[hsl(var(--muted-foreground))]">Activities</p>
                                    <p className="font-bold text-lg">{allActivities.length}</p>
                                </div>
                                <div>
                                    <p className="text-[hsl(var(--muted-foreground))]">Completed</p>
                                    <p className="font-bold text-lg">{completed}</p>
                                </div>
                            </div>
                        </div>

                        {/* Day view timeline */}
                        {activeDay && (
                            <div className="bg-[hsl(var(--card)/0.2)] border border-[hsl(var(--border))] rounded-xl p-6">
                                <div className="flex flex-col md:flex-row items-start justify-between mb-6 border-b border-[hsl(var(--border))] pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold font-mono flex items-center gap-2">
                                            Day {activeDay.day} <span className="text-[hsl(var(--muted-foreground))] font-medium text-sm mt-0.5">— {activeDay.date}</span>
                                        </h2>
                                        <p className="text-sm font-medium text-[hsl(var(--muted))] flex items-center gap-1.5 mt-1.5">
                                            <IconMapPin size={13} className="text-[hsl(var(--primary))]" /> {activeDay.location}
                                        </p>
                                    </div>
                                    <Button size="sm" variant="outline" className="mt-3 md:mt-0 shadow-sm"><IconPlus size={14} /> Add Manual Stop</Button>
                                </div>

                                <div className="relative pl-2">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[33px] top-6 bottom-4 w-[2px] bg-gradient-to-b from-[hsl(var(--primary)/0.5)] to-[hsl(var(--muted))]" />

                                    <div className="space-y-6">
                                        {activeDay.activities?.map((act, i) => {
                                            const TypeIcon = TYPE_ICONS[act.type] || IconMapPin;
                                            const colorCls = TYPE_COLORS[act.type] || 'text-[hsl(var(--muted-foreground))]';

                                            return (
                                                <div key={act.id} className={`relative pl-14 animate-fade-in-up animate-delay-${i + 1}`}>
                                                    {/* Icon Node */}
                                                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 flex items-center justify-center z-10 transition-colors shadow-lg ${act.done ? 'bg-[hsl(var(--primary))] border-[hsl(var(--card))]' : 'bg-[hsl(var(--card))] border-[hsl(var(--border))]'
                                                        }`}>
                                                        {act.done ? <IconCheck size={16} className="text-white" /> : <TypeIcon size={16} stroke={2} className={colorCls} />}
                                                    </div>

                                                    {/* Content Card */}
                                                    <Card className={`card-glow transition-all duration-300 border-[hsl(var(--border))/0.5] ${act.done ? 'opacity-60 scale-[0.98]' : 'hover:border-[hsl(var(--primary)/20%)]'}`}>
                                                        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                            <div className="flex-1 w-full">
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <Badge variant="outline" className={`text-[10px] py-0 border-current ${colorCls} bg-[hsl(var(--card))]`}>{act.type}</Badge>
                                                                    <span className="flex items-center gap-1 text-[11px] font-mono text-[hsl(var(--muted-foreground))]">
                                                                        <IconClock size={11} /> {act.time}
                                                                    </span>
                                                                </div>
                                                                <p className={`font-semibold text-base mb-1 ${act.done ? 'line-through text-[hsl(var(--muted-foreground))]' : 'text-[hsl(var(--foreground))]'}`}>
                                                                    {act.title}
                                                                </p>
                                                                {act.cost > 0 && (
                                                                    <p className="font-mono text-xs text-green-400 font-medium">Est. Cost: ${act.cost}</p>
                                                                )}
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex gap-2 w-full sm:w-auto h-full items-center sm:justify-end border-t border-[hsl(var(--border))] sm:border-t-0 pt-3 sm:pt-0">
                                                                <Button
                                                                    variant="outline" size="sm"
                                                                    onClick={() => toggleDone(activeDayIdx, act.id)}
                                                                    className={`h-8 gap-1.5 ${act.done ? 'bg-[hsl(var(--primary))] text-white border-transparent hover:bg-[hsl(var(--primary)/0.9)]' : ''}`}
                                                                >
                                                                    <IconCheck size={14} className={act.done ? '' : 'text-[hsl(var(--muted-foreground))]'} />
                                                                    <span className="text-xs">{act.done ? 'Completed' : 'Mark Done'}</span>
                                                                </Button>
                                                                <Button
                                                                    variant="outline" size="sm"
                                                                    onClick={() => deleteActivity(activeDayIdx, act.id)}
                                                                    className="h-8 w-8 p-0 border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                                                                >
                                                                    <IconTrash size={14} />
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            );
                                        })}
                                        {(!activeDay.activities || activeDay.activities.length === 0) && (
                                            <div className="text-[hsl(var(--muted-foreground))] text-sm pl-16 py-4 flex items-center gap-2">
                                                <IconInfoCircle size={16} /> No activities scheduled for this day.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
