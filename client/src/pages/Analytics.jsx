import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, ReferenceDot
} from 'recharts';
import {
    IconUsers, IconMapPin, IconChartLine, IconLoader2, IconAlertCircle, IconMap, IconStar, IconTrendingUp
} from '@tabler/icons-react';
import { analyticsAPI } from '@/services/api';

const TOOLTIP_STYLE = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    fontSize: 12,
    color: 'hsl(var(--foreground))',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
};

const ICONS = {
    map: IconMap,
    star: IconStar,
    users: IconUsers,
    trend: IconTrendingUp
};

export default function Analytics() {
    const [summary, setSummary] = useState([]);
    const [popular, setPopular] = useState([]);
    const [trends, setTrends] = useState({ chartData: [], recentRecommendations: [] });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [sumRes, popRes, trendsRes] = await Promise.all([
                    analyticsAPI.getSummary(),
                    analyticsAPI.getPopular(),
                    analyticsAPI.getTrends()
                ]);

                setSummary(sumRes.data);
                setPopular(popRes.data);
                setTrends(trendsRes.data);
            } catch (err) {
                setError('Failed to load dashboard data. Please ensure the backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-[hsl(var(--muted-foreground))]">
                <IconLoader2 size={40} className="animate-spin text-[hsl(var(--primary))]" />
                <p className="font-mono text-sm animate-pulse">Loading analytics dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-[var(--radius)] flex items-center gap-3 text-sm m-8">
                <IconAlertCircle size={18} /> {error}
            </div>
        );
    }

    const { chartData, recentRecommendations } = trends;

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-mono flex items-center gap-2">
                        <IconChartLine className="text-[hsl(var(--primary))]" size={26} />
                        Tourism Analytics Dashboard
                    </h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                        Overview of destinations, user forecasts, and geographical popularity.
                    </p>
                </div>
            </div>

            {/* KPI Overviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summary.map((kpi, idx) => {
                    const IconComponent = ICONS[kpi.icon] || IconChartLine;
                    const isUp = kpi.delta?.includes('+');
                    return (
                        <Card key={kpi.id} className="card-glow border-[hsl(var(--border))/0.5] animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                            <CardContent className="p-5 flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">{kpi.label}</p>
                                    <h2 className="text-2xl font-bold font-mono tracking-tight">{kpi.value}</h2>
                                    {kpi.delta && (
                                        <div className={`flex items-center gap-1 mt-1 text-[11px] font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                            {kpi.delta} vs last period
                                        </div>
                                    )}
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                                    <IconComponent size={20} className="text-[hsl(var(--primary))]" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Forecast Line Chart */}
                <Card className="lg:col-span-2 shadow-sm bg-[hsl(var(--card)/0.6)] backdrop-blur-sm border-[hsl(var(--border))/0.5]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Seasonal Visitor Trends</CardTitle>
                        <CardDescription>Historical volume vs machine-learning forecast</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={TOOLTIP_STYLE}
                                    formatter={(value, name, props) => {
                                        if (props.payload.forecast) return [`${value} (Predicted)`, 'Tourists'];
                                        return [value, 'Tourists'];
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />

                                <Line
                                    type="monotone"
                                    dataKey="visitors"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'white', strokeWidth: 2 }}
                                    name="Monthly Visitors"
                                />
                                {/* Highlight the latest prediction point */}
                                {chartData.length > 0 && (
                                    <ReferenceDot
                                        x={chartData[chartData.length - 1].month}
                                        y={chartData[chartData.length - 1].visitors}
                                        r={5} fill="#ef4444" stroke="none"
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Popularity Bar Chart */}
                <Card className="shadow-sm bg-[hsl(var(--card)/0.6)] backdrop-blur-sm border-[hsl(var(--border))/0.5]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Top Destinations</CardTitle>
                        <CardDescription>By all-time popularity score</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={popular} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} width={80} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                                <Bar
                                    dataKey="visits"
                                    fill="hsl(var(--primary))"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                    name="Total Score"
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Table: Recent recommendations */}
            <Card className="shadow-sm border-[hsl(var(--border))/0.5]">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">Recent Recommendations Generated</CardTitle>
                    <CardDescription>A live log of what the AI trip planner is suggesting to users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-[hsl(var(--border))]">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Target Destination</TableHead>
                                    <TableHead>Profile Context</TableHead>
                                    <TableHead className="text-right">Compatibility</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentRecommendations.map((rec, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium text-sm flex items-center gap-2">
                                            <IconMapPin size={16} className="text-[hsl(var(--muted-foreground))]" /> {rec.target}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-[10px]">{rec.match}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-[hsl(var(--primary))]">
                                            {rec.score}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
