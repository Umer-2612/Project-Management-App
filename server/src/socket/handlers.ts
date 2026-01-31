import { Server as SocketIOServer, Socket } from 'socket.io';
import { Task, Sprint, WikiDocument, Retrospective } from '../models/index.js';

export const setupSocketHandlers = (io: SocketIOServer) => {
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Join a project room
        socket.on('project:join', (projectId: string) => {
            socket.join(`project:${projectId}`);
            console.log(`Socket ${socket.id} joined project ${projectId}`);
        });

        // Leave a project room
        socket.on('project:leave', (projectId: string) => {
            socket.leave(`project:${projectId}`);
            console.log(`Socket ${socket.id} left project ${projectId}`);
        });

        // Task events
        socket.on('task:create', async (task) => {
            try {
                const populatedTask = await Task.findById(task._id)
                    .populate('assignees', 'name email avatar')
                    .populate('reviewers', 'name email avatar');
                io.to(`project:${task.projectId}`).emit('task:created', populatedTask);
            } catch (error) {
                console.error('Socket task:create error:', error);
            }
        });

        socket.on('task:update', async (data: { taskId: string; projectId: string }) => {
            try {
                const task = await Task.findById(data.taskId)
                    .populate('assignees', 'name email avatar')
                    .populate('reviewers', 'name email avatar');
                io.to(`project:${data.projectId}`).emit('task:updated', task);
            } catch (error) {
                console.error('Socket task:update error:', error);
            }
        });

        socket.on('task:delete', (data: { taskId: string; projectId: string }) => {
            io.to(`project:${data.projectId}`).emit('task:deleted', data.taskId);
        });

        // Sprint events
        socket.on('sprint:update', async (data: { sprintId: string; projectId: string }) => {
            try {
                const sprint = await Sprint.findById(data.sprintId);
                io.to(`project:${data.projectId}`).emit('sprint:updated', sprint);
            } catch (error) {
                console.error('Socket sprint:update error:', error);
            }
        });

        // Document events  
        socket.on('document:update', async (data: { documentId: string; projectId: string }) => {
            try {
                const document = await WikiDocument.findById(data.documentId);
                io.to(`project:${data.projectId}`).emit('document:updated', document);
            } catch (error) {
                console.error('Socket document:update error:', error);
            }
        });

        // Retrospective events
        socket.on('retrospective:update', async (data: { sprintId: string; projectId: string }) => {
            try {
                const retrospective = await Retrospective.findOne({ sprintId: data.sprintId });
                io.to(`project:${data.projectId}`).emit('retrospective:updated', retrospective);
            } catch (error) {
                console.error('Socket retrospective:update error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
};
