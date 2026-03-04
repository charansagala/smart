import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconMail, IconLock, IconLoader2, IconAlertCircle } from '@tabler/icons-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
            <Card className="w-full max-w-sm shadow-xl card-glow border-[hsl(var(--border))/0.5]">
                <CardHeader className="space-y-1 text-center pb-6">
                    <CardTitle className="text-2xl font-bold font-mono tracking-tight">Welcome back</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-md mb-4 text-xs flex items-center gap-2">
                            <IconAlertCircle size={14} /> {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-[hsl(var(--muted-foreground))]">Email</label>
                            <div className="relative">
                                <IconMail className="absolute left-3 top-2.5 text-[hsl(var(--muted-foreground))]" size={16} />
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="pl-9 bg-[hsl(var(--input))]"
                                    placeholder="admin@smart.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-[hsl(var(--muted-foreground))]">Password</label>
                            <div className="relative">
                                <IconLock className="absolute left-3 top-2.5 text-[hsl(var(--muted-foreground))]" size={16} />
                                <Input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="pl-9 bg-[hsl(var(--input))]"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <IconLoader2 className="animate-spin" size={16} /> : 'Sign In'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
                        Don't have an account? <Link to="/register" className="text-[hsl(var(--primary))] hover:underline underline-offset-4">Sign up</Link>
                    </div>

                    <div className="mt-4 p-3 bg-[hsl(var(--muted)/0.5)] rounded-md text-[10px] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] text-center space-y-1">
                        <p className="font-bold">Demo Accounts:</p>
                        <p>Admin: admin@smart.com / admin</p>
                        <p>Tourist: tourist@smart.com / tourist</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
