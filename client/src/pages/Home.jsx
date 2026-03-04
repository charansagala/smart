import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    IconMap2, IconSparkles, IconRoute, IconChartBar,
    IconArrowRight, IconTrendingUp, IconUsers, IconStar, IconMapPin,
} from '@tabler/icons-react';

const features = [
    {
        icon: IconMap2,
        title: 'Discover Destinations',
        desc: 'Explore thousands of curated travel destinations with rich details, photos, and insights.',
        path: '/destinations',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
        icon: IconSparkles,
        title: 'AI Recommendations',
        desc: 'Get personalized travel suggestions powered by machine learning based on your preferences.',
        path: '/recommendations',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
        icon: IconRoute,
        title: 'Trip Planner',
        desc: 'Build and organize complete itineraries with scheduling, budgeting, and route optimization.',
        path: '/planner',
        color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/20',
    },
    {
        icon: IconChartBar,
        title: 'Analytics Dashboard',
        desc: 'View real-time insights, travel trends, visitor statistics, and performance metrics.',
        path: '/analytics',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10 border-yellow-500/20',
    },
];

const stats = [
    { label: 'Destinations', value: '2,400+', icon: IconMapPin, color: 'stat-card-red' },
    { label: 'Active Users', value: '18,500', icon: IconUsers, color: 'stat-card-blue' },
    { label: 'Trips Planned', value: '94,200', icon: IconRoute, color: 'stat-card-green' },
    { label: 'Avg Rating', value: '4.87', icon: IconStar, color: 'stat-card-yellow' },
];

const trending = [
    { name: 'Bali, Indonesia', category: 'Beach & Culture', rating: 4.9, visits: '12.4k' },
    { name: 'Kyoto, Japan', category: 'Heritage', rating: 4.8, visits: '10.1k' },
    { name: 'Santorini, Greece', category: 'Scenic', rating: 4.9, visits: '9.7k' },
    { name: 'Patagonia, Argentina', category: 'Adventure', rating: 4.7, visits: '7.2k' },
];

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero */}
            <section className="relative px-8 pt-14 pb-12 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-3xl animate-fade-in-up">
                    <Badge variant="info" className="mb-4 font-mono text-[11px]">
                        🤖 AI-Powered Tourism Platform
                    </Badge>
                    <h1 className="text-4xl font-bold leading-tight mb-4">
                        Smart Tourism
                        <span className="block gradient-text">Recommendation &</span>
                        <span className="block">Planning System</span>
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed mb-8 max-w-xl">
                        Discover, plan, and optimize your perfect travel experience with AI-powered recommendations,
                        real-time analytics, and intelligent itinerary building.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        <Button asChild size="lg" className="shadow-lg shadow-red-500/20">
                            <Link to="/recommendations">
                                <IconSparkles size={18} /> Get Recommendations
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link to="/destinations">
                                <IconMap2 size={18} /> Explore Destinations
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="px-8 pb-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <Card key={stat.label} className={`card-glow ${stat.color} animate-fade-in-up animate-delay-${i + 1}`}>
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                                    <stat.icon size={20} stroke={1.8} className="text-[hsl(var(--primary))]" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold font-mono">{stat.value}</div>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Feature Cards */}
            <section className="px-8 pb-8">
                <h2 className="text-lg font-semibold mb-4 font-mono">Platform Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((f, i) => (
                        <Link key={f.path} to={f.path}>
                            <Card className={`card-glow cursor-pointer animate-fade-in-up animate-delay-${i + 1} border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all`}>
                                <CardContent className="p-5 flex items-start gap-4">
                                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${f.bg}`}>
                                        <f.icon size={22} stroke={1.8} className={f.color} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm mb-1.5">{f.title}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{f.desc}</div>
                                    </div>
                                    <IconArrowRight size={16} className="text-[hsl(var(--muted-foreground))] mt-0.5 flex-shrink-0" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Trending Destinations */}
            <section className="px-8 pb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold font-mono">Trending Destinations</h2>
                    <Button asChild variant="ghost" size="sm">
                        <Link to="/destinations">View all <IconArrowRight size={14} /></Link>
                    </Button>
                </div>
                <Card className="card-glow overflow-hidden">
                    <div className="divide-y divide-[hsl(var(--border))]">
                        {trending.map((dest, i) => (
                            <div key={dest.name} className="flex items-center justify-between px-5 py-3.5 hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] w-5">#{i + 1}</span>
                                    <div>
                                        <div className="text-sm font-medium">{dest.name}</div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{dest.category}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                                    <div className="flex items-center gap-1">
                                        <IconStar size={13} className="text-yellow-400" />
                                        <span>{dest.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <IconTrendingUp size={13} className="text-green-400" />
                                        <span>{dest.visits}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </section>
        </div>
    );
}
