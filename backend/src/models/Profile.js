import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  role: {
    type: String,
    required: false,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  experienceLevel: {
    type: String,
    required: false,
    enum: ['Any', 'Intern', 'Junior', 'Middle', 'Senior', 'Lead', ''],
    default: 'Any'
  },
  yearsOfExperience: {
    type: Number,
    required: false,
    default: 0
  },
  location: {
    type: String,
    default: ''
  },
  minSalary: {
    type: Number,
    default: 0
  },
  perferredCurrency: {
    type: String,
    enum: ['MDL', 'EUR', 'USD'],
    default: 'MDL'
  },
  preferredWorkplace: {
    type: [String],
    enum: ['Remote', 'Office', 'Hybrid', 'Travel'],
    default: []
  },
  preferredSchedule: {
    type: [String],
    enum: ['Full Time', 'Part Time', 'Shift Work', 'Freelance', 'Flexible'],
    default: []
  },
  education: {
    type: String,
    enum: ['Any', 'Higher', 'Secondary', 'Student', 'bachelors', 'masters', 'phd', 'college', 'none', ''],
    default: 'Any'
  },
  bio: {
    type: String,
    default: ''
  },
  searchPeriodDays: {
    type: Number,
    default: 7
  },
  telegramChatId: {
    type: String,
    default: ''
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
