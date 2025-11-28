const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const participantsRouter = require('../backend/routes/participants');
const subjectTypesRouter = require('../backend/routes/subjectTypes');
const programsRouter = require('../backend/routes/programs');
const rolePermissionsRouter = require('../backend/routes/rolePermissions');
const spiritualRolesRouter = require('../backend/routes/spiritualRoles');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/participants', participantsRouter);
app.use('/api/subjectTypes', subjectTypesRouter);
app.use('/api/programs', programsRouter);
app.use('/api/rolePermissions', rolePermissionsRouter);
app.use('/api/spiritualRoles', spiritualRolesRouter);

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Backend API' });
});

// Export for Vercel
module.exports = app;