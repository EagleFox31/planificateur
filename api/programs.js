const { URL } = require('url');
const { connectToDatabase } = require('./_lib/db');
const Program = require('./models/Program');
const Participant = require('./models/Participant');
const SubjectType = require('./models/SubjectType');
const { ProgramGenerator } = require('./services/algo/program-generator.service');

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

        const participants = await Participant.find();
        const subjectTypes = await SubjectType.find();

        const generator = new ProgramGenerator(participants, subjectTypes, rolePermissions || {});
        const { newProgram, updatedParticipants } = generator.generateProgram(startWeek, numWeeks);

        // Save the program
        const program = new Program(newProgram);
        await program.save();

        // Update participants with new history
        for (const updated of updatedParticipants) {
          await Participant.findOneAndUpdate({ id: updated.id }, { assignmentHistory: updated.assignmentHistory });
        }

        return res.status(201).json(newProgram);
      } else {
        // CREATE program
        const program = new Program(req.body);
        const newProgram = await program.save();
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
      return res.status(200).json(updatedProgram);
    } else if (method === 'DELETE') {
      // DELETE program
      const id = pathname.slice(1);
      const deletedProgram = await Program.findOneAndDelete({ id });
      if (!deletedProgram) return res.status(404).json({ message: 'Program not found' });
      return res.status(200).json({ message: 'Program deleted' });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
