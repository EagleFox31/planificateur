require('dotenv').config();
const { connectToDatabase } = require('./_lib/db');
const RolePermissions = require('./models/RolePermissions');

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
  } catch (err) {
    console.error('DB connection error:', err);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  const { method, body } = req;

  try {
    if (method === 'GET') {
      let doc = await RolePermissions.findById('permissions');
      if (!doc) {
        doc = new RolePermissions({ _id: 'permissions', permissions: {} });
        await doc.save();
      }
      const permissionsObj = doc.permissions ? Object.fromEntries(doc.permissions) : {};
      return res.status(200).json(permissionsObj);
    }

    if (method === 'PUT') {
      const updated = await RolePermissions.findByIdAndUpdate(
        'permissions',
        { permissions: body || {} },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      const permissionsObj = updated.permissions ? Object.fromEntries(updated.permissions) : {};
      return res.status(200).json(permissionsObj);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('Role permissions handler error:', err);
    const status = method === 'POST' || method === 'PUT' ? 400 : 500;
    return res.status(status).json({ message: err.message });
  }
};
