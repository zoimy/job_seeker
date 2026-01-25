import mongoose from 'mongoose';

const vacancySchema = new mongoose.Schema({
  vacancyId: {
    type: String,
    required: true,
    unique: true
  },
  firstSeen: {
    type: Date,
    default: Date.now
  },
  notifiedUsers: [{
    type: String // Legacy: List of User IDs (Simple strings)
  }],
  notificationLog: [{
    userId: { type: String, required: true },
    sentAt: { type: Date, default: Date.now }
  }],
  notifiedAt: {
    type: Date
  }
});

const Vacancy = mongoose.model('Vacancy', vacancySchema);

export default Vacancy;
