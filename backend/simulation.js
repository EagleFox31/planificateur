const { ProgramGenerator } = require('./services/algo/program-generator.service');
const fs = require('fs');

// Load participants from JSON file
const rawParticipants = JSON.parse(fs.readFileSync('./participants.json', 'utf8'));

// Clean the data (remove MongoDB fields)
const participantsData = rawParticipants.map(p => ({
  id: p.id,
  name: p.name,
  gender: p.gender,
  spiritualRole: p.spiritualRole,
  unavailabilities: p.unavailabilities,
  affiliation: p.affiliation,
  notes: p.notes,
  isExcluded: p.isExcluded,
  capabilities: p.capabilities,
  assignmentHistory: p.assignmentHistory
}));

// Sample data from seeder
const subjectTypesData = [
  { id: 1, mainTopic: 'Prière', label: 'Prière d\'ouverture', color: 'noir', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canPrayerOpening' },
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
  { id: 23, mainTopic: 'Vie chrétienne', label: 'Besoins de l\'assemblée', color: 'rouge', rotationWeeks: 6, nbParticipants: 1, requiredCapability: 'canNeeds' },
  { id: 21, mainTopic: 'Vie chrétienne', label: 'Étude biblique de l\'assemblée', color: 'rouge', rotationWeeks: 4, nbParticipants: 2, requiredCapability: 'canAssemblyStudy' },
  { id: 24, mainTopic: 'Vie chrétienne', label: 'Lecteur paragraphes EBA', color: 'rouge', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canReadEBA' },
  { id: 30, mainTopic: 'Prière', label: 'Prière de clôture', color: 'noir', rotationWeeks: 4, nbParticipants: 1, requiredCapability: 'canPrayerClosing' },
];

const rolePermissionsData = {
  'Ancien': ['noir', 'vert', 'rouge'],
  'Assistant Ministériel': ['noir', 'marron', 'vert', 'rouge'],
  'Proclamateur': ['vert', 'rouge', 'marron'],
  'Nouveau Élève': ['vert', 'marron'],
};

async function runSimulation() {
  console.log('Starting simulation for 5 weeks...');

  const generator = new ProgramGenerator(participantsData, subjectTypesData, rolePermissionsData);

  const result = generator.generateProgram('2025-W36', 5, (progress, status) => {
    console.log(`${progress.toFixed(1)}% - ${status}`);
  });

  console.log('\n=== SIMULATION RESULTS ===');
  console.log(`Program ID: ${result.newProgram.id}`);
  console.log(`Title: ${result.newProgram.title}`);
  console.log(`Week Range: ${result.newProgram.weekRange.start} to ${result.newProgram.weekRange.end}`);
  console.log(`Total Assignments: ${result.newProgram.assignments.length}`);

  // Group assignments by week
  const assignmentsByWeek = {};
  result.newProgram.assignments.forEach(assignment => {
    if (!assignmentsByWeek[assignment.week]) {
      assignmentsByWeek[assignment.week] = [];
    }
    assignmentsByWeek[assignment.week].push(assignment);
  });

  // Check for unassigned subjects
  console.log('\n=== ANALYSE DES SUJETS NON ASSIGNÉS ===');
  const weeks = ['2025-W36', '2025-W37', '2025-W38', '2025-W39', '2025-W40'];
  const assignedSubjectIds = new Set();

  weeks.forEach(week => {
    if (assignmentsByWeek[week]) {
      assignmentsByWeek[week].forEach(assignment => {
        assignedSubjectIds.add(`${week}-${assignment.subjectTypeId}`);
      });
    }
  });

  weeks.forEach(week => {
    console.log(`\n--- Semaine ${week} ---`);
    let hasUnassigned = false;

    subjectTypesData.forEach(subject => {
      const assignmentKey = `${week}-${subject.id}`;
      if (!assignedSubjectIds.has(assignmentKey)) {
        hasUnassigned = true;

        // Analyze why this subject wasn't assigned
        const reasons = analyzeUnassignedSubject(subject, week, result.updatedParticipants);

        console.log(`❌ ${subject.label}: ${reasons}`);
      }
    });

    if (!hasUnassigned) {
      console.log('✅ Tous les sujets ont été assignés');
    }
  });

  // Display assignments per week
  Object.keys(assignmentsByWeek).sort().forEach(week => {
    console.log(`\n--- Week ${week} ---`);
    assignmentsByWeek[week].forEach(assignment => {
      const subject = subjectTypesData.find(s => s.id === assignment.subjectTypeId);
      const participants = assignment.participantIds.map(id => {
        const p = participantsData.find(p => p.id === id);
        return p ? p.name : `ID:${id}`;
      }).join(', ');
      console.log(`${subject.label}: ${participants}`);
    });
  });

  console.log('\n=== DETAILED ASSIGNMENT TABLE ===');
  console.log('| Semaine | Participant | Sujet | Score | Prochaine Disponibilité |');
  console.log('|---------|-------------|-------|-------|-------------------------|');

  // Create detailed tracking
  const participantTracking = {};

  result.newProgram.assignments.forEach(assignment => {
    const subject = subjectTypesData.find(s => s.id === assignment.subjectTypeId);
    const week = assignment.week;

    assignment.participantIds.forEach(participantId => {
      const participant = result.updatedParticipants.find(p => p.id === participantId);
      if (!participant) return;

      // Calculate score for this assignment (simplified - would need to run scoring logic)
      const baseScore = calculateBaseScore(participant, week);
      let score = baseScore;

      // Apply subject-specific penalties
      const topicRepetitions = participant.assignmentHistory.filter(h => h.subjectTypeId === subject.id).length;
      score -= topicRepetitions * 15;

      // Calculate next availability due to rotation
      let nextAvailable = 'Immédiatement';
      if (subject.rotationWeeks > 0) {
        const nextWeek = getNextWeek(week, subject.rotationWeeks);
        nextAvailable = nextWeek;
      }

      console.log(`| ${week} | ${participant.name} | ${subject.label} | ${score.toFixed(1)} | ${nextAvailable} |`);

      // Track for summary
      if (!participantTracking[participant.name]) {
        participantTracking[participant.name] = [];
      }
      participantTracking[participant.name].push({
        week,
        subject: subject.label,
        score: score.toFixed(1),
        nextAvailable
      });
    });
  });

  console.log('\n=== UPDATED PARTICIPANTS HISTORY ===');
  result.updatedParticipants.forEach(p => {
    if (p.assignmentHistory.length > 0) {
      console.log(`${p.name}: ${p.assignmentHistory.length} assignments`);
    }
  });
}

// Helper function to analyze why a subject wasn't assigned
function analyzeUnassignedSubject(subject, week, participants) {
  const reasons = [];

  // Count eligible candidates
  let eligibleCount = 0;
  let rotationBlocked = 0;
  let capabilityBlocked = 0;
  let roleBlocked = 0;
  let genderBlocked = 0;
  let unavailableBlocked = 0;
  let excludedBlocked = 0;
  let weeklyAssignedBlocked = 0;

  participants.forEach(p => {
    // Check basic constraints
    if (p.isExcluded) {
      excludedBlocked++;
      return;
    }

    if (p.unavailabilities.includes(week)) {
      unavailableBlocked++;
      return;
    }

    // For this analysis, we assume weekly assigned is checked during assignment
    // Gender constraint
    if (subject.requiredGender && p.gender !== subject.requiredGender) {
      genderBlocked++;
      return;
    }

    // Spiritual Role constraint
    if (subject.requiredSpiritualRole && p.spiritualRole !== subject.requiredSpiritualRole) {
      roleBlocked++;
      return;
    }

    // Capability constraint
    if (subject.requiredCapability && !hasCapability(p, subject.requiredCapability)) {
      capabilityBlocked++;
      return;
    }

    // Rotation constraint
    if (hasRecentRotationConflict(p, subject, week, subjectTypesData)) {
      rotationBlocked++;
      return;
    }

    // Role permissions (colors)
    const permissions = rolePermissionsData[p.spiritualRole] || [];
    if (!permissions.includes(subject.color)) {
      roleBlocked++;
      return;
    }

    eligibleCount++;
  });

  if (eligibleCount === 0) {
    reasons.push(`Aucun participant éligible trouvé`);

    if (excludedBlocked > 0) reasons.push(`${excludedBlocked} exclus`);
    if (unavailableBlocked > 0) reasons.push(`${unavailableBlocked} indisponibles`);
    if (genderBlocked > 0) reasons.push(`${genderBlocked} ne correspondent pas au genre requis`);
    if (roleBlocked > 0) reasons.push(`${roleBlocked} n'ont pas le rôle spirituel requis`);
    if (capabilityBlocked > 0) reasons.push(`${capabilityBlocked} n'ont pas la capacité requise`);
    if (rotationBlocked > 0) reasons.push(`${rotationBlocked} bloqués par rotation`);
  } else {
    reasons.push(`${eligibleCount} participants éligibles trouvés mais aucun n'a été sélectionné`);
  }

  return reasons.join(', ');
}

// Helper functions from filtering service
function hasCapability(participant, capability) {
  return participant.capabilities && participant.capabilities[capability];
}

function hasRecentRotationConflict(participant, subject, week, allSubjectTypes) {
  if (subject.rotationWeeks <= 0) return false;

  // Find all subjects that share the same rotation period
  const conflictingSubjects = allSubjectTypes.filter(st => st.rotationWeeks === subject.rotationWeeks);
  const conflictingSubjectIds = new Set(conflictingSubjects.map(cs => cs.id));
  const currentWeekValue = getWeekValue(week);

  return participant.assignmentHistory.some(historyItem => {
    if (conflictingSubjectIds.has(historyItem.subjectTypeId)) {
      const historyWeekValue = getWeekValue(historyItem.week);
      return currentWeekValue - historyWeekValue < subject.rotationWeeks;
    }
    return false;
  });
}

// Helper functions
function calculateBaseScore(participant, week) {
  const BASE_SCORE = 100;
  let score = BASE_SCORE;

  // Malus for total workload
  score -= participant.assignmentHistory.length * 2;

  // Malus for recency & bonus for inactivity
  const currentWeekValue = getWeekValue(week);
  const lastAssignment = participant.assignmentHistory.sort((a,b) => getWeekValue(b.week) - getWeekValue(a.week))[0];
  if (lastAssignment) {
    const lastAssignmentWeekValue = getWeekValue(lastAssignment.week);
    const weeksSinceLast = currentWeekValue - lastAssignmentWeekValue;

    if (weeksSinceLast === 1) score -= 25;
    if (weeksSinceLast <= 4) score -= 10;

    // Bonus for inactivity (capped at 20 weeks)
    score += Math.min(weeksSinceLast, 20);
  } else {
    score += 20; // Bonus for new participants
  }

  return score;
}

function getWeekValue(week) {
  const [year, weekNum] = week.split('-W').map(Number);
  return year * 53 + weekNum;
}

function getNextWeek(startWeek, offset) {
  const [yearStr, weekStr] = startWeek.split('-W');
  let year = parseInt(yearStr);
  let week = parseInt(weekStr);
  week += offset;
  while (week > 53) {
    week -= 53;
    year += 1;
  }
  return `${year}-W${String(week).padStart(2, '0')}`;
}

runSimulation().catch(console.error);