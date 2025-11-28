const mongoose = require('mongoose');
const Participant = require('./models/Participant');
const SubjectType = require('./models/SubjectType');
const Program = require('./models/Program');
const RolePermissions = require('./models/RolePermissions');
const { getDefaultCapabilities } = require('./utils/capabilities');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/planificateur';

const rawParticipantsData = [
  // Famille Talla
  { id: 1, name: 'Hervé Talla', age: 48, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'PARENT', withParticipantId: 3 }, { relationship: 'PARENT', withParticipantId: 4 }], notes: '', isExcluded: false },
  { id: 2, name: 'Solange Talla', age: 45, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: ['2025-W32'], assignmentHistory: [], affiliation: [{ relationship: 'PARENT', withParticipantId: 3 }, { relationship: 'PARENT', withParticipantId: 4 }], notes: '', isExcluded: false },
  { id: 3, name: 'Kevin Talla', age: 22, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'ENFANT', withParticipantId: 1 }, { relationship: 'ENFANT', withParticipantId: 2 }, { relationship: 'FRERE', withParticipantId: 4 }], notes: '', isExcluded: false },
  { id: 4, name: 'Léa Talla', age: 17, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'ENFANT', withParticipantId: 1 }, { relationship: 'ENFANT', withParticipantId: 2 }, { relationship: 'SOEUR', withParticipantId: 3 }], notes: '', isExcluded: false },

  // Famille Fotso
  { id: 5, name: 'Jean-Pierre Fotso', age: 55, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'PARENT', withParticipantId: 7 }], notes: '', isExcluded: false },
  { id: 6, name: 'Chantal Fotso', age: 52, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'PARENT', withParticipantId: 7 }], notes: '', isExcluded: false },
  { id: 7, name: 'Didier Fotso', age: 25, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'ENFANT', withParticipantId: 5 }, { relationship: 'ENFANT', withParticipantId: 6 }], notes: '', isExcluded: false },

  // Famille N'Kono
  { id: 8, name: 'Samuel N\'Kono', age: 42, gender: 'MALE', spiritualRole: 'Assistant Ministériel', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'PARENT', withParticipantId: 10 }], notes: '', isExcluded: false },
  { id: 9, name: 'Gisèle N\'Kono', age: 39, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'PARENT', withParticipantId: 10 }], notes: '', isExcluded: false },
  { id: 10, name: 'Fabrice N\'Kono', age: 16, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'ENFANT', withParticipantId: 8 }, { relationship: 'ENFANT', withParticipantId: 9 }], notes: 'Lecture de la Bible', isExcluded: false },

  // Famille Aboubakar
  { id: 11, name: 'Vincent Aboubakar', age: 38, gender: 'MALE', spiritualRole: 'Assistant Ministériel', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'PARENT', withParticipantId: 13 }, { relationship: 'PARENT', withParticipantId: 14 }], notes: '', isExcluded: false },
  { id: 12, name: 'Aïcha Aboubakar', age: 35, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'PARENT', withParticipantId: 13 }, { relationship: 'PARENT', withParticipantId: 14 }], notes: '', isExcluded: false },
  { id: 13, name: 'Inès Aboubakar', age: 12, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'ENFANT', withParticipantId: 11 }, { relationship: 'ENFANT', withParticipantId: 12 }, { relationship: 'SOEUR', withParticipantId: 14 }], notes: '', isExcluded: false },
  { id: 14, name: 'Paul Aboubakar', age: 10, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'ENFANT', withParticipantId: 11 }, { relationship: 'ENFANT', withParticipantId: 12 }, { relationship: 'FRERE', withParticipantId: 13 }], notes: '', isExcluded: false },

  // Fratrie Onana
  { id: 15, name: 'André Onana', age: 28, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'FRERE', withParticipantId: 16 }], notes: '', isExcluded: false },
  { id: 16, name: 'Mireille Onana', age: 31, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'SOEUR', withParticipantId: 15 }], notes: '', isExcluded: false },
  
  // Famille Mbia
  { id: 17, name: 'Stéphane Mbia', age: 41, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'PARENT', withParticipantId: 19 }], notes: '', isExcluded: false },
  { id: 18, name: 'Carine Mbia', age: 40, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'PARENT', withParticipantId: 19 }], notes: '', isExcluded: false },
  { id: 19, name: 'Jules Mbia', age: 18, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: 'ENFANT', withParticipantId: 17 }, { relationship: 'ENFANT', withParticipantId: 18 }], notes: '', isExcluded: false },

  // Individuels
  { id: 20, name: 'Emmanuel Macron', age: 45, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 21, name: 'Brigitte Macron', age: 68, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Préfère les sujets sans binôme.', isExcluded: false },
  { id: 22, name: 'Nathalie Yamb', age: 53, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 23, name: 'Dieudonné M\'Bala M\'Bala', age: 58, gender: 'MALE', spiritualRole: 'Assistant Ministériel', unavailabilities: ['2025-W35'], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 24, name: 'Claudy Siar', age: 50, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 25, name: 'Kémi Séba', age: 42, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: true, exclusionEndDate: '2025-09-30' },
  { id: 26, name: 'Amadou Bello', age: 33, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 27, name: 'Fatima Diallo', age: 29, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 28, name: 'Olivier Dubois', age: 62, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 29, name: 'Sophie Moreau', age: 24, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 30, name: 'Laurent Gbagbo', age: 78, gender: 'MALE', spiritualRole: 'Assistant Ministériel', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 31, name: 'Simone Gbagbo', age: 74, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 32, name: 'Alassane Ouattara', age: 82, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 33, name: 'Dominique Ouattara', age: 71, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: ['2025-W40'], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 34, name: 'Henri Konan Bédié', age: 89, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 35, name: 'Charles Blé Goudé', age: 52, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 36, name: 'Guillaume Soro', age: 52, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 37, name: 'Pascal Affi N\'Guessan', age: 71, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 38, name: 'Mamadou Koulibaly', age: 67, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 39, name: 'Marcel Amon-Tanoh', age: 72, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 40, name: 'Albert Toikeusse Mabri', age: 61, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 41, name: 'Daniel Kablan Duncan', age: 81, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 42, name: 'Jeannot Ahoussou-Kouadio', age: 73, gender: 'MALE', spiritualRole: 'Assistant Ministériel', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 43, name: 'Patrick Achi', age: 68, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 44, name: 'Hamed Bakayoko', age: 56, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2021', isExcluded: true },
  { id: 45, name: 'Amadou Gon Coulibaly', age: 62, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2020', isExcluded: true },
  { id: 46, name: 'Robert Gueï', age: 61, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2002', isExcluded: true },
  { id: 47, name: 'Félix Houphouët-Boigny', age: 88, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 1993', isExcluded: true },
  { id: 48, name: 'Auguste Denise', age: 87, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 1990', isExcluded: true },
  { id: 49, name: 'Jean-Baptiste Mockey', age: 62, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 1981', isExcluded: true },
  { id: 50, name: 'Mathieu Ekra', age: 93, gender: 'MALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2015', isExcluded: true },
  { id: 51, name: 'Idriss Déby', age: 68, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2021', isExcluded: true },
  { id: 52, name: 'Hissène Habré', age: 79, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2021', isExcluded: true },
  { id: 53, name: 'François Tombalbaye', age: 56, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 1975', isExcluded: true },
  { id: 54, name: 'Félix Malloum', age: 75, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2009', isExcluded: true },
  { id: 55, name: 'Goukouni Oueddei', age: 79, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 56, name: 'Lol Mahamat Choua', age: 74, gender: 'MALE', spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2019', isExcluded: true },
  { id: 57, name: 'Nodjialem Myaro', age: 48, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 58, name: 'Grace Geyoro', age: 27, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 59, name: 'Kheira Hamraoui', age: 34, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 60, name: 'Aminata Diallo', age: 29, gender: 'FEMALE', spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
];

const participantsData = rawParticipantsData.map(p => ({
  ...p,
  capabilities: getDefaultCapabilities(p.spiritualRole, p.gender),
}));

const subjectTypesData = [
  { id: 1, mainTopic: 'Prière', label: 'Prière d’ouverture', color: 'noir', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canPrayerOpening' },
  { id: 2, mainTopic: 'Présidence', label: 'Présidence de la réunion', color: 'noir', rotationWeeks: 14, nbParticipants: 1, requiredCapability: 'canPreside' },
  { id: 3, mainTopic: 'Joyaux de la parole de Dieu', label: 'Joyaux : Discours', color: 'vert', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canJoyaux' },
  { id: 4, mainTopic: 'Joyaux de la parole de Dieu', label: 'Perles spirituelles', color: 'vert', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canPerles' },
  { id: 5, mainTopic: 'Joyaux de la parole de Dieu', label: 'Lecture de la Bible', color: 'vert', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canBibleReading' },
  { id: 10, mainTopic: 'Applique-toi au ministère', label: 'PREMIER SUJET', color: 'marron', rotationWeeks: 8, nbParticipants: 2, isBinome: true, uppercaseTitle: true, requiredCapability: 'canApplication' },
  { id: 11, mainTopic: 'Applique-toi au ministère', label: 'DEUXIÈME SUJET', color: 'marron', rotationWeeks: 8, nbParticipants: 2, isBinome: true, uppercaseTitle: true, requiredCapability: 'canApplication' },
  { id: 12, mainTopic: 'Applique-toi au ministère', label: 'TROISIÈME SUJET', color: 'marron', rotationWeeks: 8, nbParticipants: 2, isBinome: true, uppercaseTitle: true, requiredCapability: 'canApplication' },
  { id: 13, mainTopic: 'Applique-toi au ministère', label: 'QUATRIÈME SUJET (Optionnel)', color: 'marron', rotationWeeks: 8, nbParticipants: 2, isBinome: true, uppercaseTitle: true, requiredCapability: 'canApplication' },
  { id: 14, mainTopic: 'Applique-toi au ministère', label: 'Discours (frères)', color: 'marron', rotationWeeks: 8, nbParticipants: 1, requiredCapability: 'canTalk' },
  { id: 20, mainTopic: 'Vie chrétienne', label: 'Vie chrétienne : 1er Discours', color: 'rouge', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canLifeChristian' },
  { id: 22, mainTopic: 'Vie chrétienne', label: 'Vie chrétienne : 2e Discours', color: 'rouge', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canLifeChristian' },
  { id: 23, mainTopic: 'Vie chrétienne', label: 'Besoins de l’assemblée', color: 'rouge', rotationWeeks: 6, nbParticipants: 1, requiredCapability: 'canNeeds' },
  { id: 21, mainTopic: 'Vie chrétienne', label: 'Étude biblique de l’assemblée', color: 'rouge', rotationWeeks: 4, nbParticipants: 2, requiredCapability: 'canAssemblyStudy' },
  { id: 24, mainTopic: 'Vie chrétienne', label: 'Lecteur paragraphes EBA', color: 'rouge', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canReadEBA' },
  { id: 30, mainTopic: 'Prière', label: 'Prière de clôture', color: 'noir', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canPrayerClosing' },
];

const programsData = [];

const rolePermissionsData = {
  permissions: {
    'Ancien': ['noir', 'vert', 'rouge'],
    'Assistant Ministériel': ['noir', 'marron', 'vert', 'rouge'],
    'Proclamateur': ['vert', 'rouge', 'marron'],
    'Nouveau Élève': ['vert', 'marron'],
  }
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (except participants - keep real data)
    // await Participant.deleteMany({}); // COMMENTED OUT - Keep real participants
    await SubjectType.deleteMany({});
    await Program.deleteMany({});
    await RolePermissions.deleteMany({});

    // Insert data (participants commented out - use real data)
    // await Participant.insertMany(participantsData);
    // console.log('Participants seeded');

    await SubjectType.insertMany(subjectTypesData);
    console.log('SubjectTypes seeded');

    await Program.insertMany(programsData);
    console.log('Programs seeded');

    await RolePermissions.findOneAndUpdate(
      { _id: 'permissions' },
      rolePermissionsData,
      { upsert: true }
    );
    console.log('RolePermissions seeded');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
