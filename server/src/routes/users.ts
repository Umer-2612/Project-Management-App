import { Router, Response } from 'express';
import { User } from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

const DEFAULT_PASSWORD = 'Welcome@123';

// Get all users
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Create new user with default password
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create user with default password
        const user = new User({
            name,
            email,
            password: DEFAULT_PASSWORD
        });
        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Delete user
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        // Can't delete yourself
        if (req.params.id === req.userId) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

export default router;
