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
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

    // Auto-collapse on small screens? Optional refinement.

    return (
        <motion.div
            initial={{ width: 256 }}
            animate={{ width: collapsed ? 80 : 256 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
                'relative flex h-screen flex-col border-r border-white/10 bg-card/30 backdrop-blur-xl z-50',
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/20">
                    <Zap className="h-6 w-6 text-white fill-white" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
                        >
                            LeanAgile
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-6 px-3">
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="block group relative"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 rounded-xl bg-primary/20"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                                <div className={cn(
                                    'flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium transition-colors relative z-10',
                                    isActive
                                        ? 'text-white'
                                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                )}>
                                    <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="overflow-hidden whitespace-nowrap"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* <Separator className="bg-white/10" /> */}

            {/* Settings */}
            <div className="p-3 border-t border-white/10">
                <Link
                    to="/settings"
                    className={cn(
                        'flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-white',
                        location.pathname === '/settings' && 'bg-white/5 text-white'
                    )}
                >
                    <Settings className="h-5 w-5 shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="overflow-hidden whitespace-nowrap"
                            >
                                Settings
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Collapse button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-white/10 bg-card text-muted-foreground hover:text-white shadow-md z-50 hover:bg-primary hover:border-primary transition-all"
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? (
                    <ChevronRight className="h-3 w-3" />
                ) : (
                    <ChevronLeft className="h-3 w-3" />
                )}
            </Button>
        </motion.div>
    );
}
