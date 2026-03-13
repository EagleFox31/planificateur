import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Role, Assignment, Participant, SubjectType, Program, RolePermissions } from '../types';
import { MAIN_TOPICS } from '../constants';
import { api } from '../services/api';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { MagicWandIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from './ui/Icons';
import { DatePicker } from './ui/WeekPickerModal';

interface DashboardProps {
  role: Role;
  assignments: Assignment[];
  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  subjectTypes: SubjectType[];
  rolePermissions: RolePermissions;
}

const getISOWeek = (inputDate: Date): { year: number; week: number } => {
  // ISO week is based on Thursday; shift to that reference to avoid off-by-one errors.
  const date = new Date(inputDate);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));

  const isoYear = date.getFullYear();
  const week1 = new Date(isoYear, 0, 4);
  week1.setHours(0, 0, 0, 0);
  week1.setDate(week1.getDate() + 3 - ((week1.getDay() + 6) % 7));

  const weekNumber = 1 + Math.round((date.getTime() - week1.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return { year: isoYear, week: weekNumber };
};

const toWeekString = (date: Date): string => {
  const { year, week } = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

const getCurrentWeek = (): string => toWeekString(new Date());

const dateToWeek = (date: Date): string => toWeekString(date);

const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNextWeek = (startWeek: string, offset: number): string => {
  const [yearStr, weekStr] = startWeek.split('-W');
  let year = parseInt(yearStr, 10);
  let week = parseInt(weekStr, 10);

  week += offset;

  while (week > 53) {
    week -= 53;
    year += 1;
  }

  while (week < 1) {
    week += 53;
    year -= 1;
  }

  return `${year}-W${String(week).padStart(2, '0')}`;
};

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

const getWeekDateRange = (week: string) => {
  const [yearStr, weekStr] = week.split('-W');
  const year = parseInt(yearStr, 10);
  const weekNumber = parseInt(weekStr, 10);
  if (Number.isNaN(year) || Number.isNaN(weekNumber)) return null;

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
  const formatDate = (date: Date) => `${date.getDate().toString().padStart(2, '0')} ${MONTH_LABELS[date.getMonth()]}`;
  return `Semaine du ${formatDate(start)} au ${formatDate(end)} ${start.getFullYear()}`;
};


export const Dashboard: React.FC<DashboardProps> = ({
  role,
  assignments,
  programs,
  setPrograms,
  participants,
  setParticipants,
  subjectTypes,
  rolePermissions,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestWeek = useMemo(() => {
    if (assignments.length === 0) return null;
    return assignments.reduce((latest, a) => (a.week > latest ? a.week : latest), '2025-W01');
  }, [assignments]);

  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [viewMode, setViewMode] = useState<'current' | 'latest'>('current');

  useEffect(() => {
    if (viewMode === 'latest' && latestWeek) {
      setCurrentWeek(latestWeek);
    }
    if (viewMode === 'current') {
      setCurrentWeek(getCurrentWeek());
    }
  }, [viewMode, latestWeek]);

  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [weeksToGenerate, setWeeksToGenerate] = useState(1);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatusText, setGenerationStatusText] = useState('');

  const activeSubjectTypes = useMemo(() => subjectTypes.filter((s) => !s.isArchived), [subjectTypes]);

  const assignmentsForWeek = useMemo(
    () => assignments.filter((a) => a.week === currentWeek),
    [assignments, currentWeek]
  );

  const assignmentsByTopic = useMemo(() => {
    const grouped: Record<string, Assignment[]> = {};

    for (const assignment of assignmentsForWeek) {
      const subject = subjectTypes.find((s) => s.id === assignment.subjectTypeId);
      if (!subject) continue;
      if (!grouped[subject.mainTopic]) grouped[subject.mainTopic] = [];
      grouped[subject.mainTopic].push(assignment);
    }

    return grouped;
  }, [assignmentsForWeek, subjectTypes]);

  const kpis = useMemo(() => {
    const assignedSlots = assignmentsForWeek.reduce((acc, a) => acc + a.participantIds.length, 0);
    const uniqueParticipants = new Set(assignmentsForWeek.flatMap((a) => a.participantIds)).size;
    const coverage = activeSubjectTypes.length
      ? Math.round((assignmentsForWeek.length / activeSubjectTypes.length) * 100)
      : 0;

    return { assignedSlots, uniqueParticipants, coverage };
  }, [assignmentsForWeek, activeSubjectTypes]);

  const getParticipantName = (id: number) => participants.find((p) => p.id === id)?.name || 'Inconnu';

  const getParticipantTooltip = (id: number) => {
    const participant = participants.find((p) => p.id === id);
    if (!participant) return 'Participant inconnu';
    const roleLabel = participant.spiritualRole || 'Role non defini';
    return `${participant.name} — ${roleLabel}`;
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
      setGenerationStatusText('Generation en cours...');
      setGenerationProgress(40);

      const startWeek = dateToWeek(startDate);
      const startDateOnly = formatDateOnly(startDate);
      const generatedProgram = await api.generateProgram(startWeek, weeksToGenerate, rolePermissions, startDateOnly);

      setGenerationStatusText('Mise a jour des donnees...');
      setGenerationProgress(80);

      const updatedPrograms = await api.getPrograms();
      const updatedParticipants = await api.getParticipants();

      setPrograms(updatedPrograms);
      setParticipants(updatedParticipants);

      setGenerationStatusText('Programme genere avec succes');
      setGenerationProgress(100);

      const latestProgram = [...updatedPrograms].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      const targetProgramId = generatedProgram?.id || latestProgram?.id;

      setTimeout(() => {
        setIsGenerationModalOpen(false);
        if (targetProgramId) {
          navigate(`/programs?programId=${encodeURIComponent(targetProgramId)}`);
        } else {
          navigate('/programs');
        }
      }, 700);
    } catch (e: any) {
      setError(`Une erreur est survenue lors de la generation : ${e.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedWeekLabel = formatWeekLabel(currentWeek);
  const showTutorialCard = programs.length === 0;

  const SECTION_HEADER: Record<string, string> = {
    'Prière':                      'bg-gray-800',
    'Présidence':                  'bg-gray-800',
    'Joyaux de la parole de Dieu': 'bg-emerald-700',
    'Applique-toi au ministère':   'bg-amber-800',
    'Vie chrétienne':              'bg-red-700',
  };
  const LABEL_COLOR: Record<string, string> = {
    noir: 'text-gray-800', vert: 'text-emerald-700', marron: 'text-amber-800', rouge: 'text-red-700',
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <CalendarDaysIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Tableau de bord</h1>
              <p className="text-sm text-gray-500">Programme hebdomadaire · Assemblée Japoma</p>
            </div>
          </div>
          {role === Role.ADMIN && (
            <button
              onClick={handleOpenGenerationModal}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-60"
            >
              <MagicWandIcon className="h-4 w-4" />
              Générer un programme
            </button>
          )}
        </div>

        {/* Week card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Hazel banner */}
          <div className="bg-[#D6C4A8] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-[#7a5c3a] uppercase tracking-widest font-semibold mb-0.5">Réunion de semaine</p>
              <p className="text-base font-bold text-[#3d2e1e]">{formattedWeekLabel}</p>
            </div>
            <div className="flex items-center gap-3">
              {latestWeek && viewMode === 'current' && (
                <button
                  onClick={() => setViewMode('latest')}
                  className="text-xs text-[#7a5c3a] hover:text-[#3d2e1e] border border-[#C0A882] rounded-lg px-2.5 py-1 transition-colors bg-[#EDE0CE]/60"
                >
                  Dernier programme
                </button>
              )}
              {viewMode === 'latest' && (
                <button
                  onClick={() => setViewMode('current')}
                  className="text-xs text-[#7a5c3a] hover:text-[#3d2e1e] border border-[#C0A882] rounded-lg px-2.5 py-1 transition-colors bg-[#EDE0CE]/60"
                >
                  Semaine actuelle
                </button>
              )}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setViewMode('current'); setCurrentWeek((prev) => getNextWeek(prev, -1)); }}
                  className="w-7 h-7 rounded-lg bg-[#C9B599]/60 hover:bg-[#C9B599] flex items-center justify-center transition-colors"
                >
                  <ChevronLeftIcon className="h-3.5 w-3.5 text-[#3d2e1e]" />
                </button>
                <span className="text-[11px] text-[#7a5c3a] font-mono px-1">{currentWeek}</span>
                <button
                  onClick={() => { setViewMode('current'); setCurrentWeek((prev) => getNextWeek(prev, 1)); }}
                  className="w-7 h-7 rounded-lg bg-[#C9B599]/60 hover:bg-[#C9B599] flex items-center justify-center transition-colors"
                >
                  <ChevronRightIcon className="h-3.5 w-3.5 text-[#3d2e1e]" />
                </button>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {[
              { label: 'Affectations', value: kpis.assignedSlots, color: 'text-blue-600' },
              { label: 'Participants mobilisés', value: kpis.uniqueParticipants, color: 'text-emerald-600' },
              { label: 'Couverture sujets', value: `${kpis.coverage}%`, color: kpis.coverage >= 80 ? 'text-emerald-600' : kpis.coverage >= 50 ? 'text-amber-600' : 'text-red-500' },
            ].map(k => (
              <div key={k.label} className="px-5 py-4">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">{k.label}</p>
                <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tutorial or section grid */}
        {showTutorialCard ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Générez votre premier programme</h2>
            <p className="text-sm text-gray-600 mt-2">
              Aucune semaine planifiée. Lancez une génération pour préparer automatiquement les affectations selon les règles et disponibilités définies.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 mt-3">
              <li>Vérifiez que vos participants sont importés et à jour.</li>
              <li>Choisissez combien de semaines vous voulez planifier.</li>
              <li>Ajustez ensuite les désignations dans la vue Programmes.</li>
            </ul>
            <div className="mt-5">
              <button
                onClick={handleOpenGenerationModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                <MagicWandIcon className="h-4 w-4" />
                Générer mon premier programme
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MAIN_TOPICS.map((topic) => {
              const topicSubjects = activeSubjectTypes.filter((s) => s.mainTopic === topic);
              if (topicSubjects.length === 0) return null;
              const headerCls = SECTION_HEADER[topic] ?? 'bg-gray-700';

              return (
                <div key={topic} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  {/* Section header */}
                  <div className={`${headerCls} px-5 py-2.5`}>
                    <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">{topic}</h3>
                  </div>

                  {/* Subject rows */}
                  <div className="divide-y divide-gray-50">
                    {topicSubjects.map((subject) => {
                      const assignment = assignmentsByTopic[topic]?.find((a) => a.subjectTypeId === subject.id);
                      const displayLabel = assignment?.customLabel || subject.label;
                      const labelCls = subject.uppercaseTitle ? 'uppercase tracking-wide' : '';
                      const labelColor = LABEL_COLOR[subject.color] ?? 'text-gray-800';

                      return (
                        <div key={subject.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors">
                          <span className={`text-sm font-semibold ${labelColor} ${labelCls} flex-1 pr-3 leading-snug`}>
                            {displayLabel}
                          </span>
                          <div className="flex-shrink-0 text-right">
                            {assignment && assignment.participantIds.length > 0 ? (
                              <span className="text-sm text-gray-900">
                                {assignment.participantIds.map((pid, i) => (
                                  <span key={pid}>
                                    {i > 0 && <span className={`font-light ${labelColor} mx-0.5`}>et</span>}
                                    <span title={getParticipantTooltip(pid)}>{getParticipantName(pid)}</span>
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300 italic">Non attribué</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {isGenerationModalOpen && (
        <Modal
          title="Generation de programme"
          onClose={() => {
            if (!isLoading) setIsGenerationModalOpen(false);
          }}
          size="lg"
        >
          <div className="space-y-4 text-slate-900">
            <p className="text-sm text-slate-700">
              Choisissez le nombre de semaines a planifier. La generation utilise vos participants, roles et indisponibilites.
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">Date de depart</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={startDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  readOnly
                  className="flex-1 rounded-lg bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDatePickerOpen(true)}
                  disabled={isLoading}
                >
                  <CalendarDaysIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">Nombre de semaines</label>
              <input
                type="number"
                min={1}
                max={12}
                value={weeksToGenerate}
                onChange={(e) => setWeeksToGenerate(Math.max(1, Math.min(12, Number(e.target.value))))}
                className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {generationStatusText && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-sm text-blue-800">
                {generationStatusText}
              </div>
            )}

            {isLoading && (
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${generationProgress}%` }} />
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setIsGenerationModalOpen(false)} disabled={isLoading}>
                Annuler
              </Button>
              <Button onClick={handleMultiWeekGeneration} disabled={isLoading}>
                {isLoading ? 'Generation...' : 'Lancer la generation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isDatePickerOpen && (
        <DatePicker initialDate={startDate} onSave={(date) => setStartDate(date)} onClose={() => setIsDatePickerOpen(false)} />
      )}
    </>
  );
};
