import { Router, Response } from 'express';
import { Retrospective } from '../models/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get retrospective by sprint ID
router.get('/:sprintId', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const retrospective = await Retrospective.findOne({
            sprintId: req.params.sprintId
        }).populate('lastUpdatedBy', 'name email');

        if (!retrospective) {
            return res.status(404).json({ message: 'Retrospective not found' });
        }
        res.json(retrospective);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching retrospective', error });
    }
});

// Update retrospective
router.put('/:sprintId', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const retrospective = await Retrospective.findOneAndUpdate(
            { sprintId: req.params.sprintId },
            { ...req.body, lastUpdatedBy: req.userId, updatedAt: new Date() },
            { new: true, upsert: true }
        ).populate('lastUpdatedBy', 'name email');
        res.json(retrospective);
    } catch (error) {
        res.status(500).json({ message: 'Error updating retrospective', error });
    }
});

// Add item to retrospective column
router.post('/:sprintId/items', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { column, item } = req.body; // column: 'wentWell' | 'didntGoWell' | 'actionItems'
        const updateField = { [`${column}`]: item };

        const retrospective = await Retrospective.findOneAndUpdate(
            { sprintId: req.params.sprintId },
            {
                $push: updateField,
                lastUpdatedBy: req.userId,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('lastUpdatedBy', 'name email');

        if (!retrospective) {
            return res.status(404).json({ message: 'Retrospective not found' });
        }
        res.json(retrospective);
    } catch (error) {
        res.status(500).json({ message: 'Error adding item', error });
    }
});

// Remove item from retrospective column
router.delete('/:sprintId/items', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { column, item } = req.body;
        const updateField = { [`${column}`]: item };

        const retrospective = await Retrospective.findOneAndUpdate(
            { sprintId: req.params.sprintId },
            {
                $pull: updateField,
                lastUpdatedBy: req.userId,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('lastUpdatedBy', 'name email');

        if (!retrospective) {
            return res.status(404).json({ message: 'Retrospective not found' });
        }
        res.json(retrospective);
    } catch (error) {
        res.status(500).json({ message: 'Error removing item', error });
    }
});

export default router;
