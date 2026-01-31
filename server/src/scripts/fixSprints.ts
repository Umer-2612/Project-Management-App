import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Sprint } from '../models/index.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leanagile';
const PROJECT_ID = new mongoose.Types.ObjectId('6979ec819d9a3a68f77dc42d');

async function fixSprints() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Update all sprints with string projectId to use ObjectId
        const result = await Sprint.updateMany(
            { projectId: '6979ec819d9a3a68f77dc42d' },
            { $set: { projectId: PROJECT_ID } }
        );

        console.log(`✅ Updated ${result.modifiedCount} sprints with correct ObjectId`);

        // Show all sprints
        const sprints = await Sprint.find({ projectId: PROJECT_ID });
        console.log(`\n📋 Total sprints for project: ${sprints.length}`);
        sprints.forEach((sprint: any) => {
            console.log(`   - ${sprint.name} (${sprint.status}) - projectId: ${sprint.projectId}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing sprints:', error);
        process.exit(1);
    }
}

fixSprints();
