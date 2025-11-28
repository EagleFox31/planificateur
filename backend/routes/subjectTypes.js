const express = require('express');
const SubjectType = require('../models/SubjectType');

const router = express.Router();

// GET all subject types
router.get('/', async (req, res) => {
  try {
    const subjectTypes = await SubjectType.find();
    res.json(subjectTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one subject type
router.get('/:id', async (req, res) => {
  try {
    const subjectType = await SubjectType.findOne({ id: req.params.id });
    if (!subjectType) return res.status(404).json({ message: 'SubjectType not found' });
    res.json(subjectType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE subject type
router.post('/', async (req, res) => {
  const subjectType = new SubjectType(req.body);
  try {
    const newSubjectType = await subjectType.save();
    res.status(201).json(newSubjectType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE subject type
router.put('/:id', async (req, res) => {
  try {
    const updatedSubjectType = await SubjectType.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedSubjectType) return res.status(404).json({ message: 'SubjectType not found' });
    res.json(updatedSubjectType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE subject type
router.delete('/:id', async (req, res) => {
  try {
    const deletedSubjectType = await SubjectType.findOneAndDelete({ id: req.params.id });
    if (!deletedSubjectType) return res.status(404).json({ message: 'SubjectType not found' });
    res.json({ message: 'SubjectType deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;