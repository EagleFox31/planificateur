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

    // Reconstruct the URL for Express routing
    // req.query.slug contains the path segments after /api/
    const slug = req.query.slug || [];
    const path = '/' + slug.join('/');
    req.url = path;

    console.log('Reconstructed URL:', req.url);

    // Handle the request with the backend Express app
    return backendApp(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
