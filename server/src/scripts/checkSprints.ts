import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Sprint } from '../models/index.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leanagile';

async function checkSprints() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Show ALL sprints in the database
        const allSprints = await Sprint.find({});
        console.log(`\n📋 Total sprints in database: ${allSprints.length}`);
        allSprints.forEach((sprint: any) => {
            console.log(`   - ${sprint.name} (${sprint.status})`);
            console.log(`     projectId: ${sprint.projectId} (type: ${typeof sprint.projectId})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkSprints();
