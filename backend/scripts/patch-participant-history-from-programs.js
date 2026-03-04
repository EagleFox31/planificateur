#!/usr/bin/env node
/* eslint-disable no-console */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Program = require('../models/Program');
const Participant = require('../models/Participant');

const LEGACY_ID_PREFIX = 'legacy-rvcm-';

function parseArgs(argv) {
  const args = {
    apply: false,
    allPrograms: false,
  };

  for (const token of argv) {
    if (token === '--apply') args.apply = true;
    if (token === '--all-programs') args.allPrograms = true;
  }

  return args;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry) => entry && typeof entry.subjectTypeId === 'number' && typeof entry.week === 'string')
    .map((entry) => ({ subjectTypeId: entry.subjectTypeId, week: entry.week }))
    .sort((a, b) => {
      const byWeek = a.week.localeCompare(b.week);
      if (byWeek !== 0) return byWeek;
      return a.subjectTypeId - b.subjectTypeId;
    });
}

function buildHistoryByParticipant(programs, participantIdSet) {
  const map = new Map();
  let malformedAssignments = 0;
  let unknownParticipantRefs = 0;
  let assignmentsRead = 0;

  for (const program of programs) {
    if (!Array.isArray(program.assignments)) continue;

    for (const assignment of program.assignments) {
      if (
        !assignment ||
        typeof assignment.subjectTypeId !== 'number' ||
        typeof assignment.week !== 'string' ||
        !Array.isArray(assignment.participantIds)
      ) {
        malformedAssignments += 1;
        continue;
      }

      assignmentsRead += 1;
      for (const participantId of assignment.participantIds) {
        if (!participantIdSet.has(participantId)) {
          unknownParticipantRefs += 1;
          continue;
        }
        if (!map.has(participantId)) map.set(participantId, []);
        map.get(participantId).push({
          subjectTypeId: assignment.subjectTypeId,
          week: assignment.week,
        });
      }
    }
  }

  const normalizedMap = new Map();
  for (const [participantId, rawHistory] of map.entries()) {
    const uniq = new Map();
    for (const item of rawHistory) {
      uniq.set(`${item.week}::${item.subjectTypeId}`, item);
    }
    normalizedMap.set(participantId, normalizeHistory(Array.from(uniq.values())));
  }

  return {
    historyByParticipant: normalizedMap,
    stats: { malformedAssignments, unknownParticipantRefs, assignmentsRead },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/planificateur';

  await mongoose.connect(mongoUri);
  console.log('Connecté à MongoDB');

  try {
    const programFilter = args.allPrograms ? {} : { id: { $regex: `^${LEGACY_ID_PREFIX}` } };

    const [participants, programs] = await Promise.all([
      Participant.find({}, { id: 1, name: 1, assignmentHistory: 1 }),
      Program.find(programFilter, { id: 1, assignments: 1 }),
    ]);

    const participantIdSet = new Set(participants.map((p) => p.id));
    const { historyByParticipant, stats } = buildHistoryByParticipant(programs, participantIdSet);

    const bulkOps = [];
    const changedParticipants = [];
    let unchangedCount = 0;

    for (const participant of participants) {
      const currentHistory = normalizeHistory(participant.assignmentHistory);
      const rebuiltHistory = historyByParticipant.get(participant.id) || [];

      const currentSerialized = JSON.stringify(currentHistory);
      const rebuiltSerialized = JSON.stringify(rebuiltHistory);

      if (currentSerialized === rebuiltSerialized) {
        unchangedCount += 1;
        continue;
      }

      changedParticipants.push({
        id: participant.id,
        name: participant.name,
        before: currentHistory.length,
        after: rebuiltHistory.length,
      });

      bulkOps.push({
        updateOne: {
          filter: { id: participant.id },
          update: { $set: { assignmentHistory: rebuiltHistory } },
        },
      });
    }

    console.log(`Programmes analysés: ${programs.length}`);
    console.log(`Affectations lues: ${stats.assignmentsRead}`);
    console.log(`Affectations mal formées ignorées: ${stats.malformedAssignments}`);
    console.log(`Références vers participant inconnu: ${stats.unknownParticipantRefs}`);
    console.log(`Participants à mettre à jour: ${bulkOps.length}`);
    console.log(`Participants inchangés: ${unchangedCount}`);

    if (changedParticipants.length > 0) {
      console.log('Exemples de changements:');
      changedParticipants.slice(0, 15).forEach((row) => {
        console.log(`  - #${row.id} ${row.name}: ${row.before} -> ${row.after}`);
      });
    }

    if (!args.apply) {
      console.log('Mode dry-run (aucune écriture DB).');
      return;
    }

    if (bulkOps.length === 0) {
      console.log('Aucune mise à jour nécessaire.');
      return;
    }

    const result = await Participant.bulkWrite(bulkOps, { ordered: false });
    console.log(`Patch appliqué. modified=${result.modifiedCount || 0}, matched=${result.matchedCount || 0}`);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
}

main().catch((error) => {
  console.error('Erreur patch history:', error.message);
  process.exitCode = 1;
});
