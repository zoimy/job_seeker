import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  experienceLevel: {
    type: String,
    default: 'Any'
  },
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  education: {
    type: String,
    default: 'Any'
  },
  skills: [{
    type: String
  }],
  minSalary: {
    type: Number,
    default: 0
  },
  perferredCurrency: {
    type: String,
    default: 'MDL'
  },
  location: {
    type: String,
    default: ''
  },
  preferredWorkplace: [{
    type: String,
    enum: ['remote', 'office', 'hybrid', 'travel', 'any']
  }],
  preferredSchedule: [{
    type: String,
    enum: ['full time', 'part time', 'shift work', 'freelance', 'flexible', 'any']
  }],
  searchPeriodDays: {
    type: Number,
    default: 1
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  scanFrequency: {
    type: String,
    enum: ['instant', '5min', '1h', '6h', '24h'],
    default: '6h'
  },
  telegramChatId: {
    type: String,
    default: ''
  },
  minMatchScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  lastScraped: {
    type: Date
  }
}, {
  timestamps: true
});

// Note: userId already has index: true in field definition above
// No need for separate index() call to avoid duplicate warning

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
