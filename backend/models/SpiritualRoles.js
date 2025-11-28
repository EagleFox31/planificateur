const mongoose = require('mongoose');

const spiritualRolesSchema = new mongoose.Schema({
  _id: { type: String, default: 'roles' },
  roles: { type: [String], default: [] }
});

module.exports = mongoose.model('SpiritualRoles', spiritualRolesSchema);