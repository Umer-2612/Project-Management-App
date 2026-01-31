import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    FileText,
    Calendar,
    MessageSquare,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Sprints', path: '/sprints' },
    { icon: FileText, label: 'Docs', path: '/docs' },
    { icon: MessageSquare, label: 'MoMs', path: '/moms' },
    { icon: Users, label: 'Team', path: '/team' },
];

export function Sidebar() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={cn(
                'relative flex flex-col border-r bg-card transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b px-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                {!collapsed && (
                    <span className="text-lg font-semibold tracking-tight">LeanAgile</span>
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    collapsed && 'justify-center px-2'
                                )}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            <Separator />

            {/* Settings */}
            <div className="p-2">
                <Link
                    to="/settings"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                        location.pathname === '/settings' && 'bg-muted text-foreground',
                        collapsed && 'justify-center px-2'
                    )}
                >
                    <Settings className="h-5 w-5" />
                    {!collapsed && <span>Settings</span>}
                </Link>
            </div>

            {/* Collapse button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm"
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? (
                    <ChevronRight className="h-3 w-3" />
                ) : (
                    <ChevronLeft className="h-3 w-3" />
                )}
            </Button>
        </div>
    );
}
