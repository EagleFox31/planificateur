import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Program, Participant, SubjectType, Assignment, Role, RolePermissions } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PrintLayout } from './ui/PrintLayout';
import { MAIN_TOPICS } from '../constants';
import { ArrowLeftIcon, PrinterIcon, ShareIcon, PencilSquareIcon, DocumentArrowUpIcon } from './ui/Icons';
import { api } from '../services/api';
import { getEligibleCandidates } from '../services/algo/filtering.service';
import { getDefaultCapabilities, getRoleCapabilityDefaults } from '../utils/capabilities';

const MONTH_LABELS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const getWeekDateRange = (week: string) => {
    const [yearStr, weekStr] = week.split('-W');
    const year = parseInt(yearStr, 10);
    const weekNumber = parseInt(weekStr, 10);
    if (isNaN(year) || isNaN(weekNumber)) return null;

    const firstThursday = new Date(year, 0, 1);
    while (firstThursday.getDay() !== 4) {
        firstThursday.setDate(firstThursday.getDate() + 1);
    }

    const weekStart = new Date(firstThursday);
    weekStart.setDate(firstThursday.getDate() - 3 + (weekNumber - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { start: weekStart, end: weekEnd };
};

const parseDateOnly = (dateString?: string) => {
    if (!dateString) return null;
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
    return new Date(year, month, day);
};

const getWeekValue = (week: string) => {
    const [yearStr, weekStr] = week.split('-W');
    const year = parseInt(yearStr, 10);
    const weekNumber = parseInt(weekStr, 10);
    if (Number.isNaN(year) || Number.isNaN(weekNumber)) return null;
    return year * 53 + weekNumber;
};

const getWeekDateRangeFromStartDate = (week: string, startWeek: string, startDate?: string) => {
    const parsedStartDate = parseDateOnly(startDate);
    const startWeekValue = getWeekValue(startWeek);
    const weekValue = getWeekValue(week);
    if (!parsedStartDate || startWeekValue === null || weekValue === null) {
        return getWeekDateRange(week);
    }
    const offsetWeeks = weekValue - startWeekValue;
    const weekStart = new Date(parsedStartDate);
    weekStart.setDate(parsedStartDate.getDate() + offsetWeeks * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { start: weekStart, end: weekEnd };
};

const formatRangeLabel = (start: Date, end: Date) => {
    const sameYear = start.getFullYear() === end.getFullYear();
    const startLabel = `${start.getDate().toString().padStart(2, '0')} ${MONTH_LABELS[start.getMonth()]}`;
    const endLabel = `${end.getDate().toString().padStart(2, '0')} ${MONTH_LABELS[end.getMonth()]}`;
    if (sameYear) {
        return `du ${startLabel} au ${endLabel} ${start.getFullYear()}`;
    }
    return `du ${startLabel} ${start.getFullYear()} au ${endLabel} ${end.getFullYear()}`;
};

const formatWeekHuman = (week: string) => {
    const range = getWeekDateRange(week);
    if (!range) return `Semaine ${week}`;
    return `Semaine ${formatRangeLabel(range.start, range.end)}`;
};

const formatWeekHumanFromStartDate = (week: string, startWeek: string, startDate?: string) => {
    const range = getWeekDateRangeFromStartDate(week, startWeek, startDate);
    if (!range) return `Semaine ${week}`;
    return `Semaine ${formatRangeLabel(range.start, range.end)}`;
};

const formatProgramRange = (startWeek: string, endWeek: string) => {
    const startRange = getWeekDateRange(startWeek);
    const endRange = getWeekDateRange(endWeek);
    if (!startRange || !endRange) return `des semaines ${startWeek} à ${endWeek}`;
    return formatRangeLabel(startRange.start, endRange.end);
};

const formatProgramRangeFromStartDate = (startWeek: string, endWeek: string, startDate?: string) => {
    const startRange = getWeekDateRangeFromStartDate(startWeek, startWeek, startDate);
    const endRange = getWeekDateRangeFromStartDate(endWeek, startWeek, startDate);
    if (!startRange || !endRange) return `des semaines ${startWeek} à ${endWeek}`;
    return formatRangeLabel(startRange.start, endRange.end);
};

interface EditAssignmentModalProps {
    assignment: Assignment;
    subject: SubjectType;
    participants: Participant[];
    onSave: (updatedAssignment: Assignment) => void;
    onClose: () => void;
    program: Program;
    subjectTypes: SubjectType[];
    rolePermissions: RolePermissions;
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({ assignment, subject, participants, onSave, onClose, program, subjectTypes, rolePermissions }) => {
    const [currentParticipantIds, setCurrentParticipantIds] = useState(assignment.participantIds);
    const [customLabel, setCustomLabel] = useState(assignment.customLabel || '');
    const [showUnavailableWarning, setShowUnavailableWarning] = useState(false);
    const [pendingUnavailableParticipant, setPendingUnavailableParticipant] = useState<{id: number, name: string} | null>(null);
    const [pendingUnavailableIndex, setPendingUnavailableIndex] = useState<number | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Get all participants with required capabilities for this subject
    const allCapableParticipants = useMemo(() => {
        return participants.filter(p => {
            if (p.isExcluded) return false;

            // Check if participant has required spiritual role
            if (subject.requiredSpiritualRole && p.spiritualRole !== subject.requiredSpiritualRole) {
                return false;
            }

            // Check if participant has required gender
            if (subject.requiredGender && p.gender !== subject.requiredGender) {
                return false;
            }

            // Check if participant has required capability (when defined)
            const requiredCapability = subject.requiredCapability;
            if (!requiredCapability) return true;
            const participantCapabilities = getRoleCapabilityDefaults(rolePermissions, p.spiritualRole, p.gender);
            const hasCapability = p.capabilities?.[requiredCapability] ?? participantCapabilities[requiredCapability];

            return !!hasCapability;
        });
    }, [participants, subject, rolePermissions]);

    // Get eligible candidates (those who can actually be assigned)
    const eligibleCandidates = useMemo(() => {
        const safeAssignments = Array.isArray(program.assignments) ? program.assignments : [];
        const otherAssignedIdsInWeek = new Set<number>(
            safeAssignments
                .filter(a => a.week === assignment.week && a.id !== assignment.id)
                .flatMap(a => a.participantIds)
        );
        return getEligibleCandidates(subject, assignment.week, participants, otherAssignedIdsInWeek, rolePermissions, subjectTypes);
    }, [assignment, subject, participants, program.assignments, rolePermissions, subjectTypes]);

    // Combine all capable participants with eligibility status
    const participantOptions = useMemo(() => {
        const eligibleIds = new Set(eligibleCandidates.map(p => p.id));

        return allCapableParticipants.map(p => ({
            ...p,
            isEligible: eligibleIds.has(p.id)
        })).sort((a, b) => a.name.localeCompare(b.name));
    }, [allCapableParticipants, eligibleCandidates]);

    const handleParticipantChange = (index: number, newParticipantId: string) => {
        const participantId = parseInt(newParticipantId, 10);
        const selectedParticipant = participantOptions.find(p => p.id === participantId);
        setValidationError(null);

        if (selectedParticipant && !selectedParticipant.isEligible) {
            // Show warning for unavailable participant
            setPendingUnavailableParticipant({ id: participantId, name: selectedParticipant.name });
            setPendingUnavailableIndex(index);
            setShowUnavailableWarning(true);
            return;
        }

        const newIds = [...currentParticipantIds];
        newIds[index] = participantId;
        setCurrentParticipantIds(newIds);
    };

    const handleConfirmUnavailableParticipant = () => {
        if (pendingUnavailableParticipant && pendingUnavailableIndex !== null) {
            const newIds = [...currentParticipantIds];
            newIds[pendingUnavailableIndex] = pendingUnavailableParticipant.id;
            setCurrentParticipantIds(newIds);
        }
        setShowUnavailableWarning(false);
        setPendingUnavailableParticipant(null);
        setPendingUnavailableIndex(null);
    };

    const handleCancelUnavailableParticipant = () => {
        setShowUnavailableWarning(false);
        setPendingUnavailableParticipant(null);
        setPendingUnavailableIndex(null);
    };

    const handleSave = () => {
        const finalParticipantIds = currentParticipantIds.filter(id => !isNaN(id));
        if (new Set(finalParticipantIds).size !== finalParticipantIds.length) {
            setValidationError("Un participant ne peut être assigné qu'une seule fois à ce sujet.");
            return;
        }
        // Enforce: no participant can be assigned to multiple subjects in the same week
        const safeAssignments = Array.isArray(program.assignments) ? program.assignments : [];
        const otherAssignmentsSameWeek = safeAssignments.filter(a => a.week === assignment.week && a.id !== assignment.id);
        const conflict = finalParticipantIds.find(pid => otherAssignmentsSameWeek.some(a => a.participantIds.includes(pid)));
        if (conflict) {
            setValidationError("Un participant ne peut pas être assigné à plusieurs sujets la même semaine.");
            return;
        }
        onSave({ 
            ...assignment, 
            participantIds: finalParticipantIds,
            customLabel: customLabel.trim() ? customLabel.trim() : undefined,
        });
    };

    return (
        <>
            <Modal title={`Modifier : ${subject.label}`} onClose={onClose}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-blue-400">Semaine : {assignment.week}</p>

                    <div>
                        <label htmlFor="customLabel" className="block text-sm font-medium text-slate-blue-300">
                            Intitulé du sujet (Optionnel)
                        </label>
                        <input
                            id="customLabel"
                            type="text"
                            value={customLabel}
                            onChange={(e) => setCustomLabel(e.target.value)}
                            placeholder={subject.label}
                            className="w-full bg-slate-blue-700 border border-slate-blue-600 rounded-md px-3 py-2 mt-1 focus:ring-sanctus-blue focus:border-sanctus-blue"
                        />
                         <p className="text-xs text-slate-blue-400 mt-1">Laissez vide pour utiliser l'intitulé par défaut.</p>
                    </div>

                    {Array.from({ length: subject.nbParticipants }).map((_, index) => (
                        <div key={index}>
                            <label className="block text-sm font-medium text-slate-blue-300">
                                Participant {subject.nbParticipants > 1 ? index + 1 : ''}
                            </label>
                            <select
                                value={currentParticipantIds[index] || ''}
                                onChange={(e) => handleParticipantChange(index, e.target.value)}
                                className="w-full bg-slate-blue-700 border border-slate-blue-600 rounded-md px-3 py-2 mt-1 focus:ring-sanctus-blue focus:border-sanctus-blue text-slate-blue-50"
                            >
                                <option value="" disabled className="bg-slate-blue-800 text-slate-blue-200">Sélectionner un participant</option>
                                {participantOptions.map(p => {
                                    const isCurrentlyAssignedInAnotherSlot = currentParticipantIds.includes(p.id) && currentParticipantIds[index] !== p.id;
                                    const isUnavailable = !p.isEligible;

                                    return (
                                        <option
                                            key={p.id}
                                            value={p.id}
                                            disabled={isCurrentlyAssignedInAnotherSlot}
                                            className={`${isUnavailable ? 'text-red-400' : 'text-slate-blue-50'} bg-slate-blue-800`}
                                            style={{ color: isUnavailable ? '#f87171' : undefined }}
                                        >
                                            {p.name} {isUnavailable ? '(Indisponible)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    ))}
                    <div className="flex justify-end space-x-3 pt-4">
                        {validationError && (
                            <p className="text-sm text-red-600 mr-auto">{validationError}</p>
                        )}
                        <Button variant="secondary" onClick={onClose} className="!bg-white !hover:bg-gray-50 !text-slate-800 !border !border-gray-300">Annuler</Button>
                        <Button onClick={handleSave}>Enregistrer</Button>
                    </div>
                </div>
            </Modal>

            {showUnavailableWarning && pendingUnavailableParticipant && (
                <Modal title="Participant indisponible" onClose={handleCancelUnavailableParticipant}>
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Attention : Participant indisponible
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                <strong>{pendingUnavailableParticipant.name}</strong> n'est pas disponible pour ce sujet cette semaine
                                en raison des règles d'attribution automatique (rotation, indisponibilités, etc.).
                            </p>
                            <p className="text-sm text-gray-500">
                                Voulez-vous forcer cette assignation malgré tout ?
                            </p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button variant="secondary" onClick={handleCancelUnavailableParticipant}>
                                Annuler
                            </Button>
                            <Button onClick={handleConfirmUnavailableParticipant} className="bg-red-600 hover:bg-red-700">
                                Forcer l'assignation
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

interface ProgramDetailViewProps {
    program: Program;
    participants: Participant[];
    subjectTypes: SubjectType[];
    onBack: () => void;
    role: Role;
    setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
    rolePermissions: RolePermissions;
}

const groupAssignmentsByWeek = (assignments: Assignment[]) => {
    return assignments.reduce((acc, assignment) => {
        const { week } = assignment;
        if (!acc[week]) {
            acc[week] = [];
        }
        acc[week].push(assignment);
        return acc;
    }, {} as { [week: string]: Assignment[] });
};

export const ProgramDetailView: React.FC<ProgramDetailViewProps> = ({ program, participants, subjectTypes, onBack, role, setPrograms, rolePermissions }) => {
    const [isPrinting, setIsPrinting] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [localProgram, setLocalProgram] = useState<Program>(program);
    const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(new Set());
    const toggleWeek = (week: string) => setCollapsedWeeks((prev: Set<string>) => {
        const next = new Set(prev);
        next.has(week) ? next.delete(week) : next.add(week);
        return next;
    });
    useEffect(() => {
        setLocalProgram(program);
    }, [program]);
    const safeAssignments = Array.isArray(localProgram.assignments) ? localProgram.assignments : [];
    const safeSubjects = Array.isArray(subjectTypes) ? subjectTypes : [];
    const safeParticipants = Array.isArray(participants) ? participants : [];

    const getParticipantName = (id: number) => safeParticipants.find(p => p.id === id)?.name || 'Inconnu';
    const programRangeLabel = formatProgramRangeFromStartDate(localProgram.weekRange.start, localProgram.weekRange.end, localProgram.startDate);
    
    const allProgramWeeks = useMemo(() => {
        const weeks = new Set(safeAssignments.map(a => a.week));
        const startWeekNum = parseInt(localProgram.weekRange.start.split('-W')[1]);
        const endWeekNum = parseInt(localProgram.weekRange.end.split('-W')[1]);
        const year = localProgram.weekRange.start.split('-W')[0];

        for (let i = startWeekNum; i <= endWeekNum; i++) {
            weeks.add(`${year}-W${String(i).padStart(2, '0')}`);
        }
        
        return Array.from(weeks).sort();
    }, [program]);

    const handleSaveAssignment = async (assignmentToSave: Assignment) => {
        try {
            const existingAssignmentIndex = safeAssignments.findIndex(a => a.id === assignmentToSave.id);
            let newAssignments: Assignment[];

            if (existingAssignmentIndex !== -1) {
                // Update existing assignment
                newAssignments = safeAssignments.map(a => a.id === assignmentToSave.id ? assignmentToSave : a);
            } else {
                // Add new assignment
                const finalNewAssignment = {
                  ...assignmentToSave,
                  id: `${assignmentToSave.week}-${assignmentToSave.subjectTypeId}-${Date.now()}`
                };
                newAssignments = [...safeAssignments, finalNewAssignment];
            }

            const updatedProgram: Program = {
                ...localProgram,
                assignments: newAssignments,
                updatedAt: new Date().toISOString(),
            };

            await api.updateProgram(localProgram.id, updatedProgram);
            setLocalProgram(updatedProgram);
            setPrograms(prevPrograms => prevPrograms.map(p => p.id === localProgram.id ? updatedProgram : p));
        } catch (error) {
            console.error('Error saving assignment:', error);
        }
        setEditingAssignment(null);
    };
    
    const handleOpenAssignmentModal = (subject: SubjectType, week: string, assignment?: Assignment) => {
        if (assignment) {
            setEditingAssignment(assignment);
        } else {
            const newAssignmentTemplate: Assignment = {
                id: `new-${week}-${subject.id}`, // Temporary ID for creation logic
                week,
                subjectTypeId: subject.id,
                participantIds: [],
            };
            setEditingAssignment(newAssignmentTemplate);
        }
    };

    const handleShare = async () => {
        if (!navigator.share) {
            alert("La fonction de partage n'est pas disponible sur ce navigateur.");
            return;
        }
        let shareText = `${localProgram.title}\n\n`;
        const assignmentsByWeek = groupAssignmentsByWeek(safeAssignments);
        const sortedWeeks = Object.keys(assignmentsByWeek).sort();

        for (const week of sortedWeeks) {
            shareText += `--- Semaine : ${week} ---\n`;
            const assignmentsForWeek = assignmentsByWeek[week];
            for (const topic of MAIN_TOPICS) {
                const topicAssignments = assignmentsForWeek.filter(a => safeSubjects.find(st => st.id === a.subjectTypeId)?.mainTopic === topic);
                if (topicAssignments.length > 0) {
                     shareText += `\n*${topic}*\n`;
                     topicAssignments.forEach(a => {
                         const subject = safeSubjects.find(st => st.id === a.subjectTypeId);
                         const displayLabel = a.customLabel || subject?.label;
                         const participantNames = a.participantIds.map(getParticipantName).join(' & ');
                         shareText += `  - ${displayLabel}: ${participantNames || 'Non attribué'}\n`;
                     });
                }
            }
             shareText += '\n';
        }
        try {
            await navigator.share({ title: localProgram.title, text: shareText });
        } catch (error) {
            console.error('Erreur lors du partage :', error);
        }
    };

    const handleExportDocx = async () => {
        try {
            const {
                AlignmentType,
                BorderStyle,
                Document,
                Packer,
                Paragraph,
                Table,
                TableCell,
                TableRow,
                TextRun,
                WidthType,
            } = await import('docx');
            const assignmentsByWeek = groupAssignmentsByWeek(safeAssignments);
            const sortedWeeks = Object.keys(assignmentsByWeek).sort();

            const textColorBySubject: Record<string, string> = {
                noir: '1F2937',
                vert: '047857',
                marron: '854D0E',
                rouge: 'B91C1C',
            };

            const formatParticipantListForDocx = (ids: number[]): string => {
                const names = ids.map(getParticipantName).filter(Boolean);
                if (names.length === 0) return '';
                if (names.length === 1) return names[0];
                if (names.length === 2) return `${names[0]} et ${names[1]}`;
                return `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;
            };

            const subtitle = programRangeLabel
                ? `Programme ${programRangeLabel}`
                : `Semaines du ${localProgram.weekRange.start} au ${localProgram.weekRange.end}`;

            const docChildren: any[] = [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 140 },
                    children: [new TextRun({ text: localProgram.title, bold: true, size: 36 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 380 },
                    children: [new TextRun({ text: subtitle, size: 28 })],
                }),
            ];

            sortedWeeks.forEach((week, weekIndex) => {
                docChildren.push(
                    new Paragraph({
                        pageBreakBefore: weekIndex > 0,
                        spacing: { after: 240 },
                        border: {
                            bottom: {
                                color: 'D1D5DB',
                                size: 6,
                                space: 1,
                                style: BorderStyle.SINGLE,
                            },
                        },
                        children: [
                            new TextRun({
                                text: `Programme de la semaine : ${week}`,
                                bold: true,
                                size: 30,
                                color: '000000',
                            }),
                        ],
                    })
                );

                MAIN_TOPICS.forEach((topic) => {
                    const topicSubjects = safeSubjects.filter(
                        (subject) => subject.mainTopic === topic && !subject.isArchived
                    );
                    const assignmentsForTopic = assignmentsByWeek[week]?.filter((assignment) =>
                        topicSubjects.some((subject) => subject.id === assignment.subjectTypeId)
                    ) || [];

                    if (assignmentsForTopic.length === 0) return;

                    docChildren.push(
                        new Paragraph({
                            spacing: { after: 120 },
                            children: [new TextRun({ text: topic, bold: true, size: 26, color: '000000' })],
                        })
                    );

                    const rows = topicSubjects
                        .map((subject) => {
                            const assignment = assignmentsByWeek[week]?.find((item) => item.subjectTypeId === subject.id);
                            if (!assignment) return null;

                            const displayLabel = subject.uppercaseTitle
                                ? (assignment.customLabel || subject.label).toUpperCase()
                                : (assignment.customLabel || subject.label);
                            const participantNames = formatParticipantListForDocx(assignment.participantIds);
                            const textColor = textColorBySubject[subject.color] || '000000';

                            return new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, color: 'E5E7EB', size: 4 },
                                            bottom: { style: BorderStyle.SINGLE, color: 'E5E7EB', size: 4 },
                                            left: { style: BorderStyle.NONE, color: 'FFFFFF', size: 0 },
                                            right: { style: BorderStyle.NONE, color: 'FFFFFF', size: 0 },
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: displayLabel,
                                                        bold: true,
                                                        color: textColor,
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, color: 'E5E7EB', size: 4 },
                                            bottom: { style: BorderStyle.SINGLE, color: 'E5E7EB', size: 4 },
                                            left: { style: BorderStyle.NONE, color: 'FFFFFF', size: 0 },
                                            right: { style: BorderStyle.NONE, color: 'FFFFFF', size: 0 },
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: participantNames || 'Non attribue',
                                                        color: '000000',
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            });
                        })
                        .filter(Boolean) as InstanceType<typeof TableRow>[];

                    if (rows.length > 0) {
                        docChildren.push(
                            new Table({
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                rows,
                            })
                        );
                        docChildren.push(new Paragraph({ spacing: { after: 120 } }));
                    }
                });
            });

            if (sortedWeeks.length === 0) {
                docChildren.push(
                    new Paragraph({
                        children: [new TextRun({ text: 'Aucune affectation disponible.', color: '6B7280' })],
                    })
                );
            }

            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: docChildren,
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            const filename = `programme-${localProgram.weekRange.start}-${localProgram.weekRange.end}.docx`;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erreur lors de l'export DOCX :", error);
            alert("Impossible d'exporter le programme en DOCX.");
        }
    };

    if (isPrinting) {
        return <PrintLayout program={program} participants={participants} subjectTypes={subjectTypes} onClose={() => setIsPrinting(false)} />;
    }


    const assignmentsByWeekMap = groupAssignmentsByWeek(safeAssignments);

    return (
        <>
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">{localProgram.title}</h1>
                        <p className="text-sm text-gray-400">{programRangeLabel}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setIsPrinting(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <PrinterIcon className="h-4 w-4" /> Imprimer
                    </button>
                    <button
                        onClick={handleExportDocx}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <DocumentArrowUpIcon className="h-4 w-4" /> DOCX
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                        <ShareIcon className="h-4 w-4" /> Partager
                    </button>
                </div>
            </div>

            {/* Weeks — scrollable container */}
            <div className="overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {allProgramWeeks.map((week, weekIdx) => {
                const weekLabel = formatWeekHumanFromStartDate(week, localProgram.weekRange.start, localProgram.startDate);
                const weekAssignments = assignmentsByWeekMap[week] || [];
                const isCollapsed = collapsedWeeks.has(week);

                return (
                    <motion.div
                        key={week}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: weekIdx * 0.05 }}
                    >
                        {/* Week header — collapsible */}
                        <button
                            onClick={() => toggleWeek(week)}
                            className="w-full px-6 py-4 flex items-center justify-between bg-[#D6C4A8] hover:bg-[#C9B599] transition-colors text-left"
                        >
                            <div>
                                <p className="text-base font-bold text-[#3d2e1e]">Programme de la semaine : {week}</p>
                                <p className="text-xs text-[#7a5c3a] mt-0.5">{weekLabel}</p>
                            </div>
                            <svg
                                className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Sections */}
                        {!isCollapsed && (
                            <div className="border-t border-gray-100 pb-3">
                                {MAIN_TOPICS.map(topic => {
                                    const topicSubjects = safeSubjects.filter(s => s.mainTopic === topic && !s.isArchived);
                                    if (topicSubjects.length === 0) return null;

                                    return (
                                        <div key={topic}>
                                            {/* Section label */}
                                            <p className="px-6 pt-4 pb-1 text-sm text-gray-500">{topic}</p>

                                            {/* Subject rows */}
                                            {topicSubjects.map(subject => {
                                                const assignment = weekAssignments.find(a => a.subjectTypeId === subject.id);
                                                const displayLabel = assignment?.customLabel || subject.label;
                                                const names = assignment?.participantIds.map(id => getParticipantName(id)) ?? [];
                                                const colorClass: Record<string, string> = {
                                                    noir: 'text-gray-800',
                                                    vert: 'text-emerald-700',
                                                    marron: 'text-amber-800',
                                                    rouge: 'text-red-700',
                                                };
                                                const labelColor = colorClass[subject.color] ?? 'text-gray-800';

                                                return (
                                                    <div
                                                        key={subject.id}
                                                        className="flex items-center justify-between px-6 py-2.5 border-b border-gray-50 hover:bg-gray-50/60 transition-colors group"
                                                    >
                                                        {/* Label */}
                                                        <span className={`text-sm font-semibold ${labelColor} ${subject.uppercaseTitle ? 'uppercase tracking-wide' : ''} flex-1 pr-4 leading-snug`}>
                                                            {displayLabel}
                                                        </span>

                                                        {/* Participants + edit */}
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {names.length > 0 ? (
                                                                <span className="text-sm text-gray-900">
                                                                    {names.length > 1
                                                                        ? <>{names[0]} <span className={`font-light ${labelColor}`}>et</span> {names[1]}</>
                                                                        : names[0]
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-gray-300 italic">Non attribué</span>
                                                            )}
                                                            {role === Role.ADMIN && (
                                                                <button
                                                                    onClick={() => handleOpenAssignmentModal(subject, week, assignment)}
                                                                    title="Modifier"
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                                                                >
                                                                    <PencilSquareIcon className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                );
            })}
            </div>
            </div>{/* end scrollable weeks */}
        </motion.div>

        {editingAssignment && (
            <EditAssignmentModal
                assignment={editingAssignment}
                subject={subjectTypes.find(s => s.id === editingAssignment.subjectTypeId)!}
                participants={participants}
                onSave={handleSaveAssignment}
                onClose={() => setEditingAssignment(null)}
                program={localProgram}
                subjectTypes={subjectTypes}
                rolePermissions={rolePermissions}
            />
        )}
        </>
    );
};
