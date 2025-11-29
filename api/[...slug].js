const mongoose = require('mongoose');
const backendApp = require('../backend/app');

let cachedConnectionPromise;

const connectToDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!process.env.MONGODB_URI) {
    return Promise.reject(new Error('MONGODB_URI is not defined'));
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose.connect(process.env.MONGODB_URI);
  }

  return cachedConnectionPromise;
};

// Vercel serverless function for API routes
module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    // For debugging
    console.log('Request URL:', req.url);
    console.log('Query slug:', req.query.slug);
    console.log('Method:', req.method);

    // Simple routing for testing
    const slug = req.query.slug || [];
    const endpoint = slug[0];

    if (endpoint === 'spiritualRoles') {
      const SpiritualRoles = require('../backend/models/SpiritualRoles');
      const roles = await SpiritualRoles.find({});
      return res.json(roles);
    }

    if (endpoint === 'participants') {
      const Participant = require('../backend/models/Participant');
      const participants = await Participant.find({});
      return res.json(participants);
    }

    // Default response
    return res.json({ message: 'API working', endpoint, slug });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
