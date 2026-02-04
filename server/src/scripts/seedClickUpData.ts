import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Sprint } from '../models/Sprint.js';
import { Task } from '../models/Task.js';
import { MoM } from '../models/MoM.js';

// Load .env from project root
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined.');
    process.exit(1);
}

const DATA_FILE = path.join(process.cwd(), 'src/scripts/data/clickup_tasks.json');

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Connection error:', error);
        process.exit(1);
    }
}

function parseDate(dateStr: string): Date {
    // Format: DD/MM/YYYY
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

async function seedData() {
    await connectDB();

    try {
        if (!fs.existsSync(DATA_FILE)) {
            console.error('❌ Data file not found:', DATA_FILE);
            process.exit(1);
        }

        const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
        const itemsData = JSON.parse(rawData);

        console.log(`📦 Loaded ${itemsData.length} items from JSON.`);

        // 1. Ensure Admin User
        let adminUser = await User.findOne({ email: 'admin@leanagile.dev' });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'Admin',
                email: 'admin@leanagile.dev',
                password: 'admin123' // Hash middleware will handle this
            });
            console.log('✅ Created Admin User');
        }

        // 2. Ensure Project
        let project = await Project.findOne({ name: 'DevOps Project 2025-26' });
        if (!project) {
            project = await Project.create({
                name: 'DevOps Project 2025-26',
                description: 'Imported from ClickUp',
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            });
            console.log('✅ Created Project');
        }

        // Cache strategies
        const sprintCache = new Map<string, any>();
        const userCache = new Map<string, any>();
        userCache.set(adminUser.email, adminUser);

        let createdTasks = 0;
        let createdMoMs = 0;
        let createdSprints = 0;
        let createdUsers = 0;

        for (const item of itemsData) {
            // Context Helpers
            const folderName = item.folder?.name || '';
            const listName = item.list?.name || '';
            const isMoM = folderName === 'MoMs' || listName === 'MoMs'; // Adjust based on actual structure

            // 3. Handle Assignees (Users)
            const assigneeIds: any[] = [];
            const attendeeNames: string[] = []; // For MoMs

            for (const assignee of item.assignees) {
                if (!assignee.email) continue;
                attendeeNames.push(assignee.username); // Store name for MoM

                let user = userCache.get(assignee.email);
                if (!user) {
                    user = await User.findOne({ email: assignee.email });
                    if (!user) {
                        user = await User.create({
                            name: assignee.username || 'User',
                            email: assignee.email,
                            password: 'password123',
                            avatar: assignee.profilePicture
                        });
                        createdUsers++;
                        console.log(`   👤 Created User: ${user.name}`);
                    }
                    userCache.set(assignee.email, user);
                }
                assigneeIds.push(user._id);
            }

            const itemCreator = userCache.get(item.creator?.email) || adminUser;

            // 4. Handle MoMs
            if (isMoM) {
                await MoM.findOneAndUpdate(
                    { title: item.name, projectId: project._id },
                    {
                        title: item.name,
                        content: item.text_content || item.description || '',
                        attendees: attendeeNames,
                        meetingDate: new Date(parseInt(item.date_created)),
                        projectId: project._id,
                        createdBy: itemCreator._id,
                        lastUpdatedBy: itemCreator._id,
                        createdAt: new Date(parseInt(item.date_created)),
                        updatedAt: new Date(parseInt(item.date_updated))
                    },
                    { upsert: true, new: true }
                );
                createdMoMs++;
                continue; // Skip Task/Sprint logic for MoMs
            }

            // 5. Handle Sprints (Only if in Sprints folder)
            let sprintId = null;
            if (folderName === 'Sprints') {
                // Parse List name: "Sprint 1 - (15/12/2025 - 28/12/2025)"
                const sprintMatch = listName.match(/Sprint (\d+) - \((\d{2}\/\d{2}\/\d{4}) - (\d{2}\/\d{2}\/\d{4})\)/);

                if (sprintMatch) {
                    const sprintName = `Sprint ${sprintMatch[1]}`;
                    const startDate = parseDate(sprintMatch[2]);
                    const endDate = parseDate(sprintMatch[3]);

                    let sprint = sprintCache.get(sprintName);
                    if (!sprint) {
                        sprint = await Sprint.findOne({ name: sprintName, projectId: project._id });
                        if (!sprint) {
                            // Calculate status based on dates
                            const now = new Date();
                            let status = 'planning';
                            if (now > endDate) status = 'completed';
                            else if (now >= startDate && now <= endDate) status = 'active';

                            sprint = await Sprint.create({
                                name: sprintName,
                                startDate,
                                endDate,
                                status,
                                projectId: project._id,
                                createdBy: adminUser._id
                            });
                            createdSprints++;
                            console.log(`   🏃 Created Sprint: ${sprint.name}`);
                        }
                        sprintCache.set(sprintName, sprint);
                    }
                    sprintId = sprint._id;
                }
            }

            // 6. Map Status
            let status = 'todo';
            const clickupStatus = item.status?.status?.toLowerCase() || 'todo';

            if (['completed', 'closed', 'done'].includes(clickupStatus)) status = 'done';
            else if (['in progress', 'active', 'monitor'].includes(clickupStatus)) status = 'in-progress';
            else if (['review', 'testing', 'code review'].includes(clickupStatus)) status = 'review';

            // 7. Upsert Task
            await Task.findOneAndUpdate(
                { title: item.name, projectId: project._id },
                {
                    title: item.name,
                    description: item.text_content || item.description || '',
                    status,
                    assignees: assigneeIds,
                    projectId: project._id,
                    sprintId, // Will be null for Backlog items (not in Sprint folder)
                    createdBy: itemCreator._id,
                    lastUpdatedBy: itemCreator._id,
                    createdAt: new Date(parseInt(item.date_created)),
                    updatedAt: new Date(parseInt(item.date_updated))
                },
                { upsert: true, new: true }
            );
            createdTasks++;
        }

        console.log('\n✅ Seeding Complete!');
        console.log(`   - Users Created: ${createdUsers}`);
        console.log(`   - Sprints Mapped/Created: ${createdSprints} (Unique found in this run: ${sprintCache.size})`);
        console.log(`   - MoMs Created: ${createdMoMs}`);
        console.log(`   - Tasks Processed: ${createdTasks}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedData();
