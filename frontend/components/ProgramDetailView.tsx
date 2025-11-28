import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Program, Participant, SubjectType, Assignment, Role, RolePermissions } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { PrintLayout } from './ui/PrintLayout';
import { MAIN_TOPICS, COLORS } from '../constants';
import { ArrowLeftIcon, PrinterIcon, ShareIcon, UserCircleIcon, PencilSquareIcon, DocumentTextIcon } from './ui/Icons';
import { getEligibleCandidates } from '../services/algo/filtering.service';
import { api } from '../services/api';

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

const formatProgramRange = (startWeek: string, endWeek: string) => {
    const startRange = getWeekDateRange(startWeek);
    const endRange = getWeekDateRange(endWeek);
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

    const eligibleCandidates = useMemo(() => {
        const otherAssignedIdsInWeek = new Set<number>(
            program.assignments
                .filter(a => a.week === assignment.week && a.id !== assignment.id)
                .flatMap(a => a.participantIds)
        );
        return getEligibleCandidates(subject, assignment.week, participants, otherAssignedIdsInWeek, rolePermissions, subjectTypes);
    }, [assignment, subject, participants, program.assignments, rolePermissions, subjectTypes]);

    const finalOptions = useMemo(() => {
        const currentParticipants = assignment.participantIds
            .map(id => participants.find(p => p.id === id))
            .filter((p): p is Participant => !!p);
        
        const combined = [...eligibleCandidates, ...currentParticipants];
        const uniqueParticipants = Array.from(new Map(combined.map(p => [p.id, p])).values());
        
        return uniqueParticipants.sort((a,b) => a.name.localeCompare(b.name));
    }, [eligibleCandidates, assignment.participantIds, participants]);

    const handleParticipantChange = (index: number, newParticipantId: string) => {
        const newIds = [...currentParticipantIds];
        newIds[index] = parseInt(newParticipantId, 10);
        setCurrentParticipantIds(newIds);
    };

    const handleSave = () => {
        const finalParticipantIds = currentParticipantIds.filter(id => !isNaN(id));
        if (new Set(finalParticipantIds).size !== finalParticipantIds.length) {
            alert("Un participant ne peut être assigné qu'une seule fois à ce sujet.");
            return;
        }
        onSave({ 
            ...assignment, 
            participantIds: finalParticipantIds,
            customLabel: customLabel.trim() ? customLabel.trim() : undefined,
        });
    };

    return (
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
                            {finalOptions.map(p => {
                                const isEligible = eligibleCandidates.some(ec => ec.id === p.id);
                                const isCurrentlyAssignedInAnotherSlot = currentParticipantIds.includes(p.id) && currentParticipantIds[index] !== p.id;
                                const conflictText = !isEligible ? ' (Conflit de règles)' : '';

                                return (
                                    <option
                                        key={p.id}
                                        value={p.id}
                                        disabled={isCurrentlyAssignedInAnotherSlot}
                                        className="bg-slate-blue-800 text-slate-blue-50"
                                    >
                                        {p.name}{conflictText}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                ))}
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose} className="!bg-white !hover:bg-gray-50 !text-white !border !border-gray-300">Annuler</Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                </div>
            </div>
        </Modal>
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

    const getParticipantName = (id: number) => participants.find(p => p.id === id)?.name || 'Inconnu';
    const programRangeLabel = formatProgramRange(program.weekRange.start, program.weekRange.end);
    
    const allProgramWeeks = useMemo(() => {
        const weeks = new Set(program.assignments.map(a => a.week));
        const startWeekNum = parseInt(program.weekRange.start.split('-W')[1]);
        const endWeekNum = parseInt(program.weekRange.end.split('-W')[1]);
        const year = program.weekRange.start.split('-W')[0];

        for (let i = startWeekNum; i <= endWeekNum; i++) {
            weeks.add(`${year}-W${String(i).padStart(2, '0')}`);
        }
        
        return Array.from(weeks).sort();
    }, [program]);

    const handleSaveAssignment = async (assignmentToSave: Assignment) => {
        try {
            const existingAssignmentIndex = program.assignments.findIndex(a => a.id === assignmentToSave.id);
            let newAssignments: Assignment[];

            if (existingAssignmentIndex !== -1) {
                // Update existing assignment
                newAssignments = program.assignments.map(a => a.id === assignmentToSave.id ? assignmentToSave : a);
            } else {
                // Add new assignment
                const finalNewAssignment = {
                  ...assignmentToSave,
                  id: `${assignmentToSave.week}-${assignmentToSave.subjectTypeId}-${Date.now()}`
                };
                newAssignments = [...program.assignments, finalNewAssignment];
            }

            const updatedProgram = {
                ...program,
                assignments: newAssignments,
                updatedAt: new Date().toISOString(),
            };

            await api.updateProgram(program.id, updatedProgram);
            setPrograms(prevPrograms => prevPrograms.map(p => p.id === program.id ? updatedProgram : p));
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
        let shareText = `${program.title}\n\n`;
        const assignmentsByWeek = groupAssignmentsByWeek(program.assignments);
        const sortedWeeks = Object.keys(assignmentsByWeek).sort();

        for (const week of sortedWeeks) {
            shareText += `--- Semaine : ${week} ---\n`;
            const assignmentsForWeek = assignmentsByWeek[week];
            for (const topic of MAIN_TOPICS) {
                const topicAssignments = assignmentsForWeek.filter(a => subjectTypes.find(st => st.id === a.subjectTypeId)?.mainTopic === topic);
                if (topicAssignments.length > 0) {
                     shareText += `\n*${topic}*\n`;
                     topicAssignments.forEach(a => {
                         const subject = subjectTypes.find(st => st.id === a.subjectTypeId);
                         const displayLabel = a.customLabel || subject?.label;
                         const participantNames = a.participantIds.map(getParticipantName).join(' & ');
                         shareText += `  - ${displayLabel}: ${participantNames || 'Non attribué'}\n`;
                     });
                }
            }
             shareText += '\n';
        }
        try {
            await navigator.share({ title: program.title, text: shareText });
        } catch (error) {
            console.error('Erreur lors du partage :', error);
        }
    };

    if (isPrinting) {
        return <PrintLayout program={program} participants={participants} subjectTypes={subjectTypes} onClose={() => setIsPrinting(false)} />;
    }

    return (
        <><motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
        >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 p-6">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-start gap-4"
                    >
                        <div className="bg-white p-3 rounded-xl shadow-sm">
                            <DocumentTextIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900">Programme {programRangeLabel}</h3>
                            <p className="text-lg text-gray-700 max-w-3xl mt-2">
                                Consultez et modifiez les attributions pour ce programme hebdomadaire.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3"
                >
                    <Button onClick={onBack} variant="secondary" size="sm" className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Retour aux programmes
                    </Button>
                    <Button onClick={() => setIsPrinting(true)} variant="secondary" className="bg-green-600 hover:bg-green-700">
                        <PrinterIcon className="h-5 w-5 mr-2" />
                        Imprimer
                    </Button>
                    <Button onClick={handleShare} className="bg-green-600 hover:bg-green-700">
                        <ShareIcon className="h-5 w-5 mr-2" />
                        Partager
                    </Button>
                </motion.div>
            </div>
        </Card>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-8"
        >
                {allProgramWeeks.map(week => (
                    <div key={week}>
                        <motion.h4
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-green-200"
                        >
                            Semaine : {formatWeekHuman(week)}
                        </motion.h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MAIN_TOPICS.map(topic => {
                                const topicSubjects = subjectTypes.filter(s => s.mainTopic === topic && !s.isArchived);
                                if (topicSubjects.length === 0) return null;

                                const assignmentsByWeek = groupAssignmentsByWeek(program.assignments);
                                const topicColorName = topicSubjects[0].color;
                                const topicColorClass = COLORS[topicColorName as keyof typeof COLORS] || 'bg-slate-blue-700';

                                return (
                                    <motion.div
                                        key={topic}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        whileHover={{ y: -2 }}
                                        className="h-full"
                                    >
                                        <Card className="flex flex-col h-full bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                                            <div className={`p-5 rounded-t-xl ${topicColorClass} relative overflow-hidden`}>
                                                <motion.h4
                                                    initial={{ scale: 0.9 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.1, duration: 0.3 }}
                                                    className="text-xl font-bold text-white relative z-10"
                                                >
                                                    {topic}
                                                </motion.h4>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 animate-pulse" />
                                            </div>
                                            <div className="p-5 space-y-4 bg-gray-50 rounded-b-xl flex-grow">
                                                {topicSubjects.map((subject, subIndex) => {
                                                    const assignment = assignmentsByWeek[week]?.find(a => a.subjectTypeId === subject.id);
                                                    const labelClass = subject.uppercaseTitle ? 'uppercase tracking-wide' : '';
                                                    const displayLabel = assignment?.customLabel || subject.label;
                                                    return (
                                                        <motion.div
                                                            key={subject.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.2 + subIndex * 0.1, duration: 0.4 }}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <p className={`font-semibold text-gray-800 ${labelClass} text-base`}>{displayLabel}</p>
                                                                {role === Role.ADMIN && (
                                                                    <Button variant="secondary" size="sm" onClick={() => handleOpenAssignmentModal(subject, week, assignment)} title={assignment ? "Modifier l'affectation" : "Attribuer ce sujet"} className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300">
                                                                        <PencilSquareIcon className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            {assignment && assignment.participantIds.length > 0 ? (
                                                                <div className="mt-2 flex flex-col space-y-2">
                                                                    {assignment.participantIds.map(pid => (
                                                                        <motion.div
                                                                            key={pid}
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            transition={{ delay: 0.3 + subIndex * 0.1, duration: 0.3 }}
                                                                            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
                                                                        >
                                                                            <UserCircleIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                                                            <span title={`${getParticipantName(pid)} — ${participants.find(p => p.id === pid)?.spiritualRole || 'Rôle non défini'}`} className="font-medium">
                                                                                {getParticipantName(pid)}
                                                                            </span>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <motion.p
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    transition={{ delay: 0.3 + subIndex * 0.1, duration: 0.3 }}
                                                                    className="text-gray-500 italic mt-2 text-sm"
                                                                >
                                                                    Non attribué
                                                                </motion.p>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))}

            </motion.div>
        </motion.div>
            {editingAssignment && (
                <EditAssignmentModal
                    assignment={editingAssignment}
                    subject={subjectTypes.find(s => s.id === editingAssignment.subjectTypeId)!}
                    participants={participants}
                    onSave={handleSaveAssignment}
                    onClose={() => setEditingAssignment(null)}
                    program={program}
                    subjectTypes={subjectTypes}
                    rolePermissions={rolePermissions}
                />
            )}
        </>
    );
};
