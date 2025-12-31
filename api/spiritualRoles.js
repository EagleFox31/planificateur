const { URL } = require('url');
const { connectToDatabase } = require('./_lib/db');
const SpiritualRoles = require('./models/SpiritualRoles');

module.exports = async (req, res) => {
  await connectToDatabase();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace('/api/spiritualRoles', '');
  const method = req.method;

  try {
    if (method === 'GET') {
      // GET spiritual roles
      let doc = await SpiritualRoles.findOne({ _id: 'roles' });
      if (!doc) {
        doc = new SpiritualRoles();
        await doc.save();
      }
      return res.status(200).json(doc.roles);
    } else if (method === 'POST') {
      // ADD spiritual role
      const { role } = req.body;
      if (!role || typeof role !== 'string') {
        return res.status(400).json({ message: 'Role name is required' });
      }
      const doc = await SpiritualRoles.findOneAndUpdate(
        { _id: 'roles' },
        { $addToSet: { roles: role } },
        { new: true, upsert: true }
      );
      return res.status(200).json(doc.roles);
    } else if (method === 'DELETE') {
      // DELETE spiritual role
      const role = decodeURIComponent(pathname.slice(1)); // remove leading /
      const doc = await SpiritualRoles.findOneAndUpdate(
        { _id: 'roles' },
        { $pull: { roles: role } },
        { new: true }
      );
      return res.status(200).json(doc ? doc.roles : []);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
