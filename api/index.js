const mongoose = require('mongoose');
const app = require('../backend/app');

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

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('API handler error', error);
    res.status(500).json({ error: 'Database connection error' });
  }
};
