const mongoose = require('mongoose');
const participantsRouter = require('../backend/routes/participants');

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Create Express app for this route
const express = require('express');
const app = express();
app.use(express.json());
app.use('/participants', participantsRouter);

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    // Remove the /api prefix from the URL for Express routing
    req.url = req.url.replace(/^\/api/, '');
    return app(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};