const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

// Configuration PostgreSQL (utiliser les variables d'environnement)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Connexion SQLite
const db = new sqlite3.Database('./data/database.sqlite');

async function migrateTable(tableName, columns) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
      if (err) {
        console.error(`Erreur lors de la lecture de ${tableName}:`, err);
        reject(err);
        return;
      }

      if (rows.length === 0) {
        console.log(`Table ${tableName} vide, ignorée`);
        resolve();
        return;
      }

      try {
        // Créer la table dans PostgreSQL si elle n'existe pas
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS ${tableName} (
            ${columns.map(col => `${col.name} ${col.type}`).join(', ')}
          )
        `;
        await pool.query(createTableQuery);

        // Insérer les données
        for (const row of rows) {
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
          const values = columns.map(col => row[col.name]);

          const insertQuery = `INSERT INTO ${tableName} VALUES (${placeholders})`;
          await pool.query(insertQuery, values);
        }

        console.log(`✅ Migration de ${tableName} terminée (${rows.length} enregistrements)`);
        resolve();
      } catch (error) {
        console.error(`Erreur lors de la migration de ${tableName}:`, error);
        reject(error);
      }
    });
  });
}

async function migrate() {
  try {
    console.log('🚀 Début de la migration SQLite vers PostgreSQL...');

    // Migration des participants
    await migrateTable('participants', [
      { name: 'id', type: 'INTEGER PRIMARY KEY' },
      { name: 'name', type: 'TEXT' },
      { name: 'age', type: 'INTEGER' },
      { name: 'gender', type: 'TEXT' },
      { name: 'spiritualRole', type: 'TEXT' },
      { name: 'affiliation', type: 'JSON' },
      { name: 'unavailabilities', type: 'JSON' },
      { name: 'notes', type: 'TEXT' },
      { name: 'assignmentHistory', type: 'JSON' },
      { name: 'isExcluded', type: 'BOOLEAN' },
      { name: 'exclusionEndDate', type: 'TEXT' }
    ]);

    // Migration des programmes
    await migrateTable('programs', [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'title', type: 'TEXT' },
      { name: 'weekRange', type: 'JSON' },
      { name: 'assignments', type: 'JSON' },
      { name: 'status', type: 'TEXT' },
      { name: 'createdAt', type: 'TEXT' },
      { name: 'updatedAt', type: 'TEXT' }
    ]);

    // Migration des types de sujets
    await migrateTable('subjectTypes', [
      { name: 'id', type: 'INTEGER PRIMARY KEY' },
      { name: 'mainTopic', type: 'TEXT' },
      { name: 'label', type: 'TEXT' },
      { name: 'color', type: 'TEXT' },
      { name: 'rotationWeeks', type: 'INTEGER' },
      { name: 'nbParticipants', type: 'INTEGER' },
      { name: 'requiredGender', type: 'TEXT' },
      { name: 'requiredSpiritualRole', type: 'TEXT' },
      { name: 'isBinome', type: 'BOOLEAN' },
      { name: 'uppercaseTitle', type: 'BOOLEAN' },
      { name: 'isArchived', type: 'BOOLEAN' }
    ]);

    // Migration des permissions de rôles
    await migrateTable('rolePermissions', [
      { name: 'id', type: 'INTEGER PRIMARY KEY' },
      { name: 'role', type: 'TEXT' },
      { name: 'permissions', type: 'JSON' }
    ]);

    console.log('✅ Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    db.close();
    pool.end();
  }
}

migrate();