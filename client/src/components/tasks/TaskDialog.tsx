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
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden p-0 gap-0 border-white/10 bg-card/80 backdrop-blur-3xl flex flex-col">
                    <div className="h-full flex flex-col overflow-hidden">
                        <DialogHeader className="px-6 py-4 border-b border-white/5 flex-shrink-0 bg-white/5">
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent font-bold">
                                    {task ? 'Edit Mission' : 'New Mission'}
                                </span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <form id="task-form" onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Main Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="space-y-4">
                                        <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/5 space-y-3">
                                            <Input
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Mission Title"
                                                className="text-lg font-semibold bg-transparent border-none placeholder:text-muted-foreground/50 px-0 h-auto focus-visible:ring-0"
                                            />
                                            <div className="h-px bg-white/10 w-full" />
                                            <Textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="What needs to be done?"
                                                className="min-h-[100px] resize-none bg-transparent border-none focus-visible:ring-0 px-0 text-muted-foreground"
                                            />
                                        </div>

                                        <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/5 space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                Acceptance Criteria
                                            </label>
                                            <Textarea
                                                value={acceptanceCriteria}
                                                onChange={(e) => setAcceptanceCriteria(e.target.value)}
                                                placeholder="- [ ] Requirements..."
                                                className="min-h-[120px] font-mono text-sm bg-black/20 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500/30"
                                            />
                                        </div>

                                        <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/5">
                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 block">
                                                Tags
                                            </label>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {tags.map((tag) => (
                                                    <Badge key={tag} variant="outline" className="gap-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors pl-2.5 pr-1 py-1">
                                                        {tag}
                                                        <div className="hover:bg-primary/30 rounded-full p-0.5" onClick={() => removeTag(tag)}>
                                                            <X className="h-3 w-3 cursor-pointer" />
                                                        </div>
                                                    </Badge>
                                                ))}
                                                {tags.length === 0 && <span className="text-sm text-muted-foreground italic">No tags added</span>}
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    placeholder="Type and press Enter to add tag..."
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                    className="pl-9 bg-black/20 border-white/5"
                                                />
                                                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Meta & People */}
                                <div className="space-y-6">
                                    <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/5 space-y-4">
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                                                Status
                                            </label>
                                            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                                                <SelectTrigger className="w-full bg-black/20 border-white/5">
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

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
                                                    Est. Hours
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={estimatedTime}
                                                    onChange={(e) => setEstimatedTime(e.target.value)}
                                                    className="bg-black/20 border-white/5 text-center"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
                                                    Act. Hours
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={actualTime}
                                                    onChange={(e) => setActualTime(e.target.value)}
                                                    className="bg-black/20 border-white/5 text-center"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.5"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/5 space-y-4">
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex justify-between items-center">
                                                Assignees
                                                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{assignees.length}</span>
                                            </label>
                                            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar p-1">
                                                {users.map((user) => (
                                                    <Badge
                                                        key={user._id}
                                                        variant={assignees.includes(user._id) ? 'default' : 'secondary'}
                                                        className={`cursor-pointer transition-all ${assignees.includes(user._id) ? 'hover:bg-primary/90' : 'hover:bg-white/20'}`}
                                                        onClick={() => toggleUser(user._id, assignees, setAssignees)}
                                                    >
                                                        {user.name.split(' ')[0]}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-px bg-white/5" />

                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex justify-between items-center">
                                                Reviewers
                                                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">{reviewers.length}</span>
                                            </label>
                                            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar p-1">
                                                {users.map((user) => (
                                                    <Badge
                                                        key={user._id}
                                                        variant={reviewers.includes(user._id) ? 'default' : 'secondary'} // You might want a purple variant for reviewers later
                                                        className={`cursor-pointer transition-all ${reviewers.includes(user._id) ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-white/20'}`}
                                                        onClick={() => toggleUser(user._id, reviewers, setReviewers)}
                                                    >
                                                        {user.name.split(' ')[0]}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <DialogFooter className="px-6 py-4 border-t border-white/5 bg-black/20 flex-shrink-0 flex items-center justify-between">
                            {task ? (
                                <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteDialogOpen(true)} disabled={isLoading}>
                                    Delete Mission
                                </Button>
                            ) : <div />}
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 hover:bg-white/5">
                                    Cancel
                                </Button>
                                <Button type="submit" form="task-form" disabled={isLoading || !title.trim()} className="px-8 font-semibold">
                                    {isLoading ? 'Saving...' : task ? 'Update Mission' : 'Create Mission'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
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
