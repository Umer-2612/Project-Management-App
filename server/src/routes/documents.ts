import { Router, Response } from 'express';
import { WikiDocument } from '../models/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { logActivity } from '../utils/activityLogger.js';

const router = Router();

// Get documents by project
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.query;
        const query: any = {};
        if (projectId) query.projectId = projectId;

        const documents = await WikiDocument.find(query)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ updatedAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching documents', error });
    }
});

// Get single document
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const document = await WikiDocument.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching document', error });
    }
});

// Create document
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const document = new WikiDocument({
            ...req.body,
            createdBy: req.userId,
            lastUpdatedBy: req.userId
        });
        await document.save();

        // Log activity
        await logActivity({
            action: 'created',
            entityType: 'document',
            entityId: document._id,
            entityName: document.title,
            projectId: document.projectId,
            userId: req.userId!,
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: 'Error creating document', error });
    }
});

// Update document
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const existingDoc = await WikiDocument.findById(req.params.id);
        if (!existingDoc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const document = await WikiDocument.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastUpdatedBy: req.userId, updatedAt: new Date() },
            { new: true }
        )
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');

        // Log activity
        await logActivity({
            action: 'updated',
            entityType: 'document',
            entityId: document!._id,
            entityName: document!.title,
            projectId: document!.projectId,
            userId: req.userId!,
        });

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Error updating document', error });
    }
});

// Delete document
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const document = await WikiDocument.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Log activity before deleting
        await logActivity({
            action: 'deleted',
            entityType: 'document',
            entityId: document._id,
            entityName: document.title,
            projectId: document.projectId,
            userId: req.userId!,
        });

        await WikiDocument.findByIdAndDelete(req.params.id);
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting document', error });
    }
});

export default router;
