import { Router, Response } from 'express';
import { Sprint, Retrospective, Task } from '../models/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { logActivity } from '../utils/activityLogger.js';

const router = Router();

// Get sprints by project
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.query;
        const query: any = {};
        if (projectId) query.projectId = projectId;

        const sprints = await Sprint.find(query)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ startDate: -1 });
        res.json(sprints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sprints', error });
    }
});

// Get single sprint
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const sprint = await Sprint.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }
        res.json(sprint);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sprint', error });
    }
});

// Create sprint
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const sprint = new Sprint({
            ...req.body,
            createdBy: req.userId,
            lastUpdatedBy: req.userId
        });
        await sprint.save();

        // Create associated retrospective
        const retrospective = new Retrospective({
            sprintId: sprint._id,
            wentWell: [],
            didntGoWell: [],
            actionItems: []
        });
        await retrospective.save();

        // Log activity
        await logActivity({
            action: 'created',
            entityType: 'sprint',
            entityId: sprint._id,
            entityName: sprint.name,
            projectId: sprint.projectId,
            userId: req.userId!,
        });

        res.status(201).json(sprint);
    } catch (error) {
        res.status(500).json({ message: 'Error creating sprint', error });
    }
});

// Update sprint
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const existingSprint = await Sprint.findById(req.params.id);
        if (!existingSprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const previousStatus = existingSprint.status;
        const sprint = await Sprint.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastUpdatedBy: req.userId },
            { new: true }
        )
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');

        // Log activity
        const action = previousStatus !== sprint!.status ? 'status_changed' : 'updated';
        await logActivity({
            action,
            entityType: 'sprint',
            entityId: sprint!._id,
            entityName: sprint!.name,
            projectId: sprint!.projectId,
            userId: req.userId!,
            previousValue: previousStatus !== sprint!.status ? previousStatus : undefined,
            newValue: previousStatus !== sprint!.status ? sprint!.status : undefined,
        });

        res.json(sprint);
    } catch (error) {
        res.status(500).json({ message: 'Error updating sprint', error });
    }
});

// Assign tasks to sprint
router.put('/:id/tasks', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { taskIds } = req.body;
        const sprint = await Sprint.findById(req.params.id);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        await Task.updateMany(
            { _id: { $in: taskIds } },
            { sprintId: req.params.id, lastUpdatedBy: req.userId, updatedAt: new Date() }
        );

        // Log activity for each task moved
        const tasks = await Task.find({ _id: { $in: taskIds } });
        for (const task of tasks) {
            await logActivity({
                action: 'moved_to_sprint',
                entityType: 'task',
                entityId: task._id,
                entityName: task.title,
                projectId: task.projectId,
                userId: req.userId!,
                details: `Moved to ${sprint.name}`,
            });
        }

        const updatedTasks = await Task.find({ sprintId: req.params.id })
            .populate('assignees', 'name email avatar')
            .populate('reviewers', 'name email avatar');
        res.json(updatedTasks);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning tasks to sprint', error });
    }
});

// Remove task from sprint (move to backlog)
router.delete('/:id/tasks/:taskId', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (task) {
            await Task.findByIdAndUpdate(req.params.taskId, {
                $unset: { sprintId: 1 },
                lastUpdatedBy: req.userId,
                updatedAt: new Date()
            });

            // Log activity
            await logActivity({
                action: 'moved_to_backlog',
                entityType: 'task',
                entityId: task._id,
                entityName: task.title,
                projectId: task.projectId,
                userId: req.userId!,
            });
        }
        res.json({ message: 'Task removed from sprint' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing task from sprint', error });
    }
});

// Delete sprint
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const sprint = await Sprint.findById(req.params.id);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        // Move all tasks back to backlog
        await Task.updateMany(
            { sprintId: req.params.id },
            { $unset: { sprintId: 1 }, lastUpdatedBy: req.userId }
        );

        // Delete retrospective
        await Retrospective.findOneAndDelete({ sprintId: req.params.id });

        // Log activity before deleting
        await logActivity({
            action: 'deleted',
            entityType: 'sprint',
            entityId: sprint._id,
            entityName: sprint.name,
            projectId: sprint.projectId,
            userId: req.userId!,
        });

        // Delete sprint
        await Sprint.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sprint deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting sprint', error });
    }
});

export default router;
