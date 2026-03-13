const express = require('express');
const Program = require('../models/Program');
const Participant = require('../models/Participant');
const SubjectType = require('../models/SubjectType');
const { ProgramGenerator } = require('../services/algo/program-generator.service');

const router = express.Router();

const getWeeksInRange = (startWeek, numWeeks) => {
  const [yearStr, weekStr] = String(startWeek || '').split('-W');
  let year = parseInt(yearStr, 10);
  let week = parseInt(weekStr, 10);
  const out = [];

  if (!Number.isFinite(year) || !Number.isFinite(week) || !Number.isFinite(numWeeks) || numWeeks <= 0) {
    return out;
  }

  for (let i = 0; i < numWeeks; i += 1) {
    out.push(`${year}-W${String(week).padStart(2, '0')}`);
    week += 1;
    if (week > 53) {
      week = 1;
      year += 1;
    }
  }

  return out;
};

const getWeekValue = (week) => {
  const [year, weekNum] = String(week || '').split('-W').map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(weekNum)) return 0;
  return year * 53 + weekNum;
};

const buildHistoryByParticipantFromPublishedPrograms = (programs) => {
  const perParticipant = new Map();

  for (const program of programs) {
    for (const assignment of (program.assignments || [])) {
      if (!assignment || typeof assignment.subjectTypeId !== 'number' || typeof assignment.week !== 'string') {
        continue;
      }
      for (const participantId of (assignment.participantIds || [])) {
        if (typeof participantId !== 'number') continue;
        if (!perParticipant.has(participantId)) {
          perParticipant.set(participantId, new Map());
        }
        const bySlot = perParticipant.get(participantId);
        const key = `${assignment.subjectTypeId}|${assignment.week}`;
        bySlot.set(key, { subjectTypeId: assignment.subjectTypeId, week: assignment.week });
      }
    }
  }

  const normalized = new Map();
  for (const [participantId, slotMap] of perParticipant.entries()) {
    const history = Array.from(slotMap.values()).sort((a, b) => {
      const weekDelta = getWeekValue(a.week) - getWeekValue(b.week);
      if (weekDelta !== 0) return weekDelta;
      return a.subjectTypeId - b.subjectTypeId;
    });
    normalized.set(participantId, history);
  }

  return normalized;
};

const syncParticipantHistoryFromPublishedPrograms = async () => {
  const [publishedPrograms, participants] = await Promise.all([
    Program.find({ status: 'published' }, { assignments: 1 }).lean(),
    Participant.find({}, { id: 1 }).lean(),
  ]);

  const historyByParticipant = buildHistoryByParticipantFromPublishedPrograms(publishedPrograms);
  const ops = participants.map((participant) => ({
    updateOne: {
      filter: { id: participant.id },
      update: { $set: { assignmentHistory: historyByParticipant.get(participant.id) || [] } },
    },
  }));

  if (ops.length > 0) {
    await Participant.bulkWrite(ops);
  }
};

// GET all programs
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find();
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one program
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findOne({ id: req.params.id });
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE program
router.post('/', async (req, res) => {
  const program = new Program(req.body);
  try {
    const newProgram = await program.save();
    await syncParticipantHistoryFromPublishedPrograms();
    res.status(201).json(newProgram);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE program
router.put('/:id', async (req, res) => {
  try {
    const updatedProgram = await Program.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedProgram) return res.status(404).json({ message: 'Program not found' });
    await syncParticipantHistoryFromPublishedPrograms();
    res.json(updatedProgram);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE program
router.delete('/:id', async (req, res) => {
  try {
    const deletedProgram = await Program.findOneAndDelete({ id: req.params.id });
    if (!deletedProgram) return res.status(404).json({ message: 'Program not found' });
    await syncParticipantHistoryFromPublishedPrograms();
    res.json({ message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GENERATE program
router.post('/generate', async (req, res) => {
  try {
    const { startWeek, numWeeks, rolePermissions, startDate } = req.body;

    // Only published programs should impact rotation history.
    await syncParticipantHistoryFromPublishedPrograms();

    const participants = await Participant.find();
    const subjectTypes = await SubjectType.find();

    // When regenerating an already-generated range, avoid self-blocking due to
    // rotation conflicts from previous drafts on the same weeks.
    const targetWeeks = new Set(getWeeksInRange(startWeek, numWeeks));
    const sanitizedParticipants = participants.map((participantDoc) => {
      const participant = participantDoc.toObject();
      return {
        ...participant,
        assignmentHistory: (participant.assignmentHistory || []).filter(
          (h) => !targetWeeks.has(h.week)
        ),
      };
    });

    const generator = new ProgramGenerator(sanitizedParticipants, subjectTypes, rolePermissions || {});
    const { newProgram } = generator.generateProgram(startWeek, numWeeks, startDate);

    // Save the program
    const program = new Program(newProgram);
    await program.save();

    res.status(201).json(newProgram);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
