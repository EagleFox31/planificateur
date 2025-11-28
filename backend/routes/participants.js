const express = require('express');
const Participant = require('../models/Participant');

const router = express.Router();

// GET all participants
router.get('/', async (req, res) => {
  try {
    const participants = await Participant.find();
    res.json(participants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one participant
router.get('/:id', async (req, res) => {
  try {
    const participant = await Participant.findOne({ id: req.params.id });
    if (!participant) return res.status(404).json({ message: 'Participant not found' });
    res.json(participant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE participant
router.post('/', async (req, res) => {
  const participant = new Participant(req.body);
  try {
    const newParticipant = await participant.save();
    res.status(201).json(newParticipant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// BULK CREATE participants
router.post('/bulk', async (req, res) => {
  try {
    const newParticipants = await Participant.insertMany(req.body);
    res.status(201).json(newParticipants);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE participant
router.put('/:id', async (req, res) => {
  try {
    const updatedParticipant = await Participant.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedParticipant) return res.status(404).json({ message: 'Participant not found' });
    res.json(updatedParticipant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE participant
router.delete('/:id', async (req, res) => {
  try {
    const deletedParticipant = await Participant.findOneAndDelete({ id: req.params.id });
    if (!deletedParticipant) return res.status(404).json({ message: 'Participant not found' });
    res.json({ message: 'Participant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CLEAR ALL DATA (dangerous - use with caution)
router.delete('/', async (req, res) => {
  try {
    await Participant.deleteMany({});
    res.json({ message: 'All participants deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// BULK CREATE participants
router.post('/bulk', async (req, res) => {
  try {
    const participants = req.body;
    const newParticipants = await Participant.insertMany(participants);
    res.status(201).json(newParticipants);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;