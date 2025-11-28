require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Trigger nodemon restart

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/planificateur', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Backend API for Planificateur de Réunions Théocratiques' });
});

// Routes
app.use('/api/participants', require('./routes/participants'));
app.use('/api/subjectTypes', require('./routes/subjectTypes'));
app.use('/api/programs', require('./routes/programs'));
app.use('/api/rolePermissions', require('./routes/rolePermissions'));
app.use('/api/spiritualRoles', require('./routes/spiritualRoles'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});