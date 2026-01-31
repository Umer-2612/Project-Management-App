import { Router, Response } from 'express';
import { MoM } from '../models/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { logActivity } from '../utils/activityLogger.js';

const router = Router();

// Get MoMs by project
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.query;
        const query: any = {};
        if (projectId) query.projectId = projectId;

        const moms = await MoM.find(query)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ meetingDate: -1 });
        res.json(moms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching MoMs', error });
    }
});

// Get single MoM
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const mom = await MoM.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');
        if (!mom) {
            return res.status(404).json({ message: 'MoM not found' });
        }
        res.json(mom);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching MoM', error });
    }
});

// Create MoM
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const mom = new MoM({
            ...req.body,
            createdBy: req.userId,
            lastUpdatedBy: req.userId
        });
        await mom.save();

        // Log activity
        await logActivity({
            action: 'created',
            entityType: 'mom',
            entityId: mom._id,
            entityName: mom.title,
            projectId: mom.projectId,
            userId: req.userId!,
        });

        res.status(201).json(mom);
    } catch (error) {
        res.status(500).json({ message: 'Error creating MoM', error });
    }
});

// Update MoM
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const existingMoM = await MoM.findById(req.params.id);
        if (!existingMoM) {
            return res.status(404).json({ message: 'MoM not found' });
        }

        const mom = await MoM.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastUpdatedBy: req.userId, updatedAt: new Date() },
            { new: true }
        )
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');

        // Log activity
        await logActivity({
            action: 'updated',
            entityType: 'mom',
            entityId: mom!._id,
            entityName: mom!.title,
            projectId: mom!.projectId,
            userId: req.userId!,
        });

        res.json(mom);
    } catch (error) {
        res.status(500).json({ message: 'Error updating MoM', error });
    }
});

// Delete MoM
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const mom = await MoM.findById(req.params.id);
        if (!mom) {
            return res.status(404).json({ message: 'MoM not found' });
        }

        // Log activity before deleting
        await logActivity({
            action: 'deleted',
            entityType: 'mom',
            entityId: mom._id,
            entityName: mom.title,
            projectId: mom.projectId,
            userId: req.userId!,
        });

        await MoM.findByIdAndDelete(req.params.id);
        res.json({ message: 'MoM deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting MoM', error });
    }
});

export default router;
