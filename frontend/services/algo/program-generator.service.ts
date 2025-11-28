import { Participant, SubjectType, Assignment, Program, RolePermissions } from '../../types';
import { getEligibleCandidates } from './filtering.service';
import { scoreCandidates, scoreBinomePartner } from './scoring.service';
import { ScoredCandidate } from './types';

export class ProgramGenerator {
    private allParticipants: Participant[];
    private allSubjectTypes: SubjectType[];
    private activeSubjectTypes: SubjectType[];
    private rolePermissions: RolePermissions;

    constructor(participants: Participant[], subjectTypes: SubjectType[], rolePermissions: RolePermissions) {
        this.allParticipants = participants;
        this.allSubjectTypes = subjectTypes;
        this.activeSubjectTypes = subjectTypes.filter(s => !s.isArchived);
        this.rolePermissions = rolePermissions;
    }

    private getSubjectDifficulty(subject: SubjectType): number {
        let difficulty = 0;
        if (subject.requiredSpiritualRole) difficulty += 10;
        if (subject.requiredGender) difficulty += 5;
        difficulty += subject.nbParticipants * 3;
        if (subject.isBinome) difficulty += 4;
        return difficulty;
    }

    public generateProgram(
        startWeek: string, 
        numWeeks: number,
        onProgress?: (progress: number, statusText: string) => void
    ): { newProgram: Program, updatedParticipants: Participant[] } {
        // Deep copy to avoid mutating original state until the end
        let localParticipants: Participant[] = JSON.parse(JSON.stringify(this.allParticipants));
        const accumulatedAssignments: Assignment[] = [];

        for (let i = 0; i < numWeeks; i++) {
            const week = this.getEndWeek(startWeek, i);
            onProgress?.(((i + 1) / numWeeks) * 95, `Planification de la semaine ${week}...`); // 95% for generation
            
            const { weeklyAssignments, updatedParticipants } = this.generateForWeek(week, localParticipants);
            
            accumulatedAssignments.push(...weeklyAssignments);
            localParticipants = updatedParticipants;
        }
        
        const endWeek = this.getEndWeek(startWeek, numWeeks - 1);
        const newProgram: Program = {
            id: `program-${Date.now()}`,
            title: `Programme des semaines ${startWeek} à ${endWeek}`,
            weekRange: { start: startWeek, end: endWeek },
            assignments: accumulatedAssignments,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'draft',
        };

        onProgress?.(100, 'Programme finalisé !');

        return { newProgram, updatedParticipants: localParticipants };
    }
    
    private getEndWeek = (startWeek: string, offset: number): string => {
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

    private generateForWeek(week: string, participantsState: Participant[]): { weeklyAssignments: Assignment[], updatedParticipants: Participant[] } {
        const weeklyAssignedIds = new Set<number>();
        const weeklyAssignments: Assignment[] = [];
        const localParticipants: Participant[] = JSON.parse(JSON.stringify(participantsState));

        // Prioritize subjects with higher difficulty score to ensure they get assigned first
        const sortedSubjects = [...this.activeSubjectTypes].sort((a, b) => this.getSubjectDifficulty(b) - this.getSubjectDifficulty(a));

        for (const subject of sortedSubjects) {
            
            const assignmentsForThisSubject: number[] = [];
            
            for (let i = 0; i < subject.nbParticipants; i++) {
                let candidates = getEligibleCandidates(subject, week, localParticipants, weeklyAssignedIds, this.rolePermissions, this.allSubjectTypes);
                
                let scoredCandidates: ScoredCandidate[];
                if (subject.isBinome && i > 0 && assignmentsForThisSubject.length > 0) {
                    const firstPartnerId = assignmentsForThisSubject[0];
                    const firstPartner = localParticipants.find(p => p.id === firstPartnerId)!;
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
                    const participantToUpdate = localParticipants.find(p => p.id === winner.participant.id)!;
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