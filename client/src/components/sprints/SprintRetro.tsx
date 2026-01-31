import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sprint, Retrospective } from '@/types';
import { api } from '@/lib/api';
import { Plus, X, ThumbsUp, ThumbsDown, Target } from 'lucide-react';

interface SprintRetroProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sprint: Sprint;
}

type RetroColumn = 'wentWell' | 'didntGoWell' | 'actionItems';

const columnConfig: { key: RetroColumn; title: string; icon: any; color: string }[] = [
    { key: 'wentWell', title: 'What Went Well', icon: ThumbsUp, color: 'text-green-500' },
    { key: 'didntGoWell', title: "What Didn't Go Well", icon: ThumbsDown, color: 'text-red-500' },
    { key: 'actionItems', title: 'Action Items', icon: Target, color: 'text-blue-500' },
];

export function SprintRetro({ open, onOpenChange, sprint }: SprintRetroProps) {
    const [retro, setRetro] = useState<Retrospective | null>(null);
    const [newItems, setNewItems] = useState<Record<RetroColumn, string>>({
        wentWell: '',
        didntGoWell: '',
        actionItems: '',
    });

    useEffect(() => {
        if (open && sprint) {
            fetchRetro();
        }
    }, [open, sprint._id]);

    const fetchRetro = async () => {
        try {
            const data = await api.getRetrospective(sprint._id);
            setRetro(data);
        } catch (error) {
            console.error('Failed to fetch retrospective:', error);
        }
    };

    const addItem = async (column: RetroColumn) => {
        const item = newItems[column].trim();
        if (!item) return;

        try {
            const updated = await api.addRetroItem(sprint._id, column, item);
            setRetro(updated);
            setNewItems({ ...newItems, [column]: '' });
        } catch (error) {
            console.error('Failed to add item:', error);
        }
    };

    const removeItem = async (column: RetroColumn, item: string) => {
        try {
            const updated = await api.removeRetroItem(sprint._id, column, item);
            setRetro(updated);
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Sprint Retrospective: {sprint.name}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4">
                    {columnConfig.map(({ key, title, icon: Icon, color }) => (
                        <Card key={key} className="flex flex-col">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Icon className={`h-5 w-5 ${color}`} />
                                    {title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <ScrollArea className="flex-1 max-h-[300px] mb-3">
                                    <div className="space-y-2 pr-2">
                                        {retro?.[key]?.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-2 rounded-lg bg-muted p-2 text-sm"
                                            >
                                                <span className="flex-1">{item}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 shrink-0"
                                                    onClick={() => removeItem(key, item)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {(!retro?.[key] || retro[key].length === 0) && (
                                            <p className="text-center text-sm text-muted-foreground py-4">
                                                No items yet
                                            </p>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="flex gap-2">
                                    <Input
                                        value={newItems[key]}
                                        onChange={(e) => setNewItems({ ...newItems, [key]: e.target.value })}
                                        placeholder="Add item..."
                                        onKeyDown={(e) => e.key === 'Enter' && addItem(key)}
                                    />
                                    <Button size="icon" onClick={() => addItem(key)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
