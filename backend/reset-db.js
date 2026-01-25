import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Profile from './src/models/Profile.js';
import Vacancy from './src/models/Vacancy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const resetDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI missing');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    // Clear Collections
    await Profile.deleteMany({});
    console.log('🗑️  Profiles cleared');

    await Vacancy.deleteMany({});
    console.log('🗑️  Vacancies cleared');

    console.log('✅ Database reset complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting DB:', error);
    process.exit(1);
  }
};

resetDB();
