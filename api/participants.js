const { connectToDatabase } = require('./_lib/db');
const Participant = require('./models/Participant');

module.exports = async (req, res) => {
  await connectToDatabase();

  const { method, body, query } = req;
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname.replace('/api/participants', '');
  const pathId = pathname.replace('/', '') || null;
  const id = query?.id || pathId;
  const numericId = id ? Number(id) : null;
  const isBulk = pathname.includes('/bulk');

  try {
    // Handle specific participant by ID
    if (numericId) {
      if (method === 'GET') {
        const participant = await Participant.findOne({ id: numericId });
        if (!participant) {
          return res.status(404).json({ message: 'Participant not found' });
        }
        return res.status(200).json(participant);
      }

      if (method === 'PUT' || method === 'PATCH') {
        const updated = await Participant.findOneAndUpdate({ id: numericId }, body, { new: true });
        if (!updated) {
          return res.status(404).json({ message: 'Participant not found' });
        }
        return res.status(200).json(updated);
      }

      if (method === 'DELETE') {
        const deleted = await Participant.findOneAndDelete({ id: numericId });
        if (!deleted) {
          return res.status(404).json({ message: 'Participant not found' });
        }
        return res.status(200).json({ message: 'Participant deleted' });
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Handle bulk operations
    if (isBulk) {
      if (method === 'POST') {
        const participants = body;
        const newParticipants = await Participant.insertMany(participants);
        return res.status(201).json(newParticipants);
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Handle collection operations
    if (method === 'GET') {
      const participants = await Participant.find();
      return res.status(200).json(participants);
    }

    if (method === 'POST') {
      const participant = new Participant(body);
      const saved = await participant.save();
      return res.status(201).json(saved);
    }

    if (method === 'DELETE') {
      await Participant.deleteMany({});
      return res.status(200).json({ message: 'All participants deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('Participants handler error:', err);
    const status = method === 'POST' || method === 'PUT' ? 400 : 500;
    return res.status(status).json({ message: err.message });
  }
};
