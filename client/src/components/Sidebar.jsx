import { NavLink, useNavigate } from 'react-router-dom';
import {
    IconLayoutDashboard, IconMapPins, IconWand,
    IconSettings, IconMessage, IconLogout, IconShieldHalf
} from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { IconSun, IconMoon } from '@tabler/icons-react';

const navItems = [
    { label: 'Overview', icon: IconLayoutDashboard, path: '/' },
    { label: 'Destinations', icon: IconMapPins, path: '/destinations' },
    { label: 'Trip Planner', icon: IconWand, path: '/planner' },
    { label: 'AI Recommendations', icon: IconMessage, path: '/recommendations' },
    { label: 'Analytics', icon: IconSettings, path: '/analytics' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" || theme === "system" ? "light" : "dark");
    };

    return (
        <div className="w-full md:w-64 border-r border-[hsl(var(--border))] flex flex-col bg-[hsl(var(--card)/0.4)] md:h-screen sticky top-0 md:relative z-40">
            <div className="p-4 md:p-6 pb-2 md:pb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[hsl(var(--primary))]">
                    <IconMapPins size={28} stroke={1.5} />
                    <span className="font-bold font-mono text-lg tracking-tight hidden md:block">SmartTour.</span>
                </div>

                {/* Mobile: theme toggle & logout in header */}
                <div className="flex md:hidden items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-400">
                        <IconLogout size={18} />
                    </Button>
                </div>
            </div>

            <nav className="flex-1 px-4 hidden md:flex flex-col gap-1.5 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                            ${isActive
                                ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-semibold'
                                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}
                        `}
                    >
                        <item.icon size={18} stroke={1.8} />
                        {item.label}
                    </NavLink>
                ))}

                {user?.role === 'admin' && (
                    <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2 px-3">Admin Panel</div>
                        <NavLink
                            to="/admin"
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-amber-500/10 text-amber-500 font-semibold'
                                    : 'text-[hsl(var(--muted-foreground))] hover:bg-amber-500/5 hover:text-[hsl(var(--foreground))]'}
                            `}
                        >
                            <IconShieldHalf size={18} stroke={1.8} />
                            System Dashboard
                        </NavLink>
                    </div>
                )}
            </nav>

            {/* Mobile Nav Bar */}
            <nav className="md:hidden flex overflow-x-auto border-b border-[hsl(var(--border))]">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-1 px-4 py-3 text-xs font-medium whitespace-nowrap
                            ${isActive
                                ? 'text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]'
                                : 'text-[hsl(var(--muted-foreground))] border-b-2 border-transparent'}
                        `}
                    >
                        <item.icon size={14} stroke={1.8} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 md:p-6 border-t border-[hsl(var(--border))] hidden md:block">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] flex items-center justify-center font-bold text-sm">
                            {(user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[120px]">{user?.username}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[120px]">{user?.role}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
                    </Button>
                </div>
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30">
                    <IconLogout size={18} className="mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
