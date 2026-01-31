import { Router, Response } from 'express';
import { Project, Task, Sprint, WikiDocument, MoM, Retrospective, Activity } from '../models/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { logActivity } from '../utils/activityLogger.js';

const router = Router();

// Get all projects
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const projects = await Project.find()
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
});

// Get single project
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project', error });
    }
});

// Create project
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const project = new Project({
            ...req.body,
            createdBy: req.userId,
            lastUpdatedBy: req.userId
        });
        await project.save();

        // Log activity
        await logActivity({
            action: 'created',
            entityType: 'project',
            entityId: project._id,
            entityName: project.name,
            projectId: project._id,
            userId: req.userId!,
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error });
    }
});

// Update project
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                lastUpdatedBy: req.userId,
                updatedAt: new Date()
            },
            { new: true }
        )
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Log activity
        await logActivity({
            action: 'updated',
            entityType: 'project',
            entityId: project._id,
            entityName: project.name,
            projectId: project._id,
            userId: req.userId!,
        });

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error updating project', error });
    }
});

// Delete project
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Delete all related data
        await Task.deleteMany({ projectId: req.params.id });
        await Sprint.deleteMany({ projectId: req.params.id });
        await WikiDocument.deleteMany({ projectId: req.params.id });
        await MoM.deleteMany({ projectId: req.params.id });
        await Activity.deleteMany({ projectId: req.params.id });

        // Delete retrospectives for sprints in this project
        const sprints = await Sprint.find({ projectId: req.params.id });
        const sprintIds = sprints.map(s => s._id);
        await Retrospective.deleteMany({ sprintId: { $in: sprintIds } });

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project', error });
    }
});

export default router;
