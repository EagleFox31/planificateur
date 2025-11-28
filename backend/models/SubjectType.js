const mongoose = require('mongoose');

const subjectTypeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  mainTopic: { type: String, required: true },
  label: { type: String, required: true },
  color: { type: String, required: true },
  rotationWeeks: { type: Number, required: true },
  nbParticipants: { type: Number, required: true },
  requiredGender: { type: String, enum: ['MALE', 'FEMALE'] },
  requiredSpiritualRole: String,
  requiredCapability: String,
  isBinome: { type: Boolean, default: false },
  uppercaseTitle: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
});

module.exports = mongoose.model('SubjectType', subjectTypeSchema);
