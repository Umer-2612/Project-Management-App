import { useMemo, useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/types';
import { TaskColumn } from './TaskColumn';
import { TaskDialog } from './TaskDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { useSocket } from '@/context/SocketContext';
import { api } from '@/lib/api';

const columns: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
];

interface TaskBoardProps {
    tasks: Task[];
    onTasksChange: () => void;
    sprintId?: string;
}

export function TaskBoard({ tasks, onTasksChange, sprintId }: TaskBoardProps) {
    const { currentProject } = useProject();
    const { socket } = useSocket();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        return columns.reduce((acc, col) => {
            acc[col.id] = tasks.filter((task) => task.status === col.id);
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [tasks]);

    // Listen for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleTaskCreated = (task: Task) => {
            onTasksChange();
        };

        const handleTaskUpdated = (task: Task) => {
            onTasksChange();
        };

        const handleTaskDeleted = (taskId: string) => {
            onTasksChange();
        };

        socket.on('task:created', handleTaskCreated);
        socket.on('task:updated', handleTaskUpdated);
        socket.on('task:deleted', handleTaskDeleted);

        return () => {
            socket.off('task:created', handleTaskCreated);
            socket.off('task:updated', handleTaskUpdated);
            socket.off('task:deleted', handleTaskDeleted);
        };
    }, [socket, onTasksChange]);

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        try {
            await api.updateTaskStatus(taskId, newStatus);
            if (socket && currentProject) {
                socket.emit('task:update', { taskId, projectId: currentProject._id });
            }
            onTasksChange();
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const handleTaskClick = (task: Task) => {
        setEditingTask(task);
        setDialogOpen(true);
    };

    const handleCreateNew = () => {
        setEditingTask(null);
        setDialogOpen(true);
    };

    const handleDialogSuccess = () => {
        setDialogOpen(false);
        setEditingTask(null);
        onTasksChange();
    };

    if (!currentProject) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select or create a project to get started
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Task Board</h2>
                <Button onClick={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </div>

            <div className="grid flex-1 grid-cols-4 gap-4 overflow-hidden">
                {columns.map((column) => (
                    <TaskColumn
                        key={column.id}
                        title={column.title}
                        status={column.id}
                        tasks={tasksByStatus[column.id] || []}
                        onTaskClick={handleTaskClick}
                        onStatusChange={handleStatusChange}
                    />
                ))}
            </div>

            <TaskDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setEditingTask(null);
                }}
                task={editingTask}
                projectId={currentProject._id}
                sprintId={sprintId}
                onSuccess={handleDialogSuccess}
            />
        </div>
    );
}
