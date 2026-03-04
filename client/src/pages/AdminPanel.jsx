import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IconShieldHalf, IconUsers, IconDatabase, IconServer, IconCheck, IconX } from '@tabler/icons-react';

export default function AdminPanel() {
    const [users] = useState([
        { id: 1, name: 'Admin User', email: 'admin@smart.com', role: 'admin', status: 'Active', joined: 'Mar 1, 2026' },
        { id: 2, name: 'Tourist User', email: 'tourist@smart.com', role: 'tourist', status: 'Active', joined: 'Mar 3, 2026' },
        { id: 3, name: 'John Doe', email: 'john@example.com', role: 'tourist', status: 'Inactive', joined: 'Feb 24, 2026' },
        { id: 4, name: 'Jane Smith', email: 'jane@example.com', role: 'tourist', status: 'Active', joined: 'Jan 15, 2026' },
    ]);

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-mono flex items-center gap-2">
                        <IconShieldHalf className="text-amber-500" size={26} />
                        Admin Control Panel
                    </h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                        Manage system access roles and monitor platform infrastructure health endpoints.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="card-glow border-[hsl(var(--border))/0.5]">
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Registered Users</p>
                            <h2 className="text-2xl font-bold font-mono tracking-tight">{users.length}</h2>
                            <p className="text-[11px] text-green-400 font-semibold mt-1">+2 this week</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                            <IconUsers size={20} className="text-[hsl(var(--primary))]" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-glow border-[hsl(var(--border))/0.5]">
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Database Status</p>
                            <h2 className="text-2xl font-bold font-mono tracking-tight text-green-400">Online</h2>
                            <p className="text-[11px] text-[hsl(var(--muted-foreground))] font-semibold mt-1">~12ms latency</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <IconDatabase size={20} className="text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-glow border-[hsl(var(--border))/0.5]">
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Upload Server</p>
                            <h2 className="text-2xl font-bold font-mono tracking-tight text-blue-400">Active</h2>
                            <p className="text-[11px] text-[hsl(var(--muted-foreground))] font-semibold mt-1">2.4 GB used</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <IconServer size={20} className="text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-[hsl(var(--border))/0.5]">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">User Access Management</CardTitle>
                    <CardDescription>View all accounts and their respective system permissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-[hsl(var(--border))] overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[hsl(var(--muted)/0.3)]">
                                <TableRow>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Email Address</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-mono text-xs text-[hsl(var(--muted-foreground))]">#{u.id.toString().padStart(4, '0')}</TableCell>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell className="text-[hsl(var(--muted-foreground))]">{u.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-mono text-[10px] ${u.role === 'admin' ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' : 'bg-transparent'}`}>
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs font-medium">
                                                {u.status === 'Active' ? <IconCheck size={14} className="text-green-500" /> : <IconX size={14} className="text-red-500" />}
                                                <span className={u.status === 'Active' ? 'text-green-500' : 'text-red-500'}>{u.status}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-[hsl(var(--muted-foreground))]">
                                            {u.joined}
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
