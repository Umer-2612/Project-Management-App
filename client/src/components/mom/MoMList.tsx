import { useState, useEffect } from 'react';
import { MoM, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Calendar, Users, Trash2 } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export function MoMList() {
    const { currentProject } = useProject();
    const [moms, setMoMs] = useState<MoM[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedMoM, setSelectedMoM] = useState<MoM | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [momToDelete, setMomToDelete] = useState<MoM | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [attendees, setAttendees] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMoMs = async () => {
        if (!currentProject) return;
        try {
            const data = await api.getMoMs(currentProject._id);
            setMoMs(data);
        } catch (error) {
            console.error('Failed to fetch MoMs:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    useEffect(() => {
        fetchMoMs();
        fetchUsers();
    }, [currentProject?._id]);

    const openDialog = (mom?: MoM) => {
        if (mom) {
            setTitle(mom.title);
            setContent(mom.content);
            setMeetingDate(mom.meetingDate.split('T')[0]);
            setAttendees(mom.attendees);
            setSelectedMoM(mom);
        } else {
            setTitle('');
            setContent('');
            setMeetingDate(new Date().toISOString().split('T')[0]);
            setAttendees([]);
            setSelectedMoM(null);
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProject || !title.trim() || !meetingDate) return;

        setIsLoading(true);
        try {
            const data = {
                title,
                content,
                meetingDate,
                attendees,
                projectId: currentProject._id,
            };

            if (selectedMoM) {
                await api.updateMoM(selectedMoM._id, data);
            } else {
                await api.createMoM(data);
            }
            fetchMoMs();
            setDialogOpen(false);
        } catch (error) {
            console.error('Failed to save MoM:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (mom: MoM, e: React.MouseEvent) => {
        e.stopPropagation();
        setMomToDelete(mom);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!momToDelete) return;
        try {
            await api.deleteMoM(momToDelete._id);
            setMoMs(moms.filter((m) => m._id !== momToDelete._id));
        } catch (error) {
            console.error('Failed to delete MoM:', error);
        } finally {
            setDeleteDialogOpen(false);
            setMomToDelete(null);
        }
    };

    const toggleAttendee = (userId: string) => {
        if (attendees.includes(userId)) {
            setAttendees(attendees.filter((a) => a !== userId));
        } else {
            setAttendees([...attendees, userId]);
        }
    };

    const getAttendeeName = (userId: string) => {
        const user = users.find((u) => u._id === userId);
        return user?.name || userId;
    };

    if (!currentProject) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a project to view meeting minutes
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Minutes of Meeting</h2>
                    <Button onClick={() => openDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        New MoM
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {moms.map((mom) => (
                        <Card key={mom._id} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => openDialog(mom)}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-base">{mom.title}</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleDeleteClick(mom, e)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(mom.meetingDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                    <Users className="h-4 w-4" />
                                    <span>{mom.attendees.length} attendees</span>
                                </div>
                                {mom.content && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {mom.content}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {moms.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        No meeting minutes yet. Record your first meeting!
                    </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedMoM ? 'Edit Meeting Minutes' : 'New Meeting Minutes'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Meeting title"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Date</label>
                                    <Input
                                        type="date"
                                        value={meetingDate}
                                        onChange={(e) => setMeetingDate(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Attendees</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {users.map((user) => (
                                        <Badge
                                            key={user._id}
                                            variant={attendees.includes(user._id) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => toggleAttendee(user._id)}
                                        >
                                            {user.name}
                                        </Badge>
                                    ))}
                                </div>
                                {users.length === 0 && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        No users found. Create users in the Team page.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Meeting notes, decisions, action items..."
                                    className="mt-1"
                                    rows={8}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading || !title.trim() || !meetingDate}>
                                    {isLoading ? 'Saving...' : selectedMoM ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete meeting minutes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "<span className="font-medium text-foreground">{momToDelete?.title}</span>". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
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
