const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  startDate: { type: String },
  weekRange: {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  assignments: [{
    id: { type: String, required: true },
    week: { type: String, required: true },
    subjectTypeId: { type: Number, required: true },
    participantIds: [{ type: Number, required: true }],
    customLabel: String,
  }],
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published'], required: true },
});

module.exports = mongoose.models.Program || mongoose.model('Program', programSchema);
