import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
    title: string;
    status: TaskStatus;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const statusColors: Record<TaskStatus, string> = {
    'todo': 'border-slate-300 dark:border-slate-600',
    'in-progress': 'border-blue-400',
    'review': 'border-amber-400',
    'done': 'border-green-400',
};

export function TaskColumn({ title, status, tasks, onTaskClick, onStatusChange }: TaskColumnProps) {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-muted/50');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('bg-muted/50');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-muted/50');
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            onStatusChange(taskId, status);
        }
    };

    return (
        <div
            className={cn(
                'flex flex-col rounded-lg border-t-4 bg-muted/30 transition-colors',
                statusColors[status]
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="font-medium">{title}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {tasks.length}
                </span>
            </div>

            <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No tasks
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
