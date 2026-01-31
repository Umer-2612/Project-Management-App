import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
    task: Task;
    onClick: () => void;
}

const statusVariants = {
    'todo': 'todo',
    'in-progress': 'inProgress',
    'review': 'review',
    'done': 'done',
} as const;

export function TaskCard({ task, onClick }: TaskCardProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('taskId', task._id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Card
            className={cn(
                'cursor-pointer transition-all hover:shadow-md active:scale-[0.98]',
                'border-l-4',
                task.status === 'todo' && 'border-l-slate-400',
                task.status === 'in-progress' && 'border-l-blue-500',
                task.status === 'review' && 'border-l-amber-500',
                task.status === 'done' && 'border-l-green-500'
            )}
            draggable
            onDragStart={handleDragStart}
            onClick={onClick}
        >
            <CardContent className="p-3">
                <h4 className="mb-2 font-medium leading-tight">{task.title}</h4>

                {task.description && (
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {task.estimatedTime > 0 && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{task.estimatedTime}h</span>
                            </div>
                        )}
                    </div>

                    {task.assignees.length > 0 && (
                        <div className="flex -space-x-2">
                            {task.assignees.slice(0, 3).map((assignee) => (
                                <Avatar key={assignee._id} className="h-6 w-6 border-2 border-background">
                                    <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                                        {getInitials(assignee.name)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {task.assignees.length > 3 && (
                                <Avatar className="h-6 w-6 border-2 border-background">
                                    <AvatarFallback className="text-[10px]">
                                        +{task.assignees.length - 3}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
