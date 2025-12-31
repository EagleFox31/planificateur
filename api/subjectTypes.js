require('dotenv').config();
const { connectToDatabase } = require('./_lib/db');
const SubjectType = require('./models/SubjectType');

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
  } catch (err) {
    console.error('DB connection error:', err);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  const { method, body, query } = req;

  // Support both query ?id= and REST style /:id
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathId = url.pathname.replace('/api/subjectTypes', '').replace('/', '');
  const id = query?.id || pathId || null;
  const numericId = id ? Number(id) : null;

  try {
    // Handle specific subject type by ID
    if (numericId) {
      if (method === 'GET') {
        const subjectType = await SubjectType.findOne({ id: numericId });
        if (!subjectType) {
          return res.status(404).json({ message: 'Subject type not found' });
        }
        return res.status(200).json(subjectType);
      }

      if (method === 'PUT' || method === 'PATCH') {
        const updated = await SubjectType.findOneAndUpdate({ id: numericId }, body, { new: true });
        if (!updated) {
          return res.status(404).json({ message: 'Subject type not found' });
        }
        return res.status(200).json(updated);
      }

      if (method === 'DELETE') {
        const deleted = await SubjectType.findOneAndDelete({ id: numericId });
        if (!deleted) {
          return res.status(404).json({ message: 'Subject type not found' });
        }
        return res.status(200).json({ message: 'Subject type deleted' });
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Handle collection operations
    if (method === 'GET') {
      const subjectTypes = await SubjectType.find();
      return res.status(200).json(subjectTypes);
    }

    if (method === 'POST') {
      const subjectType = new SubjectType(body);
      const saved = await subjectType.save();
      return res.status(201).json(saved);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('Subject types handler error:', err);
    const status = method === 'POST' || method === 'PUT' ? 400 : 500;
    return res.status(status).json({ message: err.message });
  }
};
