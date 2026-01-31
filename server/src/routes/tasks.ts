import { Router, Response } from 'express';
import { Task } from '../models/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { logActivity } from '../utils/activityLogger.js';

const router = Router();

// Get tasks (optionally filtered by project or sprint)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, sprintId, status } = req.query;
        const query: any = {};

        if (projectId) query.projectId = projectId;
        if (sprintId) query.sprintId = sprintId;
        if (status) query.status = status;

        const tasks = await Task.find(query)
            .populate('assignees', 'name email avatar')
            .populate('reviewers', 'name email avatar')
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
});

// Get backlog tasks (no sprint assigned)
router.get('/backlog/:projectId', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const tasks = await Task.find({
            projectId: req.params.projectId,
            sprintId: { $exists: false }
        })
            .populate('assignees', 'name email avatar')
            .populate('reviewers', 'name email avatar')
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching backlog', error });
    }
});

// Get single task
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignees', 'name email avatar')
            .populate('reviewers', 'name email avatar')
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching task', error });
    }
});

// Create task
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const task = new Task({
            ...req.body,
            createdBy: req.userId,
            lastUpdatedBy: req.userId
        });
        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('assignees', 'name email avatar')
            .populate('reviewers', 'name email avatar')
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');

        // Log activity
        await logActivity({
            action: 'created',
            entityType: 'task',
            entityId: task._id,
            entityName: task.title,
            projectId: task.projectId,
            userId: req.userId!,
        });

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error });
    }
});

// Update task
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const existingTask = await Task.findById(req.params.id);
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastUpdatedBy: req.userId, updatedAt: new Date() },
            { new: true }
        )
            .populate('assignees', 'name email avatar')
            .populate('reviewers', 'name email avatar')
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');

        // Log activity
        await logActivity({
            action: 'updated',
            entityType: 'task',
            entityId: existingTask._id,
            entityName: task!.title,
            projectId: existingTask.projectId,
            userId: req.userId!,
        });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
});

// Update task status
router.put('/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const existingTask = await Task.findById(req.params.id);
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const previousStatus = existingTask.status;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status, lastUpdatedBy: req.userId, updatedAt: new Date() },
            { new: true }
        )
            .populate('assignees', 'name email avatar')
            .populate('reviewers', 'name email avatar')
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');

        // Log activity
        await logActivity({
            action: 'status_changed',
            entityType: 'task',
            entityId: existingTask._id,
            entityName: task!.title,
            projectId: existingTask.projectId,
            userId: req.userId!,
            previousValue: previousStatus,
            newValue: status,
        });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task status', error });
    }
});

// Delete task
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await Task.findByIdAndDelete(req.params.id);

        // Log activity
        await logActivity({
            action: 'deleted',
            entityType: 'task',
            entityId: task._id,
            entityName: task.title,
            projectId: task.projectId,
            userId: req.userId!,
        });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
    }
});

export default router;
