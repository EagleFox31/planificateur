const mongoose = require('mongoose');

const rolePermissionsSchema = new mongoose.Schema({
  _id: { type: String, default: 'permissions' }, // Single document
  permissions: { type: Map, of: [String] }, // Map<SpiritualRole, string[]>
});

module.exports = mongoose.models.RolePermissions || mongoose.model('RolePermissions', rolePermissionsSchema);
