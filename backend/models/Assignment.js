const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  week: { type: String, required: true },
  subjectTypeId: { type: Number, required: true },
  participantIds: [{ type: Number, required: true }],
  customLabel: String,
});

module.exports = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
