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

// Initialize database connection on startup
connectToDatabase().catch(console.error);

// Export the Express app for Vercel
module.exports = app;
