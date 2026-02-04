import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface ProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ProjectDialog({ open, onOpenChange, onSuccess }: ProjectDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            await api.createProject({ name, description });
            setName('');
            setDescription('');
            onSuccess();
        } catch (error) {
            console.error('Failed to create project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent font-bold">
                            Create New Project
                        </span>
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Project Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Website Redesign"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the project..."
                            className="mt-1"
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !name.trim()}>
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
