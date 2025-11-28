import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Role, Assignment, Participant, SubjectType, Program, RolePermissions } from '../types';
import { MAIN_TOPICS, COLORS as SUBJECT_COLORS } from '../constants';
import { api } from '../services/api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { MagicWandIcon, UserCircleIcon, ChevronLeftIcon, ChevronRightIcon } from './ui/Icons';
import { THEME_CLASSES, COLORS } from '../styles/theme';

interface DashboardProps {
  role: Role;
  assignments: Assignment[]; // All assignments from all programs
  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  subjectTypes: SubjectType[];
  rolePermissions: RolePermissions;
}

const getNextWeek = (startWeek: string, offset: number): string => {
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

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

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

const formatWeekLabel = (week: string) => {
  const range = getWeekDateRange(week);
  if (!range) return `Semaine ${week}`;
  const { start, end } = range;
  const sameYear = start.getFullYear() === end.getFullYear();
  const yearLabel = sameYear ? start.getFullYear().toString() : `${start.getFullYear()}-${end.getFullYear()}`;
  const formatDate = (date: Date) => `${date.getDate().toString().padStart(2, '0')} ${MONTH_LABELS[date.getMonth()]}`;
  return `Semaine ${yearLabel} du ${formatDate(start)} au ${formatDate(end)}`;
};


export const Dashboard: React.FC<DashboardProps> = ({ role, assignments, programs, setPrograms, participants, setParticipants, subjectTypes, rolePermissions }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestWeek = useMemo(() => {
    if (assignments.length === 0) return '2025-W30';
    return assignments.reduce((latest, a) => a.week > latest ? a.week : latest, '2025-W01');
  }, [assignments]);

  const [currentWeek, setCurrentWeek] = useState(latestWeek);

  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [weeksToGenerate, setWeeksToGenerate] = useState(1);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatusText, setGenerationStatusText] = useState('');


  const getParticipantName = (id: number) => participants.find(p => p.id === id)?.name || 'Inconnu';
  const getParticipantTooltip = (id: number) => {
    const participant = participants.find(p => p.id === id);
    if (!participant) return 'Participant inconnu';
    const role = participant.spiritualRole || 'Rôle non défini';
    return `${participant.name} — ${role}`;
  };

  const handleOpenGenerationModal = () => {
    setError(null);
    setWeeksToGenerate(1);
    setGenerationProgress(0);
    setGenerationStatusText('');
    setIsGenerationModalOpen(true);
  };

  const handleMultiWeekGeneration = async () => {
    setIsLoading(true);
    setError(null);
    setGenerationProgress(0);

    try {
        const startWeek = getNextWeek(latestWeek, 1);

        setGenerationStatusText('Génération en cours...');
        setGenerationProgress(50);

        const newProgram = await api.generateProgram(startWeek, weeksToGenerate, rolePermissions);

        setGenerationStatusText('Programme généré avec succès !');
        setGenerationProgress(100);

        // Reload data from API to get updated participants
        const updatedPrograms = await api.getPrograms();
        const updatedParticipants = await api.getParticipants();

        setPrograms(updatedPrograms);
        setParticipants(updatedParticipants);

        setIsLoading(false);
        setTimeout(() => {
          setIsGenerationModalOpen(false);
        }, 1000);
    } catch (e: any) {
        console.error("Erreur de l'API de génération:", e);
        setError(`Une erreur est survenue lors de la génération : ${e.message}.`);
        setIsLoading(false);
    }
  };


  const assignmentsByTopic = useMemo(() => {
    const grouped: { [key: string]: Assignment[] } = {};
    const assignmentsForWeek = assignments.filter(a => a.week === currentWeek);

    for (const assignment of assignmentsForWeek) {
      const subject = subjectTypes.find(s => s.id === assignment.subjectTypeId);
      if (subject) {
        if (!grouped[subject.mainTopic]) {
          grouped[subject.mainTopic] = [];
        }
        grouped[subject.mainTopic].push(assignment);
      }
    }
    return grouped;
  }, [assignments, subjectTypes, currentWeek]);

  const formattedWeekLabel = formatWeekLabel(currentWeek);
  const showTutorialCard = programs.length === 0;

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-10"
    >
      {/* Header Section with Material Design */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-white border border-gray-200 shadow-lg p-6">
            <h1 className={`${THEME_CLASSES.typography.headline.large} text-gray-900 mb-2`}>
              Programme hebdomadaire
            </h1>
            <p className={`${THEME_CLASSES.typography.body.medium} text-gray-700`}>
              {formattedWeekLabel}
            </p>
          </Card>
        </motion.div>

        {/* Week Navigation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentWeek(getNextWeek(currentWeek, -1))}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </motion.button>

          <div className="px-4 py-2 bg-slate-blue-800/30 rounded-lg">
            <span className={`${THEME_CLASSES.typography.label.large} text-slate-blue-200`}>
              {currentWeek}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentWeek(getNextWeek(currentWeek, 1))}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Premium FAB for Generation */}
      {role === Role.ADMIN && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, type: "spring", stiffness: 150 }}
          className="fixed bottom-8 right-8 z-10"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              onClick={handleOpenGenerationModal}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-500 flex items-center justify-center border-2 border-white/20"
            >
              <MagicWandIcon className="h-7 w-7" />
            </Button>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-30 blur-md"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      {showTutorialCard ? (
        <Card className="p-6 space-y-4 bg-slate-50 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Générez votre premier programme</h2>
          <p className="text-slate-700">
            Vous n&apos;avez encore aucune semaine planifiée. Lancez une génération pour préparer automatiquement les affectations
            en fonction des règles et des disponibilités définies.
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-1">
            <li>Assurez-vous que vos participants sont importés et à jour.</li>
            <li>Choisissez combien de semaines vous voulez planifier.</li>
            <li>Confirmez et ajustez ensuite chaque désignation depuis le tableau.</li>
          </ul>
          <div>
            <Button onClick={handleOpenGenerationModal}>
              Générer mon premier programme
            </Button>
          </div>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {MAIN_TOPICS.map((topic, index) => {
            const topicSubjects = subjectTypes.filter(s => s.mainTopic === topic && !s.isArchived);
            if (topicSubjects.length === 0) return null;

            const topicColorName = topicSubjects[0].color;
            const topicColorClass = SUBJECT_COLORS[topicColorName as keyof typeof SUBJECT_COLORS] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900';

            return (
              <motion.div
                key={topic}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      duration: 0.6
                    }
                  }
                }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className="h-full"
              >
                <Card className="flex flex-col h-full overflow-hidden">
                  <div className={`p-6 rounded-t-xl ${topicColorClass} relative overflow-hidden`}>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    >
                      <h4 className="text-2xl font-bold relative z-10">{topic}</h4>
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 animate-pulse" />
                  </div>
                  <div className={`p-6 space-y-5 ${THEME_CLASSES.bg.tertiary} rounded-b-xl flex-grow`}>
                    {topicSubjects.map((subject, subIndex) => {
                      const assignment = assignmentsByTopic[topic]?.find(a => a.subjectTypeId === subject.id);
                      const labelClass = subject.uppercaseTitle ? 'uppercase tracking-wide' : '';
                      const displayLabel = assignment?.customLabel || subject.label;
                      return (
                        <motion.div
                          key={subject.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 + subIndex * 0.05, duration: 0.4 }}
                        >
                          <p className={`font-semibold ${THEME_CLASSES.text.secondary} ${labelClass} text-lg`}>{displayLabel}</p>
                          {assignment ? (
                            <div className="mt-2 flex flex-col space-y-2">
                              {assignment.participantIds.map(pid => (
                                  <motion.div
                                    key={pid}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 + index * 0.1 + subIndex * 0.05, duration: 0.3 }}
                                    className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
                                  >
                                     <UserCircleIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                     <span title={getParticipantTooltip(pid)} className="font-medium">{getParticipantName(pid)}</span>
                                  </motion.div>
                              ))}
                            </div>
                          ) : (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.8 + index * 0.1 + subIndex * 0.05, duration: 0.3 }}
                              className={`${THEME_CLASSES.text.muted} italic mt-2 text-base`}
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
        </motion.div>
      )}
    </motion.div>
    {isGenerationModalOpen && (
      <Modal
        title="Génération de programme"
        onClose={() => {
          if (!isLoading) {
            setIsGenerationModalOpen(false);
          }
        }}
        size="lg"
      >
        <div className="space-y-4 text-slate-blue-50">
          <p className="text-slate-blue-100">
            Choisissez le nombre de semaines à planifier. La génération utilise vos participants, rôles et indisponibilités.
          </p>

          <div className="space-y-2">
            <label className="block text-sm text-slate-blue-200">Nombre de semaines</label>
            <input
              type="number"
              min={1}
              max={12}
              value={weeksToGenerate}
              onChange={e => setWeeksToGenerate(Math.max(1, Math.min(12, Number(e.target.value))))}
              className="w-full rounded-md bg-slate-blue-900/60 border border-slate-blue-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sanctus-blue"
              disabled={isLoading}
            />
          </div>

          {generationStatusText && (
            <div className="rounded-md bg-slate-blue-900/50 border border-slate-blue-700 px-3 py-2 text-sm">
              {generationStatusText}
            </div>
          )}

          {isLoading && (
            <div className="w-full bg-slate-blue-900/50 border border-slate-blue-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sanctus-blue h-2 transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-900/30 border border-red-500 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsGenerationModalOpen(false)} disabled={isLoading} className="!bg-white !hover:bg-gray-50 !text-white !border !border-gray-300">
              Annuler
            </Button>
            <Button onClick={handleMultiWeekGeneration} disabled={isLoading}>
              {isLoading ? 'Génération...' : 'Lancer la génération'}
            </Button>
          </div>
        </div>
      </Modal>
    )}
    </>
  );
};
