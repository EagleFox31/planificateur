const mongoose = require('mongoose');
const express = require('express');
const rolePermissionsRouter = require('../backend/routes/rolePermissions');

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
app.use('/rolePermissions', rolePermissionsRouter);

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    req.url = req.url.replace(/^\/api/, '');
    return app(req, res);
  } catch (err) {
    console.error('API Error (rolePermissions):', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
