import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Sprint, MoM, Retrospective, Activity } from '../models/index.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leanagile';
const PROJECT_ID = '6979ec819d9a3a68f77dc42d';
const USER_ID = '6979ec599d9a3a68f77dc429';

async function seedSprint1Data() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find Sprint 1
        const sprint1 = await Sprint.findOne({
            projectId: new mongoose.Types.ObjectId(PROJECT_ID),
            name: 'Sprint 1'
        });

        if (!sprint1) {
            console.log('❌ Sprint 1 not found. Run seedSprints.ts first.');
            process.exit(1);
        }
        console.log(`✅ Found Sprint 1: ${sprint1._id}`);

        // Meeting 1: Sprint Planning
        const meeting1 = {
            title: 'Sprint 1 Planning',
            content: `## Agenda
- Understand assignment scope and marking scheme
- Define Sprint 1 goal
- Decide initial system design approach
- Break down work into tickets

## Discussion Summary
The team reviewed customer requirements for the Adventure Booking System. The main focus was clarified to be DevOps practices and SDLC pipeline rather than feature-heavy development.

Sprint 1 will focus on building a minimal working prototype to validate CI/CD and change management.

### System Architecture (Finalized)
- React frontend
- Python FastAPI backend  
- MongoDB database

Customer data immutability and admin-only modification was highlighted for security.

## Decisions Made
- **Sprint 1 Goal**: "Deliver a basic booking system prototype with a working UI"
- Agile workflow with pull requests and peer reviews
- GitHub as central collaboration and source control tool

## Action Items
| Task | Owner |
|------|-------|
| Create backend project structure | Kaushik |
| Initialize frontend application | Alfiza |
| Set up GitHub repo & CI pipeline | Umer |
| Create Sprint 1 tickets | Umer |`,
            attendees: ['Alfiza', 'Kaushik', 'Umer'],
            meetingDate: new Date('2025-12-20'),
            projectId: new mongoose.Types.ObjectId(PROJECT_ID),
            createdBy: new mongoose.Types.ObjectId(USER_ID),
            lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID),
            createdAt: new Date('2025-12-20T10:00:00'),
            updatedAt: new Date('2025-12-20T10:45:00')
        };

        // Meeting 2: Mid-Sprint Sync
        const meeting2 = {
            title: 'Sprint 1 - Mid-Sprint Sync',
            content: `## Agenda
- Review progress on Sprint 1 tasks
- Identify blockers or risks
- Adjust scope if required

## Progress Update
- ✅ Backend structure using FastAPI initialized
- ✅ MongoDB connectivity established with environment variables
- ✅ Frontend React application set up
- 🚧 Booking form UI in progress
- ✅ GitHub repo structure finalized (main + dev branches)
- ✅ Initial GitHub Actions workflow created

Minor frontend-backend API alignment challenges discussed, no major blockers.

## Risks Identified
| Risk | Mitigation |
|------|------------|
| Scope creep if extra features added | Keep Sprint 1 scope minimal |
| Tight timeline for responsive Admin UI | Prioritize core functionality first |

## Action Items
| Task | Owner |
|------|-------|
| Finalize booking API endpoints | Kaushik |
| Complete User UI, start Admin UI | Alfiza |
| Improve code modularity | Umer |`,
            attendees: ['Alfiza', 'Kaushik', 'Umer'],
            meetingDate: new Date('2025-12-25'),
            projectId: new mongoose.Types.ObjectId(PROJECT_ID),
            createdBy: new mongoose.Types.ObjectId(USER_ID),
            lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID),
            createdAt: new Date('2025-12-25T10:00:00'),
            updatedAt: new Date('2025-12-25T10:30:00')
        };

        // Meeting 3: Sprint Review / Retrospective
        const meeting3 = {
            title: 'Sprint 1 - Review & Retrospective',
            content: `## Agenda
- Demo completed work
- Review Sprint 1 deliverables
- Conduct retrospective

## Sprint 1 Deliverables
- ✅ Basic booking system prototype
- ✅ Working user interface
- ✅ CI/CD pipeline operational
- ✅ GitHub workflow established

## Demo Summary
Team demonstrated the booking flow from user perspective. Admin UI showed basic functionality for managing bookings.

## Retrospective Notes
See Sprint 1 Retrospective board for detailed feedback.`,
            attendees: ['Alfiza', 'Kaushik', 'Umer'],
            meetingDate: new Date('2025-12-28'),
            projectId: new mongoose.Types.ObjectId(PROJECT_ID),
            createdBy: new mongoose.Types.ObjectId(USER_ID),
            lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID),
            createdAt: new Date('2025-12-28T10:00:00'),
            updatedAt: new Date('2025-12-28T10:30:00')
        };

        // Insert meetings
        const meetings = await MoM.insertMany([meeting1, meeting2, meeting3]);
        console.log(`✅ Created ${meetings.length} meeting minutes`);

        // Log activities for meetings
        const momActivities = meetings.map(mom => ({
            action: 'created',
            entityType: 'mom',
            entityId: mom._id,
            entityName: mom.title,
            projectId: mom.projectId,
            userId: mom.createdBy,
            createdAt: mom.createdAt
        }));
        await Activity.insertMany(momActivities);
        console.log(`✅ Created ${momActivities.length} activity logs for meetings`);

        // Update Sprint 1 Retrospective
        const retroUpdate = await Retrospective.findOneAndUpdate(
            { sprintId: sprint1._id },
            {
                wentWell: [
                    'Clear communication between team members',
                    'Successfully set up CI/CD pipeline on first attempt',
                    'Good task breakdown and ticket management',
                    'Effective use of pull request reviews',
                    'Met the Sprint 1 goal on time'
                ],
                didntGoWell: [
                    'Initial API alignment between frontend and backend took extra time',
                    'Some scope discussions could have been resolved earlier',
                    'Documentation started late in the sprint'
                ],
                actionItems: [
                    'Create API contract document before starting Sprint 2 development',
                    'Set up automated API documentation with Swagger',
                    'Begin documentation alongside development from Sprint 2'
                ],
                lastUpdatedBy: new mongoose.Types.ObjectId(USER_ID),
                updatedAt: new Date('2025-12-28T11:00:00')
            },
            { new: true }
        );

        if (retroUpdate) {
            console.log('✅ Updated Sprint 1 retrospective');
        } else {
            console.log('⚠️ Sprint 1 retrospective not found');
        }

        console.log('\n🎉 Sprint 1 data seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding Sprint 1 data:', error);
        process.exit(1);
    }
}

seedSprint1Data();
