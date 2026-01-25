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
    type: String // List of User IDs who have been notified
  }],
  notifiedAt: {
    type: Date
  }
});

const Vacancy = mongoose.model('Vacancy', vacancySchema);

export default Vacancy;
