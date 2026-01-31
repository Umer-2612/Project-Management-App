import { Router, Response } from 'express';
import { Activity } from '../models/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get activities for a project
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, entityType, entityId, limit = 50 } = req.query;
        const query: any = {};

        if (projectId) query.projectId = projectId;
        if (entityType) query.entityType = entityType;
        if (entityId) query.entityId = entityId;

        const activities = await Activity.find(query)
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activities', error });
    }
});

// Get activities for current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { limit = 50 } = req.query;
        const activities = await Activity.find({ userId: req.userId })
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user activities', error });
    }
});

export default router;
