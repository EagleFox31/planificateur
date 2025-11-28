const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

async function backupDatabase() {
  try {
    if (isProduction) {
      console.log('Backup for PostgreSQL not implemented yet');
      return;
    }

    // MongoDB backup
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/planificateur';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const collections = mongoose.connection.collections;
    const backupDir = path.join(__dirname, '..', 'backups');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath);
    }

    for (const [name, collection] of Object.entries(collections)) {
      const data = await collection.find({}).toArray();
      const filePath = path.join(backupPath, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Backed up ${data.length} documents from ${name}`);
    }

    console.log(`Database backup completed: ${backupPath}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error backing up database:', error);
  }
}

backupDatabase();