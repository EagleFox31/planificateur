const mongoose = require('mongoose');
const SpiritualRoles = require('../models/SpiritualRoles');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/planificateur';

const spiritualRolesData = ['Ancien', 'Assistant Ministériel', 'Proclamateur', 'Nouveau Élève'];

async function seedSpiritualRoles() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await SpiritualRoles.findOneAndUpdate(
      { _id: 'roles' },
      { roles: spiritualRolesData },
      { upsert: true }
    );
    console.log('SpiritualRoles seeded');

    console.log('Spiritual roles seeding completed successfully');
  } catch (error) {
    console.error('Error seeding spiritual roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedSpiritualRoles();