import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { setupSocketHandlers } from './socket/handlers.js';
import authRoutes from './routes/auth.js';
import {
    projectRoutes,
    taskRoutes,
    sprintRoutes,
    retrospectiveRoutes,
    documentRoutes,
    momRoutes,
    userRoutes,
    activityRoutes
} from './routes/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.io setup
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Middleware
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/retrospectives', retrospectiveRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/moms', momRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Socket.io handlers
setupSocketHandlers(io);

// Start server
const startServer = async () => {
    await connectDB();

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`🔌 Socket.io ready for connections`);
    });
};

startServer();
