const mongoose = require('mongoose');

const affiliationSchema = new mongoose.Schema({
  relationship: { type: String, enum: ['PARENT', 'ENFANT', 'FRERE', 'SOEUR'], required: true },
  withParticipantId: { type: Number, required: true },
});

const capabilitiesSchema = new mongoose.Schema({
  canPreside: { type: Boolean, default: false },
  canPrayerOpening: { type: Boolean, default: false },
  canPrayerClosing: { type: Boolean, default: false },
  canJoyaux: { type: Boolean, default: false },
  canPerles: { type: Boolean, default: false },
  canBibleReading: { type: Boolean, default: false },
  canApplication: { type: Boolean, default: false },
  canTalk: { type: Boolean, default: false },
  canLifeChristian: { type: Boolean, default: false },
  canNeeds: { type: Boolean, default: false },
  canAssemblyStudy: { type: Boolean, default: false },
  canReadEBA: { type: Boolean, default: false },
}, { _id: false });

const participantSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
  spiritualRole: { type: String, required: true },
  unavailabilities: [{ type: String }],
  assignmentHistory: [{
    subjectTypeId: { type: Number, required: true },
    week: { type: String, required: true },
  }],
  affiliation: [affiliationSchema],
  notes: String,
  isExcluded: { type: Boolean, default: false },
  exclusionEndDate: String,
  capabilities: { type: capabilitiesSchema, default: {} },
});

module.exports = mongoose.models.Participant || mongoose.model('Participant', participantSchema);
