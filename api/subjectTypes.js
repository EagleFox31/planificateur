const mongoose = require('mongoose');
const express = require('express');
const subjectTypesRouter = require('../backend/routes/subjectTypes');

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
};

const app = express();
app.use(express.json());
app.use('/subjectTypes', subjectTypesRouter);

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    // Strip /api prefix for router
    req.url = req.url.replace(/^\/api/, '');
    return app(req, res);
  } catch (err) {
    console.error('API Error (subjectTypes):', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
