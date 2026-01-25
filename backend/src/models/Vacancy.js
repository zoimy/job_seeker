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
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date
  }
});

const Vacancy = mongoose.model('Vacancy', vacancySchema);

export default Vacancy;
