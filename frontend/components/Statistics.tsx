import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Assignment, Participant, SubjectType } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { BookOpenIcon } from './ui/Icons';
import { THEME_CLASSES } from '../styles/theme';

interface StatisticsProps {
  assignments: Assignment[];
  participants: Participant[];
  subjectTypes: SubjectType[];
}

const THEME_COLORS = ['#4f85e4', '#52a352', '#d4af37', '#e48a4f', '#a352a3', '#52a39f', '#a35252'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const displayLabel = label || entry?.payload?.name || entry?.name || '';
    const valueLabel = entry?.name || entry?.payload?.name || '';
    return (
      <div className="bg-slate-blue-800/80 backdrop-blur-md p-3 border border-slate-blue-600 rounded-md shadow-lg">
        <p className="label font-semibold text-white">{displayLabel}</p>
        <p className="intro text-sanctus-blue-light">{`${valueLabel} : ${entry?.value}`}</p>
      </div>
    );
  }

  return null;
};

const GUIDE_STEPS = [
    {
      title: "Cartes KPI",
      description: "Ces cartes montrent les métriques clés : nombre de participants actifs, total d'attributions, moyenne par participant et taux de participation.",
      element: "kpi-cards"
    },
    {
      title: "Attributions par sujet principal",
      description: "Répartition des attributions par sujet. Permet de voir quels sujets sont les plus populaires et ajuster la configuration.",
      element: "chart-2"
    },
    {
      title: "Couverture par sujet",
      description: "Nombre de participants uniques par sujet principal. Montre la diversité des attributions.",
      element: "chart-5"
    },
    {
      title: "Matrice de compétences",
      description: "Heatmap montrant les attributions des participants les plus actifs sur les principaux sujets. Plus la couleur est intense, plus d'attributions pour ce participant-sujet.",
      element: "chart-7"
    }
 ];

const ITEMS_PER_PAGE = 10;

