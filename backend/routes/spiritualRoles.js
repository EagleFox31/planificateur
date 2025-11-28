const express = require('express');
const SpiritualRoles = require('../models/SpiritualRoles');

const router = express.Router();

// GET spiritual roles
router.get('/', async (req, res) => {
  try {
    let doc = await SpiritualRoles.findOne({ _id: 'roles' });
    if (!doc) {
      doc = new SpiritualRoles();
      await doc.save();
    }
    res.json(doc.roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD spiritual role
router.post('/', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || typeof role !== 'string') {
      return res.status(400).json({ message: 'Role name is required' });
    }
    const doc = await SpiritualRoles.findOneAndUpdate(
      { _id: 'roles' },
      { $addToSet: { roles: role } },
      { new: true, upsert: true }
    );
    res.json(doc.roles);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE spiritual role
router.delete('/:role', async (req, res) => {
  try {
    const role = decodeURIComponent(req.params.role);
    const doc = await SpiritualRoles.findOneAndUpdate(
      { _id: 'roles' },
      { $pull: { roles: role } },
      { new: true }
    );
    res.json(doc ? doc.roles : []);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;