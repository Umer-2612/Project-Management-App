import { useState, useEffect } from 'react';
import { Sprint, Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, ChevronRight, MoreVertical } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { SprintDialog } from './SprintDialog';
import { SprintRetro } from './SprintRetro';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskBoard } from '@/components/tasks/TaskBoard';

const statusColors = {
    planning: 'bg-slate-500/20 text-slate-700 dark:text-slate-300',
    active: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    completed: 'bg-green-500/20 text-green-700 dark:text-green-300',
};

export function SprintList() {
    const { currentProject } = useProject();
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
    const [sprintTasks, setSprintTasks] = useState<Task[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [retroOpen, setRetroOpen] = useState(false);
    const [view, setView] = useState<'backlog' | 'sprint'>('backlog');

    const fetchSprints = async () => {
        if (!currentProject) return;
        try {
            const data = await api.getSprints(currentProject._id);
            setSprints(data);
        } catch (error) {
            console.error('Failed to fetch sprints:', error);
        }
    };

    const fetchBacklog = async () => {
        if (!currentProject) return;
        try {
            const data = await api.getBacklog(currentProject._id);
            setBacklogTasks(data);
        } catch (error) {
            console.error('Failed to fetch backlog:', error);
        }
    };

    const fetchSprintTasks = async (sprintId: string) => {
        try {
            const data = await api.getTasks(currentProject?._id, sprintId);
            setSprintTasks(data);
        } catch (error) {
            console.error('Failed to fetch sprint tasks:', error);
        }
    };

    useEffect(() => {
        fetchSprints();
        fetchBacklog();
    }, [currentProject?._id]);

    useEffect(() => {
        if (selectedSprint) {
            fetchSprintTasks(selectedSprint._id);
        }
    }, [selectedSprint?._id]);

    const moveTaskToSprint = async (taskId: string, sprintId: string) => {
        try {
            await api.assignTasksToSprint(sprintId, [taskId]);
            fetchBacklog();
            if (selectedSprint?._id === sprintId) {
                fetchSprintTasks(sprintId);
            }
        } catch (error) {
            console.error('Failed to move task:', error);
        }
    };

    const moveTaskToBacklog = async (taskId: string) => {
        if (!selectedSprint) return;
        try {
            await api.removeTaskFromSprint(selectedSprint._id, taskId);
            fetchBacklog();
            fetchSprintTasks(selectedSprint._id);
        } catch (error) {
            console.error('Failed to move task to backlog:', error);
        }
    };

    const activeSprint = sprints.find((s) => s.status === 'active');

    if (!currentProject) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a project to view sprints
            </div>
        );
    }

    return (
        <div className="flex h-full gap-6">
            {/* Sprint list sidebar */}
            <div className="w-80 shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Sprints</h2>
                    <Button size="sm" onClick={() => setDialogOpen(true)}>
                        <Plus className="mr-1 h-4 w-4" />
                        New Sprint
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-2 pr-4">
                        {sprints.map((sprint) => (
                            <Card
                                key={sprint._id}
                                className={`cursor-pointer transition-colors ${selectedSprint?._id === sprint._id ? 'border-primary' : ''
                                    }`}
                                onClick={() => {
                                    setSelectedSprint(sprint);
                                    setView('sprint');
                                }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">{sprint.name}</h3>
                                        <Badge variant="outline" className={statusColors[sprint.status]}>
                                            {sprint.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                                        </span>
                                    </div>
                                    {sprint.status === 'completed' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2 w-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSprint(sprint);
                                                setRetroOpen(true);
                                            }}
                                        >
                                            View Retrospective
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        {sprints.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-8">
                                No sprints yet. Create your first sprint!
                            </p>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main content area */}
            <div className="flex-1">
                <Tabs value={view} onValueChange={(v) => setView(v as 'backlog' | 'sprint')}>
                    <TabsList>
                        <TabsTrigger value="backlog">
                            Backlog ({backlogTasks.length})
                        </TabsTrigger>
                        <TabsTrigger value="sprint" disabled={!selectedSprint}>
                            {selectedSprint ? selectedSprint.name : 'Select Sprint'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="backlog" className="mt-4">
                        <TaskBoard
                            tasks={backlogTasks}
                            onTasksChange={fetchBacklog}
                        />
                    </TabsContent>

                    <TabsContent value="sprint" className="mt-4">
                        {selectedSprint ? (
                            <TaskBoard
                                tasks={sprintTasks}
                                onTasksChange={() => fetchSprintTasks(selectedSprint._id)}
                                sprintId={selectedSprint._id}
                            />
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                Select a sprint to view its tasks
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <SprintDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                projectId={currentProject._id}
                onSuccess={() => {
                    fetchSprints();
                    setDialogOpen(false);
                }}
            />

            {selectedSprint && (
                <SprintRetro
                    open={retroOpen}
                    onOpenChange={setRetroOpen}
                    sprint={selectedSprint}
                />
            )}
        </div>
    );
}
