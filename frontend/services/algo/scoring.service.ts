import { Participant, SubjectType } from '../../types';
import { ScoredCandidate } from './types';

const BASE_SCORE = 100;

const getWeekValue = (week: string): number => {
    const [year, weekNum] = week.split('-W').map(Number);
    return year * 53 + weekNum;
};

function calculateBaseScore(participant: Participant, week: string): number {
    let score = BASE_SCORE;
    
    // Malus for total workload
    score -= participant.assignmentHistory.length * 2; // -2 per assignment

    // Malus for recency & bonus for inactivity
    const currentWeekValue = getWeekValue(week);
    const lastAssignment = participant.assignmentHistory.sort((a,b) => getWeekValue(b.week) - getWeekValue(a.week))[0];
    if (lastAssignment) {
        const lastAssignmentWeekValue = getWeekValue(lastAssignment.week);
        const weeksSinceLast = currentWeekValue - lastAssignmentWeekValue;
        
        if (weeksSinceLast === 1) score -= 25; // Last week
        if (weeksSinceLast <= 4) score -= 10; // Within the last month

        // Bonus for inactivity (capped at 20 weeks to not overly prioritize long-inactive people)
        score += Math.min(weeksSinceLast, 20);
    } else {
        score += 20; // Bonus for new participants with no history
    }

    return score;
}

export function scoreCandidates(
    candidates: Participant[],
    subject: SubjectType,
    week: string
): ScoredCandidate[] {
    return candidates.map(p => {
        let score = calculateBaseScore(p, week);

        // Malus for topic repetition
        const topicRepetitions = p.assignmentHistory.filter(h => h.subjectTypeId === subject.id).length;
        score -= topicRepetitions * 15;
        
        return { participant: p, score };
    }).sort((a, b) => b.score - a.score);
}

const isFamily = (p1: Participant, p2: Participant): boolean => {
    if (p1.id === p2.id) return false;
    // Check if p1 has an affiliation with p2. Assumes reciprocal affiliations are defined.
    return p1.affiliation.some(aff => aff.withParticipantId === p2.id);
}

export function scoreBinomePartner(
    candidates: Participant[],
    firstPartner: Participant,
    subject: SubjectType,
    week: string
): ScoredCandidate[] {
    return candidates.map(p => {
        let score = calculateBaseScore(p, week);

        // HUGE bonus for family
        if (isFamily(firstPartner, p)) {
            score += 1000;
        }

        // Significant bonus for same gender
        if (firstPartner.gender === p.gender) {
            score += 200;
        }
        
        return { participant: p, score };
    }).sort((a, b) => b.score - a.score);
}
