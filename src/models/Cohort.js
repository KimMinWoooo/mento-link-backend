const mongoose = require('mongoose');

const cohortSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  lmsUrl: {
    type: String,
    required: true
  },
  funSystemUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Cohort', cohortSchema); 