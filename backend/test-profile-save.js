import  mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Profile from './src/models/Profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const testSave = async () => {
    await connectDB();

    try {
        console.log('Attempting to find or create profile...');
        let profile = await Profile.findOne();
        if (!profile) {
            console.log('No profile found, creating empty one');
            profile = new Profile({});
        } else {
            console.log('Profile found');
        }

        // Simulate updates from onboarding
        profile.telegramChatId = '123456';
        profile.notificationsEnabled = true;
        
        console.log('Saving profile...');
        await profile.save();
        console.log('Profile saved successfully!');

    } catch (error) {
        console.error('Save failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testSave();
