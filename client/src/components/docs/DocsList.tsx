import { useState, useEffect } from 'react';
import { WikiDocument } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Plus, FileText, Trash2, Save } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

export function DocsList() {
    const { currentProject } = useProject();
    const [docs, setDocs] = useState<WikiDocument[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<WikiDocument | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<WikiDocument | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your documentation...',
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-sm dark:prose-invert max-w-none',
            },
        },
    });

    const fetchDocs = async () => {
        if (!currentProject) return;
        try {
            const data = await api.getDocuments(currentProject._id);
            setDocs(data);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, [currentProject?._id]);

    useEffect(() => {
        if (selectedDoc && editor) {
            setTitle(selectedDoc.title);
            editor.commands.setContent(selectedDoc.content);
        }
    }, [selectedDoc, editor]);

    const createNewDoc = async () => {
        if (!currentProject) return;
        try {
            const doc = await api.createDocument({
                title: 'Untitled Document',
                content: '',
                projectId: currentProject._id,
            });
            setDocs([doc, ...docs]);
            setSelectedDoc(doc);
            setIsEditing(true);
            setTitle('Untitled Document');
            editor?.commands.setContent('');
        } catch (error) {
            console.error('Failed to create document:', error);
        }
    };

    const saveDoc = async () => {
        if (!selectedDoc || !editor) return;
        setIsSaving(true);
        try {
            const updated = await api.updateDocument(selectedDoc._id, {
                title,
                content: editor.getHTML(),
            });
            setDocs(docs.map((d) => (d._id === updated._id ? updated : d)));
            setSelectedDoc(updated);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save document:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (doc: WikiDocument, e: React.MouseEvent) => {
        e.stopPropagation();
        setDocToDelete(doc);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!docToDelete) return;
        try {
            await api.deleteDocument(docToDelete._id);
            setDocs(docs.filter((d) => d._id !== docToDelete._id));
            if (selectedDoc?._id === docToDelete._id) {
                setSelectedDoc(null);
                setTitle('');
                editor?.commands.setContent('');
            }
        } catch (error) {
            console.error('Failed to delete document:', error);
        } finally {
            setDeleteDialogOpen(false);
            setDocToDelete(null);
        }
    };

    if (!currentProject) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a project to view documents
            </div>
        );
    }

    return (
        <>
            <div className="flex h-full gap-6">
                {/* Document list sidebar */}
                <div className="w-72 shrink-0 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Docs</h2>
                        <Button size="sm" onClick={createNewDoc}>
                            <Plus className="mr-1 h-4 w-4" />
                            New Doc
                        </Button>
                    </div>

                    <ScrollArea className="h-[calc(100vh-200px)]">
                        <div className="space-y-2 pr-4">
                            {docs.map((doc) => (
                                <Card
                                    key={doc._id}
                                    className={`cursor-pointer transition-colors group ${selectedDoc?._id === doc._id ? 'border-primary' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedDoc(doc);
                                        setIsEditing(false);
                                    }}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex items-start gap-2">
                                            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate">{doc.title}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Updated {formatDate(doc.updatedAt)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => handleDeleteClick(doc, e)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {docs.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-8">
                                    No documents yet
                                </p>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Editor area */}
                <div className="flex-1 flex flex-col">
                    {selectedDoc ? (
                        <>
                            <div className="flex items-center gap-4 mb-4">
                                <Input
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        setIsEditing(true);
                                    }}
                                    className="text-lg font-medium"
                                    placeholder="Document title"
                                />
                                <Button onClick={saveDoc} disabled={isSaving || !isEditing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                            </div>

                            <Card className="flex-1 overflow-hidden">
                                <CardContent className="p-0 h-full">
                                    <ScrollArea className="h-full">
                                        <EditorContent
                                            editor={editor}
                                            className="min-h-[400px]"
                                            onFocus={() => setIsEditing(true)}
                                        />
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Select a document or create a new one
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete document?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "<span className="font-medium text-foreground">{docToDelete?.title}</span>". This action cannot be undone.
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
