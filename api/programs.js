const { URL } = require('url');
const { connectToDatabase } = require('./_lib/db');
const Program = require('./models/Program');
const Participant = require('./models/Participant');
const SubjectType = require('./models/SubjectType');
const { ProgramGenerator } = require('./services/algo/program-generator.service');

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

module.exports = async (req, res) => {
  await connectToDatabase();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace('/api/programs', '');
  const method = req.method;

  try {
    if (method === 'GET') {
      if (pathname === '/' || pathname === '') {
        // GET all programs
        const programs = await Program.find();
        return res.status(200).json(programs);
      } else {
        // GET one program
        const id = pathname.slice(1); // remove leading /
        const program = await Program.findOne({ id });
        if (!program) return res.status(404).json({ message: 'Program not found' });
        return res.status(200).json(program);
      }
    } else if (method === 'POST') {
      if (pathname === '/generate') {
        // GENERATE program
        const { startWeek, numWeeks, rolePermissions } = req.body;

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
        const { newProgram } = generator.generateProgram(startWeek, numWeeks);

        // Save the program
        const program = new Program(newProgram);
        await program.save();

        return res.status(201).json(newProgram);
      } else {
        // CREATE program
        const program = new Program(req.body);
        const newProgram = await program.save();
        await syncParticipantHistoryFromPublishedPrograms();
        return res.status(201).json(newProgram);
      }
    } else if (method === 'PUT') {
      // UPDATE program
      const id = pathname.slice(1);
      const updatedProgram = await Program.findOneAndUpdate(
        { id },
        req.body,
        { new: true }
      );
      if (!updatedProgram) return res.status(404).json({ message: 'Program not found' });
      await syncParticipantHistoryFromPublishedPrograms();
      return res.status(200).json(updatedProgram);
    } else if (method === 'DELETE') {
      // DELETE program
      const id = pathname.slice(1);
      const deletedProgram = await Program.findOneAndDelete({ id });
      if (!deletedProgram) return res.status(404).json({ message: 'Program not found' });
      await syncParticipantHistoryFromPublishedPrograms();
      return res.status(200).json({ message: 'Program deleted' });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
