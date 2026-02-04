import mongoose from 'mongoose';
import dotenv from 'dotenv';

import path from 'path';

// Load .env from project root (parent of server directory)
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDB = async (): Promise<void> => {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is not defined. Please check your .env file in the project root.');
        process.exit(1);
    }
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
