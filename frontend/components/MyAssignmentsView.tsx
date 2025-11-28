import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Assignment, SubjectType, Participant } from '../types';
import { Card } from './ui/Card';
import { UserCircleIcon, BookOpenIcon, CalendarDaysIcon } from './ui/Icons';
import { COLORS } from '../constants';
import { Button } from './ui/Button';
import { WeekPickerModal } from './ui/WeekPickerModal';
import { api } from '../services/api';

interface MyAssignmentsViewProps {
  assignments: Assignment[];
  subjectTypes: SubjectType[];
  currentUser: Participant | null;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

const getWeekString = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

export const MyAssignmentsView: React.FC<MyAssignmentsViewProps> = ({ assignments, subjectTypes, currentUser, setParticipants }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [isWeekPickerOpen, setIsWeekPickerOpen] = useState(false);

  const { upcoming, history } = useMemo(() => {
    if (!currentUser) return { upcoming: [], history: [] };

    const personalAssignments = assignments.filter(a => a.participantIds.includes(currentUser.id));
    const currentWeek = getWeekString(new Date());

    const enrichedAssignments = personalAssignments.map(assignment => {
      const subject = subjectTypes.find(s => s.id === assignment.subjectTypeId);
      return { ...assignment, subject };
    }).filter(a => a.subject); // Filter out assignments with no matching subject

    const upcoming = enrichedAssignments
      .filter(a => a.week >= currentWeek)
      .sort((a, b) => a.week.localeCompare(b.week));

    const history = enrichedAssignments
      .filter(a => a.week < currentWeek)
      .sort((a, b) => b.week.localeCompare(a.week));

    return { upcoming, history };
  }, [currentUser, assignments, subjectTypes]);
  
  const handleSaveUnavailabilities = async (weeks: string[]) => {
    if (!currentUser) return;
    try {
      const updatedParticipant = await api.updateParticipant(currentUser.id, { unavailabilities: weeks });
      setParticipants(prevParticipants =>
        prevParticipants.map(p =>
          p.id === currentUser.id ? updatedParticipant : p
        )
      );
      setIsWeekPickerOpen(false);
    } catch (error) {
      console.error('Error saving unavailabilities:', error);
      alert('Erreur lors de la sauvegarde des indisponibilités');
    }
  };

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 text-center bg-white border border-dashed border-gray-300 shadow-xl">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-2 text-xl font-medium text-gray-900">Aucun participant sélectionné</h3>
          <p className="mt-1 text-gray-700">Veuillez sélectionner un participant dans l'en-tête pour afficher ses sujets.</p>
        </Card>
      </motion.div>
    );
  }

  const assignmentsToShow = activeTab === 'upcoming' ? upcoming : history;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="bg-white border border-gray-200 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6">
            <h3 className="text-3xl font-bold text-gray-900">Sujets de {currentUser.name}</h3>
            <Button variant="secondary" onClick={() => setIsWeekPickerOpen(true)} className="bg-gray-100 hover:bg-gray-200 border-gray-300 text-white">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-white" />
              Gérer mes indisponibilités
            </Button>
          </div>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="border-b border-white/30"
      >
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`whitespace-nowrap py-4 px-2 border-b-2 font-semibold text-sm transition-all duration-300 rounded-t-lg ${
                    activeTab === 'upcoming'
                    ? 'border-indigo-500 text-indigo-700 bg-indigo-100 shadow-lg'
                    : 'border-transparent text-gray-600 hover:text-indigo-700 hover:bg-gray-100'
                }`}
              >
                À venir ({upcoming.length})
              </button>
               <button
                onClick={() => setActiveTab('history')}
                className={`whitespace-nowrap py-4 px-2 border-b-2 font-semibold text-sm transition-all duration-300 rounded-t-lg ${
                    activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-700 bg-indigo-100 shadow-lg'
                    : 'border-transparent text-gray-600 hover:text-indigo-700 hover:bg-gray-100'
                }`}
              >
                Historique ({history.length})
              </button>
          </nav>
      </motion.div>

      {assignmentsToShow.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="p-8 text-center bg-white border border-gray-200 shadow-xl">
             <BookOpenIcon className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-2 text-gray-700">
              {activeTab === 'upcoming' ? "Aucun sujet à venir n'est programmé." : "Aucun historique de participation trouvé."}
            </p>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
            {assignmentsToShow.map(({id, week, subject, customLabel}, index) => {
                const colorClass = subject ? COLORS[subject.color as keyof typeof COLORS] : 'bg-slate-blue-700';
                const displayLabel = customLabel || subject?.label;
                const labelClass = subject?.uppercaseTitle ? 'uppercase' : '';

                return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    >
                      <Card className={`p-6 border-l-4 ${subject ? `border-${subject.color}-500` : 'border-slate-blue-500'} bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 flex justify-between items-center`}>
                          <div>
                              <p className="text-sm font-semibold text-gray-600">{week}</p>
                              <p className={`text-lg font-bold text-gray-900 ${labelClass}`}>{displayLabel}</p>
                              <p className="text-sm text-gray-500">{subject?.mainTopic}</p>
                          </div>
                          <div className={`px-4 py-2 text-sm font-semibold text-white rounded-full ${colorClass} shadow-lg`}>
                              {subject?.color}
                          </div>
                      </Card>
                    </motion.div>
                )
            })}
        </div>
      )}
      
      {isWeekPickerOpen && (
        <WeekPickerModal 
          initialSelectedWeeks={currentUser.unavailabilities}
          onSave={handleSaveUnavailabilities}
          onClose={() => setIsWeekPickerOpen(false)}
        />
      )}

    </motion.div>
  );
};