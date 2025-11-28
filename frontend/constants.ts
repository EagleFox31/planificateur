

import { Participant, SubjectType, Assignment, Gender, SpiritualRole, RelationshipType, RolePermissions, Program } from './types';

export const COLORS = {
  noir: 'bg-black text-white',
  vert: 'bg-green-600 text-white',
  marron: 'bg-amber-800 text-white',
  rouge: 'bg-red-600 text-white',
};

export const SUBJECT_COLORS = ['noir', 'vert', 'marron', 'rouge'];

export const INITIAL_SPIRITUAL_ROLES: SpiritualRole[] = ['Ancien', 'Assistant Ministériel', 'Proclamateur', 'Nouveau Élève'];


export const INITIAL_PARTICIPANTS: Participant[] = [
  // Famille Talla
  { id: 1, name: 'Hervé Talla', age: 48, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.PARENT, withParticipantId: 3 }, { relationship: RelationshipType.PARENT, withParticipantId: 4 }], notes: '', isExcluded: false },
  { id: 2, name: 'Solange Talla', age: 45, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: ['2025-W32'], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.PARENT, withParticipantId: 3 }, { relationship: RelationshipType.PARENT, withParticipantId: 4 }], notes: '', isExcluded: false },
  { id: 3, name: 'Kevin Talla', age: 22, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.ENFANT, withParticipantId: 1 }, { relationship: RelationshipType.ENFANT, withParticipantId: 2 }, { relationship: RelationshipType.FRERE, withParticipantId: 4 }], notes: '', isExcluded: false },
  { id: 4, name: 'Léa Talla', age: 17, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.ENFANT, withParticipantId: 1 }, { relationship: RelationshipType.ENFANT, withParticipantId: 2 }, { relationship: RelationshipType.SOEUR, withParticipantId: 3 }], notes: '', isExcluded: false },

  // Famille Fotso
  { id: 5, name: 'Jean-Pierre Fotso', age: 55, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.PARENT, withParticipantId: 7 }], notes: '', isExcluded: false },
  { id: 6, name: 'Chantal Fotso', age: 52, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.PARENT, withParticipantId: 7 }], notes: '', isExcluded: false },
  { id: 7, name: 'Didier Fotso', age: 25, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.ENFANT, withParticipantId: 5 }, { relationship: RelationshipType.ENFANT, withParticipantId: 6 }], notes: '', isExcluded: false },

  // Famille N'Kono
  { id: 8, name: 'Samuel N\'Kono', age: 42, gender: Gender.MALE, spiritualRole: 'Assistant Ministériel', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.PARENT, withParticipantId: 10 }], notes: '', isExcluded: false },
  { id: 9, name: 'Gisèle N\'Kono', age: 39, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.PARENT, withParticipantId: 10 }], notes: '', isExcluded: false },
  { id: 10, name: 'Fabrice N\'Kono', age: 16, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.ENFANT, withParticipantId: 8 }, { relationship: RelationshipType.ENFANT, withParticipantId: 9 }], notes: 'Lecture de la Bible', isExcluded: false },

  // Famille Aboubakar
  { id: 11, name: 'Vincent Aboubakar', age: 38, gender: Gender.MALE, spiritualRole: 'Assistant Ministériel', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.PARENT, withParticipantId: 13 }, { relationship: RelationshipType.PARENT, withParticipantId: 14 }], notes: '', isExcluded: false },
  { id: 12, name: 'Aïcha Aboubakar', age: 35, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.PARENT, withParticipantId: 13 }, { relationship: RelationshipType.PARENT, withParticipantId: 14 }], notes: '', isExcluded: false },
  { id: 13, name: 'Inès Aboubakar', age: 12, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.ENFANT, withParticipantId: 11 }, { relationship: RelationshipType.ENFANT, withParticipantId: 12 }, { relationship: RelationshipType.SOEUR, withParticipantId: 14 }], notes: '', isExcluded: false },
  { id: 14, name: 'Paul Aboubakar', age: 10, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.ENFANT, withParticipantId: 11 }, { relationship: RelationshipType.ENFANT, withParticipantId: 12 }, { relationship: RelationshipType.FRERE, withParticipantId: 13 }], notes: '', isExcluded: false },

  // Fratrie Onana
  { id: 15, name: 'André Onana', age: 28, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.FRERE, withParticipantId: 16 }], notes: '', isExcluded: false },
  { id: 16, name: 'Mireille Onana', age: 31, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.SOEUR, withParticipantId: 15 }], notes: '', isExcluded: false },
  
  // Famille Mbia
  { id: 17, name: 'Stéphane Mbia', age: 41, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.PARENT, withParticipantId: 19 }], notes: '', isExcluded: false },
  { id: 18, name: 'Carine Mbia', age: 40, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.PARENT, withParticipantId: 19 }], notes: '', isExcluded: false },
  { id: 19, name: 'Jules Mbia', age: 18, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [{ relationship: RelationshipType.ENFANT, withParticipantId: 17 }, { relationship: RelationshipType.ENFANT, withParticipantId: 18 }], notes: '', isExcluded: false },

  // Individuels
  { id: 20, name: 'Emmanuel Macron', age: 45, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 21, name: 'Brigitte Macron', age: 68, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Préfère les sujets sans binôme.', isExcluded: false },
  { id: 22, name: 'Nathalie Yamb', age: 53, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 23, name: 'Dieudonné M\'Bala M\'Bala', age: 58, gender: Gender.MALE, spiritualRole: 'Assistant Ministériel', unavailabilities: ['2025-W35'], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 24, name: 'Claudy Siar', age: 50, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 25, name: 'Kémi Séba', age: 42, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: true, exclusionEndDate: '2025-09-30' },
  { id: 26, name: 'Amadou Bello', age: 33, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 27, name: 'Fatima Diallo', age: 29, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 28, name: 'Olivier Dubois', age: 62, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 29, name: 'Sophie Moreau', age: 24, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 30, name: 'Laurent Gbagbo', age: 78, gender: Gender.MALE, spiritualRole: 'Assistant Ministériel', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 31, name: 'Simone Gbagbo', age: 74, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 32, name: 'Alassane Ouattara', age: 82, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 33, name: 'Dominique Ouattara', age: 71, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: ['2025-W40'], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 34, name: 'Henri Konan Bédié', age: 89, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 35, name: 'Charles Blé Goudé', age: 52, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 36, name: 'Guillaume Soro', age: 52, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 37, name: 'Pascal Affi N\'Guessan', age: 71, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 38, name: 'Mamadou Koulibaly', age: 67, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 39, name: 'Marcel Amon-Tanoh', age: 72, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 40, name: 'Albert Toikeusse Mabri', age: 61, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 41, name: 'Daniel Kablan Duncan', age: 81, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 42, name: 'Jeannot Ahoussou-Kouadio', age: 73, gender: Gender.MALE, spiritualRole: 'Assistant Ministériel', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 43, name: 'Patrick Achi', age: 68, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 44, name: 'Hamed Bakayoko', age: 56, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2021', isExcluded: true },
  { id: 45, name: 'Amadou Gon Coulibaly', age: 62, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2020', isExcluded: true },
  { id: 46, name: 'Robert Gueï', age: 61, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2002', isExcluded: true },
  { id: 47, name: 'Félix Houphouët-Boigny', age: 88, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 1993', isExcluded: true },
  { id: 48, name: 'Auguste Denise', age: 87, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 1990', isExcluded: true },
  { id: 49, name: 'Jean-Baptiste Mockey', age: 62, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 1981', isExcluded: true },
  { id: 50, name: 'Mathieu Ekra', age: 93, gender: Gender.MALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2015', isExcluded: true },
  { id: 51, name: 'Idriss Déby', age: 68, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2021', isExcluded: true },
  { id: 52, name: 'Hissène Habré', age: 79, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2021', isExcluded: true },
  { id: 53, name: 'François Tombalbaye', age: 56, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 1975', isExcluded: true },
  { id: 54, name: 'Félix Malloum', age: 75, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2009', isExcluded: true },
  { id: 55, name: 'Goukouni Oueddei', age: 79, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 56, name: 'Lol Mahamat Choua', age: 74, gender: Gender.MALE, spiritualRole: 'Ancien', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: 'Décédé en 2019', isExcluded: true },
  { id: 57, name: 'Nodjialem Myaro', age: 48, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 58, name: 'Grace Geyoro', age: 27, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 59, name: 'Kheira Hamraoui', age: 34, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
  { id: 60, name: 'Aminata Diallo', age: 29, gender: Gender.FEMALE, spiritualRole: 'Proclamateur', unavailabilities: [], assignmentHistory: [], affiliation: [], notes: '', isExcluded: false },
];

export const INITIAL_ROLE_PERMISSIONS: RolePermissions = {
  'Ancien': ['noir', 'vert', 'marron', 'rouge'],
  'Assistant Ministériel': ['vert', 'marron', 'rouge'],
  'Proclamateur': ['vert', 'marron'],
  'Nouveau Élève': ['vert', 'marron'],
};


export const INITIAL_SUBJECT_TYPES: SubjectType[] = [
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

const initialAssignments: Assignment[] = [
    { id: '2025-W30-1', week: '2025-W30', subjectTypeId: 1, participantIds: [5] },
    { id: '2025-W30-2', week: '2025-W30', subjectTypeId: 2, participantIds: [1] },
    { id: '2025-W30-3', week: '2025-W30', subjectTypeId: 3, participantIds: [3] },
    { id: '2025-W30-10', week: '2025-W30', subjectTypeId: 10, participantIds: [2, 4] },
    { id: '2025-W30-20', week: '2025-W30', subjectTypeId: 20, participantIds: [6] },
    { id: '2025-W30-30', week: '2025-W30', subjectTypeId: 30, participantIds: [7] },
];

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: `program-${Date.now()}`,
    title: 'Programme Initial (Exemple)',
    weekRange: { start: '2025-W30', end: '2025-W30' },
    assignments: initialAssignments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published',
  }
];


export const MAIN_TOPICS = [
    'Prière',
    'Présidence',
    'Joyaux de la parole de Dieu',
    'Applique-toi au ministère',
    'Vie chrétienne'
];
