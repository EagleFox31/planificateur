import { Participant, SubjectType, RolePermissions } from '../../types';

const getWeekValue = (week: string): number => {
    const [year, weekNum] = week.split('-W').map(Number);
    // Using 53 to handle all potential ISO week years simply
    return year * 53 + weekNum;
};

const hasRecentRotationConflict = (
    participant: Participant,
    subject: SubjectType,
    week: string,
    allSubjectTypes: SubjectType[]
): boolean => {
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
};


export function getEligibleCandidates(
    subject: SubjectType,
    week: string,
    allParticipants: Participant[],
    weeklyAssignedIds: Set<number>,
    rolePermissions: RolePermissions,
    allSubjectTypes: SubjectType[]
): Participant[] {
    return allParticipants.filter(p => {
        // Hard constraint: Excluded
        if (p.isExcluded) return false;

        // Hard constraint: Unavailable
        if (p.unavailabilities.includes(week)) return false;

        // Hard constraint: Already assigned this week
        if (weeklyAssignedIds.has(p.id)) return false;

        // Hard constraint: Gender
        if (subject.requiredGender && p.gender !== subject.requiredGender) return false;
        
        // Hard constraint: Spiritual Role
        if (subject.requiredSpiritualRole && p.spiritualRole !== subject.requiredSpiritualRole) return false;

        // Hard constraint: Role Permissions based on color
        const permissions = rolePermissions[p.spiritualRole] || [];
        if (!permissions.includes(subject.color)) return false;
        
        // Hard constraint: Rotation
        if (hasRecentRotationConflict(p, subject, week, allSubjectTypes)) return false;
        
        return true;
    });
}