export const Statistics: React.FC<StatisticsProps> = ({ assignments, participants, subjectTypes }) => {
   const [isGuideOpen, setIsGuideOpen] = useState(false);
   const [currentStep, setCurrentStep] = useState(0);
   const [matrixPage, setMatrixPage] = useState(1);

   const startGuide = () => {
     setCurrentStep(0);
     setIsGuideOpen(true);
   };

   const nextStep = () => {
     if (currentStep < GUIDE_STEPS.length - 1) {
       setCurrentStep(currentStep + 1);
     } else {
       setIsGuideOpen(false);
     }
   };

   const prevStep = () => {
     if (currentStep > 0) {
       setCurrentStep(currentStep - 1);
     }
   };

   const closeGuide = () => {
     setIsGuideOpen(false);
   };

   React.useEffect(() => {
     if (isGuideOpen && GUIDE_STEPS[currentStep]) {
       const element = document.getElementById(GUIDE_STEPS[currentStep].element);
       if (element) {
         element.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
     }
   }, [currentStep, isGuideOpen]);

   const kpiData = useMemo(() => {
     const safeParticipants = Array.isArray(participants) ? participants : [];
     const safeAssignments = Array.isArray(assignments) ? assignments : [];
     const activeParticipants = safeParticipants.filter(p => safeAssignments.some(a => a.participantIds.includes(p.id))).length;
     const totalAssignments = safeAssignments.length;
     const avgAssignments = activeParticipants > 0 ? (totalAssignments / activeParticipants).toFixed(1) : '0';
     const participationRate = safeParticipants.length > 0 ? ((activeParticipants / safeParticipants.length) * 100).toFixed(1) : '0';

     return {
       activeParticipants,
       totalAssignments,
       avgAssignments,
       participationRate
     };
   }, [assignments, participants]);

   const assignmentsPerParticipant = useMemo(() => {
     const safeParticipants = Array.isArray(participants) ? participants : [];
     const safeAssignments = Array.isArray(assignments) ? assignments : [];
     return safeParticipants
       .map(p => ({
         name: p.name,
         Attributions: safeAssignments.filter(a => a.participantIds.includes(p.id)).length,
       }))
       .filter(p => p.Attributions > 0)
       .sort((a,b) => b.Attributions - a.Attributions)
       .slice(0, 10);
   }, [assignments, participants]);

  const assignmentsPerSubjectType = useMemo(() => {
    const safeAssignments = Array.isArray(assignments) ? assignments : [];
    const safeSubjectTypes = Array.isArray(subjectTypes) ? subjectTypes : [];
    const counts: { [key: string]: number } = {};
    for (const assignment of safeAssignments) {
      const subject = safeSubjectTypes.find(s => s.id === assignment.subjectTypeId);
      if (subject) {
        counts[subject.mainTopic] = (counts[subject.mainTopic] || 0) + 1;
      }
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [assignments, subjectTypes]);

  const participantsPerSubjectType = useMemo(() => {
    const safeAssignments = Array.isArray(assignments) ? assignments : [];
    const safeSubjectTypes = Array.isArray(subjectTypes) ? subjectTypes : [];
    const participantSets: { [key: string]: Set<number> } = {};
    for (const assignment of safeAssignments) {
      const subject = safeSubjectTypes.find(s => s.id === assignment.subjectTypeId);
      if (subject) {
        if (!participantSets[subject.mainTopic]) {
          participantSets[subject.mainTopic] = new Set();
        }
        assignment.participantIds.forEach(id => participantSets[subject.mainTopic].add(id));
      }
    }
    return Object.entries(participantSets).map(([name, participantSet]) => ({ name, value: participantSet.size }));
  }, [assignments, subjectTypes]);

  const skillsMatrix = useMemo(() => {
    const safeParticipants = Array.isArray(participants) ? participants : [];
    const safeAssignments = Array.isArray(assignments) ? assignments : [];
    const safeSubjectTypes = Array.isArray(subjectTypes) ? subjectTypes : [];
    const matrix: { [participantId: number]: { [subjectId: number]: number } } = {};
    const allActiveParticipants = safeParticipants.filter(p => safeAssignments.some(a => a.participantIds.includes(p.id))).sort((a, b) => a.name.localeCompare(b.name));
    const allSubjects = safeSubjectTypes;

    allActiveParticipants.forEach(p => {
      matrix[p.id] = {};
      allSubjects.forEach(subject => {
        matrix[p.id][subject.id] = safeAssignments.filter(a => a.participantIds.includes(p.id) && a.subjectTypeId === subject.id).length;
      });
    });

    return { matrix, allActiveParticipants, allSubjects };
  }, [assignments, participants, subjectTypes]);

  const paginatedParticipants = useMemo(() => {
    const startIndex = (matrixPage - 1) * ITEMS_PER_PAGE;
    return skillsMatrix.allActiveParticipants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [skillsMatrix.allActiveParticipants, matrixPage]);

  const totalMatrixPages = Math.ceil(skillsMatrix.allActiveParticipants.length / ITEMS_PER_PAGE);

  const workloadDistribution = useMemo(() => {
    const counts = assignmentsPerParticipant.reduce((acc, curr) => {
        const key = curr.Attributions;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as { [key: number]: number });

    return Object.entries(counts)
        .map(([assignments, participantCount]) => ({
            name: `${assignments} part.`,
            Participants: participantCount,
            fullLabel: `${assignments} attribution${parseInt(assignments) > 1 ? 's' : ''}`,
        }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }, [assignmentsPerParticipant]);

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
    >
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 p-6">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex items-start gap-4"
                >
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <BookOpenIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">Statistiques de participation</h3>
                        <p className="text-lg text-gray-700 max-w-3xl mt-2">
                            Analysez les métriques de participation et les tendances d'attribution.
                        </p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <Button onClick={startGuide} variant="secondary" size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <BookOpenIcon className="h-5 w-5 mr-2" />
                        Guide interactif
                    </Button>
                </motion.div>
            </div>
        </Card>

        {/* KPI Summary */}
        <div id="kpi-cards" className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
            >
                <Card className="p-6 text-center relative overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                            className="text-3xl font-bold text-gray-900 mb-2"
                        >
                            {kpiData.activeParticipants}
                        </motion.div>
                        <div className="text-sm text-blue-600 font-medium">Participants actifs</div>
                    </div>
                </Card>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
            >
                <Card className="p-6 text-center relative overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                            className="text-3xl font-bold text-gray-900 mb-2"
                        >
                            {kpiData.totalAssignments}
                        </motion.div>
                        <div className="text-sm text-green-600 font-medium">Total attributions</div>
                    </div>
                </Card>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
            >
                <Card className="p-6 text-center relative overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                            className="text-3xl font-bold text-gray-900 mb-2"
                        >
                            {kpiData.avgAssignments}
                        </motion.div>
                        <div className="text-sm text-purple-600 font-medium">Moyenne/participant</div>
                    </div>
                </Card>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
            >
                <Card className="p-6 text-center relative overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                            className="text-3xl font-bold text-gray-900 mb-2"
                        >
                            {kpiData.participationRate}%
                        </motion.div>
                        <div className="text-sm text-orange-600 font-medium">Taux participation</div>
                    </div>
                </Card>
            </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                whileHover={{ y: -4 }}
            >
                <Card id="chart-2" className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    <h4 className="text-xl font-bold mb-4 p-6 border-b border-gray-100 text-gray-900">Attributions par sujet principal</h4>
                    <div className="p-6" style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer height={360}>
                         <PieChart>
                            <Pie
                                data={assignmentsPerSubjectType}
                                cx="50%"
                                cy="50%"
                                    labelLine={false}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    // FIX: Added 'any' type to props to resolve TypeScript error on 'percent' property.
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {assignmentsPerSubjectType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            {/* Legend removed per request */}
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                whileHover={{ y: -4 }}
            >
                <Card id="chart-5" className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    <h4 className="text-xl font-bold mb-4 p-6 border-b border-gray-100 text-gray-900">Couverture par sujet</h4>
                    <div className="p-6" style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={participantsPerSubjectType} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#6b7280" allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill={THEME_COLORS[2]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </motion.div>
        </div>

        {/* Skills Matrix - Full Width */}
        <div className="mt-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                whileHover={{ y: -4 }}
            >
                <Card id="chart-7" className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    <h4 className="text-xl font-bold mb-4 p-6 border-b border-gray-100 text-gray-900">Matrice de compétences</h4>
                <div className="p-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="px-2 py-2 text-left text-gray-900 font-semibold w-4 min-w-4">Participant</th>
                                    {skillsMatrix.allSubjects.map((subject, index) => (
                                        <th key={subject.id} className={`px-0.5 py-1 text-center text-gray-900 font-semibold w-4 min-w-4 ${index === 0 ? 'pl-1' : ''}`} style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                            {subject.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedParticipants.map(p => {
                                    return (
                                        <tr key={p.id}>
                                            <td className="px-1 py-1 font-medium text-gray-900 w-4 min-w-4 truncate">{p.name}</td>
                                            {skillsMatrix.allSubjects.map((subject, index) => {
                                                const count = skillsMatrix.matrix[p.id]?.[subject.id] || 0;
                                                const intensity = Math.min(count * 50, 255); // Scale for color intensity
                                                return (
                                                    <td key={subject.id} className={`px-0.5 py-1 text-center w-4 min-w-4 text-xs font-semibold text-gray-900 ${index === 0 ? 'pl-1' : ''}`} style={{ backgroundColor: `rgba(79, 133, 228, ${count > 0 ? 0.3 + (intensity / 255) * 0.7 : 0.1})` }}>
                                                        {count}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-200 gap-3">
                        <span className="text-sm text-gray-700">
                            Affichage {((matrixPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(matrixPage * ITEMS_PER_PAGE, skillsMatrix.allActiveParticipants.length)} sur {skillsMatrix.allActiveParticipants.length} participants
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMatrixPage(prev => Math.max(prev - 1, 1))}
                                disabled={matrixPage === 1}
                                className={`px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${matrixPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'}`}
                            >
                                Précédent
                            </button>
                            <span className="text-sm text-gray-700 font-medium">
                                Page {matrixPage} / {totalMatrixPages}
                            </span>
                            <button
                                onClick={() => setMatrixPage(prev => Math.min(prev + 1, totalMatrixPages))}
                                disabled={matrixPage === totalMatrixPages}
                                className={`px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${matrixPage === totalMatrixPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'}`}
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 px-6 pb-4">Matrice montrant les attributions de tous les participants actifs sur tous les sujets. Plus la couleur est intense, plus d'attributions.</p>
                </div>
            </Card>
            </motion.div>
        </div>

        {isGuideOpen && (
            <>
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeGuide}></div>
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-blue-800 text-white p-4 rounded-lg shadow-lg max-w-md">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold">{GUIDE_STEPS[currentStep].title}</h3>
                        <button onClick={closeGuide} className="text-gray-400 hover:text-white">×</button>
                    </div>
                    <p className="text-sm mb-4 text-white">{GUIDE_STEPS[currentStep].description}</p>
                    <div className="flex justify-between">
                        <Button onClick={prevStep} disabled={currentStep === 0} size="sm" variant="secondary">
                            Précédent
                        </Button>
                        <span className="text-sm self-center text-white">{currentStep + 1} / {GUIDE_STEPS.length}</span>
                        <Button onClick={nextStep} size="sm">
                            {currentStep === GUIDE_STEPS.length - 1 ? 'Terminer' : 'Suivant'}
                        </Button>
                    </div>
                </div>
            </>
        )}
    </motion.div>
  );
};
