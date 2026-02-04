import { Plus, Moon, Sun, Wifi, WifiOff, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProject } from '@/context/ProjectContext';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { ProjectDialog } from '@/components/layout/ProjectDialog';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function Header() {
    const { currentProject, projects, setCurrentProject, refreshProjects } = useProject();
    const { isConnected } = useSocket();
    const { user, logout } = useAuth();
    const [isDark, setIsDark] = useState(false);
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
    }, []);

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark(!isDark);
    };

    const handleProjectCreated = () => {
        refreshProjects();
        setProjectDialogOpen(false);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-card/30 px-6 backdrop-blur-xl transition-all">
            <div className="flex items-center gap-6">
                {/* Breadcrumb replacement or Project Selector */}
                <div className="flex items-center gap-3">
                    <div className="h-6 w-1 rounded-full bg-primary" />
                    <Select
                        value={currentProject?._id || ''}
                        onValueChange={(value) => {
                            const project = projects.find((p) => p._id === value);
                            if (project) setCurrentProject(project);
                        }}
                    >
                        <SelectTrigger className="w-[240px] border-white/10 bg-white/5 hover:bg-white/10 transition-colors rounded-lg focus:ring-primary/50">
                            <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-card/90 backdrop-blur-xl">
                            {projects.map((project) => (
                                <SelectItem key={project._id} value={project._id} className="cursor-pointer focus:bg-primary/20">
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProjectDialogOpen(true)}
                    className="border-dashed border-white/20 hover:border-primary hover:text-primary transition-all bg-transparent"
                >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    New Project
                </Button>
            </div>

            <div className="flex items-center gap-4">
                {/* Connection status */}
                <div className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border",
                    isConnected
                        ? "border-green-500/20 bg-green-500/10 text-green-500"
                        : "border-red-500/20 bg-red-500/10 text-red-500"
                )}>
                    {isConnected ? (
                        <>
                            <Wifi className="h-3 w-3" />
                            <span>Live</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-3 w-3" />
                            <span>Offline</span>
                        </>
                    )}
                </div>

                {/* Notifications Placeholder */}
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white rounded-full">
                    <Bell className="h-5 w-5" />
                </Button>

                {/* Theme toggle */}
                {/* <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button> */}

                {/* User dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all p-0 overflow-hidden">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                                    {user ? getInitials(user.name) : 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 glass-panel border-white/10" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ProjectDialog
                open={projectDialogOpen}
                onOpenChange={setProjectDialogOpen}
                onSuccess={handleProjectCreated}
            />
        </header>
    );
}
