import React, { useEffect, useMemo } from 'react';
import { Program, Participant, SubjectType, Assignment } from '../../types';
import { MAIN_TOPICS } from '../../constants';

interface PrintLayoutProps {
    program: Program;
    participants: Participant[];
    subjectTypes: SubjectType[];
    onClose: () => void;
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

// Define text colors for printing to match the subject categories
const TEXT_COLORS_PRINT: { [key: string]: string } = {
  noir: 'text-gray-800',
  vert: 'text-green-700',
  marron: 'text-yellow-800',
  rouge: 'text-red-700',
};

export const PrintLayout: React.FC<PrintLayoutProps> = ({ program, participants, subjectTypes, onClose }) => {
    
    const getParticipantName = (id: number) => participants.find(p => p.id === id)?.name || 'Inconnu';
    const getParticipantTooltip = (id: number) => {
        const participant = participants.find(p => p.id === id);
        if (!participant) return 'Participant inconnu';
        const role = participant.spiritualRole || 'Rôle non défini';
        return `${participant.name} — ${role}`;
    };
    const formatParticipantList = (ids: number[]): React.ReactNode => {
        const names = ids.map(getParticipantName).filter(Boolean);
        if (names.length === 0) return '';
        if (names.length === 1) return names[0];

        const parts: React.ReactNode[] = [];
        names.forEach((name, idx) => {
            if (idx > 0) {
                const isLast = idx === names.length - 1;
                const separator = isLast ? (
                    <span key={`sep-${idx}`} className="text-blue-600">{' et '}</span>
                ) : ', ';
                parts.push(separator);
            }
            parts.push(<span key={`name-${idx}`}>{name}</span>);
        });

        return parts;
    };
    
    const assignmentsByWeek = useMemo(() => groupAssignmentsByWeek(program.assignments), [program.assignments]);
    const sortedWeeks = useMemo(() => Object.keys(assignmentsByWeek).sort(), [assignmentsByWeek]);

    useEffect(() => {
        // Trigger print dialog
        window.print();
        
        // Browsers might block scripts during print preview, so this might not fire until after.
        // We also add a button for manual closing.
        const handleAfterPrint = () => {
            onClose();
        };

        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);

    }, [onClose]);

    return (
        <>
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-section, #print-section * {
                        visibility: visible;
                    }
                    #print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print-no-break {
                        page-break-inside: avoid;
                    }
                    .print-break-after {
                         page-break-after: always;
                    }
                     #close-print-button {
                        display: none;
                    }
                    /* Ensure text colors are applied in print mode */
                    .text-black { color: #000 !important; }
                    .text-gray-800 { color: #1f2937 !important; }
                    .text-green-700 { color: #047857 !important; }
                    .text-yellow-800 { color: #854d0e !important; }
                    .text-red-700 { color: #b91c1c !important; }
                }
                @page {
                    size: A4;
                    margin: 2cm;
                }
                `}
            </style>
            <div id="print-section" className="bg-white text-black p-4 font-sans">
                 <button id="close-print-button" onClick={onClose} className="fixed top-4 right-4 bg-slate-blue-700 text-white px-4 py-2 rounded shadow-lg">
                    Fermer l'aperçu
                </button>
                <h1 className="text-3xl font-bold text-center mb-2 text-black">{program.title}</h1>
                <h2 className="text-xl text-center text-gray-800 mb-8">
                    Semaines du {program.weekRange.start} au {program.weekRange.end}
                </h2>
                
                {sortedWeeks.map((week, weekIndex) => (
                    <div key={week} className={weekIndex < sortedWeeks.length -1 ? "print-break-after" : ""}>
                        <h3 className="text-2xl font-bold mt-6 mb-4 border-b-2 border-gray-300 pb-2 text-black">
                            Programme de la semaine : {week}
                        </h3>
                        
                        <div className="space-y-4">
                           {MAIN_TOPICS.map(topic => {
                                const topicSubjects = subjectTypes.filter(s => s.mainTopic === topic && !s.isArchived);
                                const assignmentsForTopic = assignmentsByWeek[week]?.filter(a => topicSubjects.some(ts => ts.id === a.subjectTypeId)) || [];
                                if (assignmentsForTopic.length === 0) return null;
                               
                                return (
                                    <div key={topic} className="print-no-break">
                                        <h4 className="text-xl font-semibold mb-2 text-black">{topic}</h4>
                                        <table className="min-w-full border-collapse">
                                            <tbody>
                                            {topicSubjects.map(subject => {
                                                const assignment = assignmentsByWeek[week].find(a => a.subjectTypeId === subject.id);
                                                if (!assignment) return null;
                                                const labelClass = subject.uppercaseTitle ? 'uppercase' : '';
                                                const displayLabel = assignment.customLabel || subject.label;
                                                const textColorClass = TEXT_COLORS_PRINT[subject.color as keyof typeof TEXT_COLORS_PRINT] || 'text-black';

                                                return (
                                                    <tr key={subject.id} className="border-b border-gray-200">
                                                        <td className={`w-1/2 p-2 font-bold ${labelClass} ${textColorClass}`}>{displayLabel}</td>
                                                        <td className="w-1/2 p-2 text-black">
                                                            <span title={assignment.participantIds.map(getParticipantTooltip).join(' | ')}>
                                                                {formatParticipantList(assignment.participantIds)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                           })}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};
