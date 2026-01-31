import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leanagile';

// First admin user - change these credentials
const ADMIN_USER = {
    name: 'Umer',
    email: 'admin@leanagile.dev',
    password: 'admin123'
};

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_USER.email });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists:', ADMIN_USER.email);
            process.exit(0);
        }

        // Create admin user
        const admin = new User(ADMIN_USER);
        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('   Email:', ADMIN_USER.email);
        console.log('   Password:', ADMIN_USER.password);
        console.log('\n   Use these credentials to login and create your team.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
