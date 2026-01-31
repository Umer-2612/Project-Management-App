import { Plus, Moon, Sun, Wifi, WifiOff, LogOut } from 'lucide-react';
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
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
                <Select
                    value={currentProject?._id || ''}
                    onValueChange={(value) => {
                        const project = projects.find((p) => p._id === value);
                        if (project) setCurrentProject(project);
                    }}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                        {projects.map((project) => (
                            <SelectItem key={project._id} value={project._id}>
                                {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={() => setProjectDialogOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    New Project
                </Button>
            </div>

            <div className="flex items-center gap-4">
                {/* Connection status */}
                <div className="flex items-center gap-2 text-sm">
                    {isConnected ? (
                        <>
                            <Wifi className="h-4 w-4 text-green-500" />
                            <span className="text-muted-foreground">Live</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-4 w-4 text-red-500" />
                            <span className="text-muted-foreground">Offline</span>
                        </>
                    )}
                </div>

                {/* Theme toggle */}
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* User dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                    {user ? getInitials(user.name) : 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
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
