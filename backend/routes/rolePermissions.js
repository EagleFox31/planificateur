const express = require('express');
const RolePermissions = require('../models/RolePermissions');

const router = express.Router();

// GET role permissions
router.get('/', async (req, res) => {
  try {
    let permissions = await RolePermissions.findOne({ _id: 'permissions' });
    if (!permissions) {
      permissions = new RolePermissions({ permissions: new Map() });
      await permissions.save();
    }
    // Convert Map to object for JSON
    const permissionsObj = {};
    permissions.permissions.forEach((value, key) => {
      permissionsObj[key] = value;
    });
    res.json(permissionsObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE role permissions
router.put('/', async (req, res) => {
  try {
    const permissionsMap = new Map(Object.entries(req.body));
    const updatedPermissions = await RolePermissions.findOneAndUpdate(
      { _id: 'permissions' },
      { permissions: permissionsMap },
      { new: true, upsert: true }
    );
    const permissionsObj = {};
    updatedPermissions.permissions.forEach((value, key) => {
      permissionsObj[key] = value;
    });
    res.json(permissionsObj);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;