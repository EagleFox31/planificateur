const express = require('express');
const Program = require('../models/Program');
const Participant = require('../models/Participant');
const SubjectType = require('../models/SubjectType');
const { ProgramGenerator } = require('../services/algo/program-generator.service');

const router = express.Router();

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
    res.json({ message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GENERATE program
router.post('/generate', async (req, res) => {
  try {
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

    res.status(201).json(newProgram);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;