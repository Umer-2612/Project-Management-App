import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Sprint, Project, Activity, Retrospective } from '../models/index.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leanagile';
const PROJECT_ID = '6979ec819d9a3a68f77dc42d';
const USER_ID = '6979ec599d9a3a68f77dc429';

async function seedSprints() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const sprints = [
            {
                name: 'Sprint 1',
                startDate: new Date('2025-12-15'),
                endDate: new Date('2025-12-28'),
                status: 'completed',
                projectId: new mongoose.Types.ObjectId(PROJECT_ID),
                createdBy: new mongoose.Types.ObjectId(USER_ID),
                lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID)
            },
            {
                name: 'Sprint 2',
                startDate: new Date('2025-12-29'),
                endDate: new Date('2026-01-11'),
                status: 'completed',
                projectId: new mongoose.Types.ObjectId(PROJECT_ID),
                createdBy: new mongoose.Types.ObjectId(USER_ID),
                lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID)
            },
            {
                name: 'Sprint 3',
                startDate: new Date('2026-01-05'),
                endDate: new Date('2026-01-18'),
                status: 'completed',
                projectId: new mongoose.Types.ObjectId(PROJECT_ID),
                createdBy: new mongoose.Types.ObjectId(USER_ID),
                lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID)
            },
            {
                name: 'Sprint 4',
                startDate: new Date('2026-01-19'),
                endDate: new Date('2026-02-01'),
                status: 'active',
                projectId: new mongoose.Types.ObjectId(PROJECT_ID),
                createdBy: new mongoose.Types.ObjectId(USER_ID),
                lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID)
            },
            {
                name: 'Sprint 5',
                startDate: new Date('2026-02-02'),
                endDate: new Date('2026-02-15'),
                status: 'planning',
                projectId: new mongoose.Types.ObjectId(PROJECT_ID),
                createdBy: new mongoose.Types.ObjectId(USER_ID),
                lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID)
            },
            {
                name: 'Sprint 6',
                startDate: new Date('2026-02-16'),
                endDate: new Date('2026-03-01'),
                status: 'planning',
                projectId: new mongoose.Types.ObjectId(PROJECT_ID),
                createdBy: new mongoose.Types.ObjectId(USER_ID),
                lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID)
            },
            {
                name: 'Sprint 7',
                startDate: new Date('2026-03-02'),
                endDate: new Date('2026-03-15'),
                status: 'planning',
                projectId: new mongoose.Types.ObjectId(PROJECT_ID),
                createdBy: new mongoose.Types.ObjectId(USER_ID),
                lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID)
            }
        ];

        // Insert all sprints
        const result = await Sprint.insertMany(sprints);

        console.log(`✅ Created ${result.length} sprints successfully!`);

        // Create Activities and Retrospectives
        const activities = [];
        const retrospectives = [];

        for (const sprint of result) {
            console.log(`   - ${sprint.name} (${sprint.status}) - projectId: ${sprint.projectId}`);

            // Create Activity
            activities.push({
                action: 'created',
                entityType: 'sprint',
                entityId: sprint._id,
                entityName: sprint.name,
                projectId: sprint.projectId,
                userId: sprint.createdBy,
                createdAt: sprint.createdAt
            });

            // Create Retrospective
            retrospectives.push({
                sprintId: sprint._id,
                wentWell: [],
                didntGoWell: [],
                actionItems: [],
                lastUpdatedBy: sprint.createdBy,
                createdAt: sprint.createdAt
            });
        }

        if (activities.length > 0) {
            await Activity.insertMany(activities);
            console.log(`✅ Created ${activities.length} activity logs`);
        }

        if (retrospectives.length > 0) {
            await Retrospective.insertMany(retrospectives);
            console.log(`✅ Created ${retrospectives.length} retrospectives`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding sprints:', error);
        process.exit(1);
    }
}

seedSprints();
