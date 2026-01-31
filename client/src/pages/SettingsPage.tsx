import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Moon, Sun, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';

export function SettingsPage() {
    const { currentProject, refreshProjects } = useProject();
    const [isDark, setIsDark] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark(!isDark);
    };

    const handleDeleteConfirm = async () => {
        if (!currentProject) return;
        try {
            await api.deleteProject(currentProject._id);
            refreshProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    return (
        <>
            <div className="max-w-2xl space-y-6">
                <h1 className="text-2xl font-bold">Settings</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Theme</h3>
                                <p className="text-sm text-muted-foreground">
                                    Choose between light and dark mode
                                </p>
                            </div>
                            <Button variant="outline" onClick={toggleTheme}>
                                {isDark ? (
                                    <>
                                        <Sun className="mr-2 h-4 w-4" />
                                        Light Mode
                                    </>
                                ) : (
                                    <>
                                        <Moon className="mr-2 h-4 w-4" />
                                        Dark Mode
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {currentProject && (
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Delete Project</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete "{currentProject.name}" and all its data
                                    </p>
                                </div>
                                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Project
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "<span className="font-medium text-foreground">{currentProject?.name}</span>" and all its tasks, sprints, documents, and meeting minutes. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Project
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
