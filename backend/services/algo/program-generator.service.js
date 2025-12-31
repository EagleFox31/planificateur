    const { getEligibleCandidates } = require('./filtering.service');
    const { scoreCandidates, scoreBinomePartner } = require('./scoring.service');

    class ProgramGenerator {
        constructor(participants, subjectTypes, rolePermissions) {
            this.allParticipants = participants;
            this.allSubjectTypes = subjectTypes;
            this.activeSubjectTypes = subjectTypes.filter(s => !s.isArchived);
            this.rolePermissions = rolePermissions;
        }

        getSubjectDifficulty(subject) {
            let difficulty = 0;
            if (subject.requiredSpiritualRole) difficulty += 10;
            if (subject.requiredGender) difficulty += 5;
            difficulty += subject.nbParticipants * 3;
            if (subject.isBinome) difficulty += 4;
            return difficulty;
        }

        weekToDateRange(weekString) {
            const [yearStr, weekStr] = weekString.split('-W');
            const year = parseInt(yearStr, 10);
            const week = parseInt(weekStr, 10);

            // Find the first Thursday of the year (ISO week date standard)
            const firstThursday = new Date(year, 0, 1);
            while (firstThursday.getDay() !== 4) {
                firstThursday.setDate(firstThursday.getDate() + 1);
            }

            // Calculate the start of the week (Monday)
            const weekStart = new Date(firstThursday);
            weekStart.setDate(firstThursday.getDate() - 3 + (week - 1) * 7);

            // Calculate the end of the week (Sunday)
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            return { start: weekStart, end: weekEnd };
        }

        formatProgramTitle(startWeek, endWeek) {
            const startRange = this.weekToDateRange(startWeek);
            const endRange = this.weekToDateRange(endWeek);

            const formatDate = (date) => {
                const day = date.getDate();
                const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                                  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
                const month = monthNames[date.getMonth()];
                const year = date.getFullYear();
                return `${day} ${month} ${year}`;
            };

            const startDateStr = formatDate(startRange.start);
            const endDateStr = formatDate(endRange.end);

            return `Programme du ${startDateStr} au ${endDateStr}`;
        }

        generateProgram(
            startWeek,
            numWeeks,
            onProgress
        ) {
            // Deep copy to avoid mutating original state until the end
            let localParticipants = JSON.parse(JSON.stringify(this.allParticipants));
            const accumulatedAssignments = [];

            for (let i = 0; i < numWeeks; i++) {
                const week = this.getEndWeek(startWeek, i);
                onProgress?.(((i + 1) / numWeeks) * 95, `Planification de la semaine ${week}...`); // 95% for generation

                const { weeklyAssignments, updatedParticipants } = this.generateForWeek(week, localParticipants);

                accumulatedAssignments.push(...weeklyAssignments);
                localParticipants = updatedParticipants;
            }

            const endWeek = this.getEndWeek(startWeek, numWeeks - 1);
            const newProgram = {
                id: `program-${Date.now()}`,
                title: this.formatProgramTitle(startWeek, endWeek),
                weekRange: { start: startWeek, end: endWeek },
                assignments: accumulatedAssignments,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'draft',
            };

            onProgress?.(100, 'Programme finalisé !');

            return { newProgram, updatedParticipants: localParticipants };
        }

        getEndWeek = (startWeek, offset) => {
            const [yearStr, weekStr] = startWeek.split('-W');
            let year = parseInt(yearStr);
            let week = parseInt(weekStr);
            week += offset;
            while (week > 53) {
            week -= 53;
            year += 1;
            }
            return `${year}-W${String(week).padStart(2, '0')}`;
        };

        generateForWeek(week, participantsState) {
            const weeklyAssignedIds = new Set();
            const weeklyAssignments = [];
            const localParticipants = JSON.parse(JSON.stringify(participantsState));

            // Prioritize subjects with higher difficulty score to ensure they get assigned first
            const sortedSubjects = [...this.activeSubjectTypes].sort((a, b) => this.getSubjectDifficulty(b) - this.getSubjectDifficulty(a));

            for (const subject of sortedSubjects) {

                const assignmentsForThisSubject = [];

                for (let i = 0; i < subject.nbParticipants; i++) {
                    let candidates = getEligibleCandidates(subject, week, localParticipants, weeklyAssignedIds, this.rolePermissions, this.allSubjectTypes);

                    let scoredCandidates;
                    if (subject.isBinome && i > 0 && assignmentsForThisSubject.length > 0) {
                        const firstPartnerId = assignmentsForThisSubject[0];
                        const firstPartner = localParticipants.find(p => p.id === firstPartnerId);
                        scoredCandidates = scoreBinomePartner(candidates, firstPartner, subject, week);
                    } else {
                        scoredCandidates = scoreCandidates(candidates, subject, week);
                    }

                    if (scoredCandidates.length === 0) continue;

                    // Tie-breaking: if scores are equal, shuffle and pick first
                    const topScore = scoredCandidates[0].score;
                    const topCandidates = scoredCandidates.filter(sc => sc.score === topScore);
                    const winner = topCandidates[Math.floor(Math.random() * topCandidates.length)];

                    if (winner) {
                        weeklyAssignedIds.add(winner.participant.id);
                        assignmentsForThisSubject.push(winner.participant.id);

                        // Update history for next iteration in the same week's generation
                        const participantToUpdate = localParticipants.find(p => p.id === winner.participant.id);
                        participantToUpdate.assignmentHistory.push({ subjectTypeId: subject.id, week });
                    }
                }

                if (assignmentsForThisSubject.length > 0) {
                    weeklyAssignments.push({
                        id: `${week}-${subject.id}-${Math.random()}`,
                        week,
                        subjectTypeId: subject.id,
                        participantIds: assignmentsForThisSubject
                    });
                }
            }

            return { weeklyAssignments, updatedParticipants: localParticipants };
        }
    }

    module.exports = { ProgramGenerator };