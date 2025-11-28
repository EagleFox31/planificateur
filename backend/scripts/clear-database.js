const mongoose = require('mongoose');
require('dotenv').config();

async function clearDatabase() {
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/planificateur';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log('All collections cleared in MongoDB');

    await mongoose.disconnect();
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

clearDatabase();