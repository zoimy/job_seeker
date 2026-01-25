import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Profile from './src/models/Profile.js';
import Vacancy from './src/models/Vacancy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const resetForOnboarding = async () => {
  try {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI missing');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    // Clear Collections
    await Profile.deleteMany({});
    console.log('🗑️  Profile cleared');

    await Vacancy.deleteMany({});
    console.log('🗑️  Vacancy history cleared');

    console.log('\n✅ Database reset complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Open your browser DevTools (F12)');
    console.log('   2. Go to Application → Local Storage');
    console.log('   3. Clear all items (or delete "onboarding_complete" key)');
    console.log('   4. Refresh the page');
    console.log('   5. You will see the onboarding flow!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting:', error);
    process.exit(1);
  }
};

resetForOnboarding();
