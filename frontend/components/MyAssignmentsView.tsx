import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Assignment, SubjectType, Participant } from '../types';
import { Card } from './ui/Card';
import { UserCircleIcon, BookOpenIcon, CalendarDaysIcon } from './ui/Icons';
import { Button } from './ui/Button';
import { WeekPickerModal } from './ui/WeekPickerModal';
import { api } from '../services/api';

interface MyAssignmentsViewProps {
  assignments: Assignment[];
  subjectTypes: SubjectType[];
  currentUser: Participant | null;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

const MONTH_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MONTH_LONG  = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const getWeekDates = (isoWeek: string): { start: Date; end: Date } | null => {
    const m = isoWeek.match(/(\d{4})-W(\d{2})/);
    if (!m) return null;
    const year = parseInt(m[1], 10);
    const week = parseInt(m[2], 10);
    const jan4 = new Date(year, 0, 4);
    const dow = jan4.getDay() || 7;
    const mon = new Date(jan4);
    mon.setDate(jan4.getDate() - dow + 1 + (week - 1) * 7);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { start: mon, end: sun };
};

const formatWeekLabel = (isoWeek: string): { range: string; rank: string } => {
    const dates = getWeekDates(isoWeek);
    if (!dates) return { range: isoWeek, rank: '' };
    const { start, end } = dates;
    const sD = start.getDate().toString().padStart(2, '0');
    const sM = MONTH_SHORT[start.getMonth()];
    const eD = end.getDate().toString().padStart(2, '0');
    const eM = MONTH_SHORT[end.getMonth()];
    const yr = end.getFullYear();
    const range = `du ${sD} ${sM} au ${eD} ${eM} ${yr}`;
    const weekOfMonth = Math.ceil(start.getDate() / 7);
    const ord = weekOfMonth === 1 ? '1ère' : `${weekOfMonth}e`;
    const rank = `${ord} semaine de ${MONTH_LONG[start.getMonth()]}`;
    return { range, rank };
};

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
  const [filterSection, setFilterSection] = useState<string | null>(null);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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

  const base = activeTab === 'upcoming' ? upcoming : history;

  const allSections = useMemo(() =>
    [...new Set((activeTab === 'upcoming' ? upcoming : history).map(a => a.subject?.mainTopic).filter(Boolean) as string[])],
    [upcoming, history, activeTab]
  );
  const allColors = useMemo(() =>
    [...new Set((activeTab === 'upcoming' ? upcoming : history).map(a => a.subject?.color).filter(Boolean) as string[])],
    [upcoming, history, activeTab]
  );

  const assignmentsToShow = base.filter(a => {
    if (filterSection && a.subject?.mainTopic !== filterSection) return false;
    if (filterColor && a.subject?.color !== filterColor) return false;
    if (search && !(a.customLabel || a.subject?.label || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total = upcoming.length + history.length;
  const hasActiveFilter = !!filterSection || !!filterColor || !!search;

  const COL = 'grid-cols-[minmax(180px,1fr)_minmax(160px,2fr)_150px_100px]';

  const COLOR_BADGE: Record<string, string> = {
    noir: 'bg-gray-100 text-gray-700',
    vert: 'bg-emerald-50 text-emerald-700',
    marron: 'bg-amber-50 text-amber-800',
    rouge: 'bg-red-50 text-red-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <BookOpenIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Sujets de {currentUser.name}</h1>
            <p className="text-sm text-gray-500">Vos affectations passées et à venir.</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setIsWeekPickerOpen(true)}>
          <CalendarDaysIcon className="h-4 w-4 mr-1.5" />
          Gérer mes indisponibilités
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: total, color: 'bg-blue-50', dot: 'bg-blue-400' },
          { label: 'À venir', value: upcoming.length, color: 'bg-emerald-50', dot: 'bg-emerald-400' },
          { label: 'Passés', value: history.length, color: 'bg-gray-100', dot: 'bg-gray-400' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${k.dot}`} />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{k.label}</span>
            </div>
            <span className="text-4xl font-bold text-gray-900 tracking-tight">{k.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['upcoming', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'upcoming' ? `À venir (${upcoming.length})` : `Historique (${history.length})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un sujet…"
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white text-gray-700 placeholder-gray-400 w-48"
          />
        </div>

        {/* Section pills */}
        {allSections.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {allSections.map(s => (
              <button
                key={s}
                onClick={() => setFilterSection(filterSection === s ? null : s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                  filterSection === s
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Color pills */}
        {allColors.length > 0 && (
          <div className="flex gap-1">
            {allColors.map(c => {
              const cls: Record<string, string> = {
                noir: 'bg-gray-700 text-white border-gray-700',
                vert: 'bg-emerald-600 text-white border-emerald-600',
                marron: 'bg-amber-700 text-white border-amber-700',
                rouge: 'bg-red-600 text-white border-red-600',
              };
              const inactive = 'bg-white text-gray-500 border-gray-200 hover:border-gray-400';
              return (
                <button
                  key={c}
                  onClick={() => setFilterColor(filterColor === c ? null : c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                    filterColor === c ? cls[c] ?? cls.noir : inactive
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {/* Clear */}
        {hasActiveFilter && (
          <button
            onClick={() => { setFilterSection(null); setFilterColor(null); setSearch(''); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      {assignmentsToShow.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <BookOpenIcon className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {activeTab === 'upcoming' ? "Aucun sujet à venir n'est programmé." : "Aucun historique de participation trouvé."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {/* Header */}
            <div className={`grid ${COL} border-b border-[#C0A882] bg-[#D6C4A8] sticky top-0 z-10 min-w-[620px]`}>
              {['Semaine', 'Sujet', 'Section', 'Couleur'].map((h, i) => (
                <div key={h} className={`px-5 py-3 text-[11px] font-semibold text-[#f5ede3] uppercase tracking-widest ${i > 0 ? 'text-center' : ''}`}>
                  {h}
                </div>
              ))}
            </div>
            {/* Rows */}
            <div className="divide-y divide-gray-50 overflow-y-auto max-h-[60vh] min-w-[620px]">
              {assignmentsToShow.map(({id, week, subject, customLabel}, idx) => {
                const displayLabel = customLabel || subject?.label;
                const labelClass = subject?.uppercaseTitle ? 'uppercase tracking-wide' : '';
                const { range, rank } = formatWeekLabel(week);
                const badge = COLOR_BADGE[subject?.color ?? ''] ?? 'bg-gray-100 text-gray-700';

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`grid ${COL} gap-0 items-center transition-colors hover:bg-[#f5ede3]/60 ${idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/70'}`}
                  >
                    {/* Semaine */}
                    <div className="px-5 py-4">
                      <p className="text-xs text-gray-400">{rank}</p>
                      <p className="text-sm font-semibold text-gray-700 leading-tight">{range}</p>
                    </div>
                    {/* Sujet */}
                    <div className="px-5 py-4 text-center">
                      <p className={`text-sm font-semibold text-gray-900 ${labelClass}`}>{displayLabel}</p>
                    </div>
                    {/* Section */}
                    <div className="px-5 py-4 text-center">
                      <p className="text-xs text-gray-500">{subject?.mainTopic}</p>
                    </div>
                    {/* Couleur */}
                    <div className="px-5 py-4 flex justify-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge}`}>
                        {subject?.color}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          {/* Footer */}
          <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
            <p className="text-xs text-gray-400">{assignmentsToShow.length} sujet{assignmentsToShow.length > 1 ? 's' : ''}</p>
          </div>
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