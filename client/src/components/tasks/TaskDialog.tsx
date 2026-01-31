import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Task, TaskStatus, User } from '@/types';
import { api } from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { X, Plus } from 'lucide-react';

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task | null;
    projectId: string;
    sprintId?: string;
    onSuccess: () => void;
}

export function TaskDialog({ open, onOpenChange, task, projectId, sprintId, onSuccess }: TaskDialogProps) {
    const { socket } = useSocket();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
    const [status, setStatus] = useState<TaskStatus>('todo');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [actualTime, setActualTime] = useState('');
    const [assignees, setAssignees] = useState<string[]>([]);
    const [reviewers, setReviewers] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        api.getUsers().then(setUsers).catch(console.error);
    }, []);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setAcceptanceCriteria(task.acceptanceCriteria);
            setStatus(task.status);
            setEstimatedTime(task.estimatedTime?.toString() || '');
            setActualTime(task.actualTime?.toString() || '');
            setAssignees(task.assignees.map((a) => a._id));
            setReviewers(task.reviewers.map((r) => r._id));
            setTags(task.tags);
        } else {
            resetForm();
        }
    }, [task, open]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setAcceptanceCriteria('');
        setStatus('todo');
        setEstimatedTime('');
        setActualTime('');
        setAssignees([]);
        setReviewers([]);
        setTags([]);
        setNewTag('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            const data = {
                title,
                description,
                acceptanceCriteria,
                status,
                estimatedTime: parseFloat(estimatedTime) || 0,
                actualTime: parseFloat(actualTime) || 0,
                assignees,
                reviewers,
                tags,
                projectId,
                ...(sprintId && { sprintId }),
            };

            if (task) {
                await api.updateTask(task._id, data);
                if (socket) {
                    socket.emit('task:update', { taskId: task._id, projectId });
                }
            } else {
                const newTask = await api.createTask(data);
                if (socket) {
                    socket.emit('task:create', newTask);
                }
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!task) return;

        setIsLoading(true);
        try {
            await api.deleteTask(task._id);
            if (socket) {
                socket.emit('task:delete', { taskId: task._id, projectId });
            }
            setDeleteDialogOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to delete task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const toggleUser = (userId: string, list: string[], setList: (v: string[]) => void) => {
        if (list.includes(userId)) {
            setList(list.filter((id) => id !== userId));
        } else {
            setList([...list, userId]);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Title *</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Task title"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the task..."
                                className="mt-1"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Acceptance Criteria</label>
                            <Textarea
                                value={acceptanceCriteria}
                                onChange={(e) => setAcceptanceCriteria(e.target.value)}
                                placeholder="- [ ] Criterion 1&#10;- [ ] Criterion 2"
                                className="mt-1 font-mono text-sm"
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Estimated (hours)</label>
                                <Input
                                    type="number"
                                    value={estimatedTime}
                                    onChange={(e) => setEstimatedTime(e.target.value)}
                                    placeholder="0"
                                    className="mt-1"
                                    min="0"
                                    step="0.5"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Actual (hours)</label>
                                <Input
                                    type="number"
                                    value={actualTime}
                                    onChange={(e) => setActualTime(e.target.value)}
                                    placeholder="0"
                                    className="mt-1"
                                    min="0"
                                    step="0.5"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Assignees</label>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {users.map((user) => (
                                    <Badge
                                        key={user._id}
                                        variant={assignees.includes(user._id) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => toggleUser(user._id, assignees, setAssignees)}
                                    >
                                        {user.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Reviewers</label>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {users.map((user) => (
                                    <Badge
                                        key={user._id}
                                        variant={reviewers.includes(user._id) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => toggleUser(user._id, reviewers, setReviewers)}
                                    >
                                        {user.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Tags</label>
                            <div className="mt-1 flex flex-wrap gap-2 mb-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeTag(tag)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add a tag"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <Button type="button" variant="outline" onClick={addTag}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            {task && (
                                <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={isLoading}>
                                    Delete
                                </Button>
                            )}
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading || !title.trim()}>
                                {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "<span className="font-medium text-foreground">{task?.title}</span>". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
