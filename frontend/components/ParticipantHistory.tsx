import React, { useState, useMemo } from 'react';
import { Participant, SubjectType } from '../types';
import { BookOpenIcon, ClockIcon } from './ui/Icons';

interface ParticipantHistoryProps {
  participants: Participant[];
  subjectTypes: SubjectType[];
}

const getWeekDateRange = (week: string) => {
  const [yearStr, weekStr] = week.split('-W');
  const year = Number.parseInt(yearStr, 10);
  const weekNumber = Number.parseInt(weekStr, 10);
  if (!Number.isInteger(year) || !Number.isInteger(weekNumber)) return null;

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

  const start = new Date(mondayWeek1);
  start.setUTCDate(mondayWeek1.getUTCDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start, end };
};

const formatDateShort = (date: Date) => {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const monthFormatterFr = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' });
const getFrenchOrdinal = (value: number) => (value === 1 ? '1re' : `${value}e`);

const formatWeekMonthContext = (week: string) => {
  const range = getWeekDateRange(week);
  if (!range) return null;
  const anchor = new Date(range.start);
  anchor.setUTCDate(anchor.getUTCDate() + 3);
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const firstDayWeekday = firstDayOfMonth.getUTCDay() || 7;
  const firstMondayAnchor = new Date(firstDayOfMonth);
  firstMondayAnchor.setUTCDate(firstDayOfMonth.getUTCDate() - firstDayWeekday + 1);
  const diffDays = Math.floor((anchor.getTime() - firstMondayAnchor.getTime()) / 86400000);
  const weekInMonth = Math.floor(diffDays / 7) + 1;
  const monthLabel = monthFormatterFr.format(anchor);
  return `${getFrenchOrdinal(weekInMonth)} semaine de ${monthLabel} ${year}`;
};

const formatWeekRangeShort = (week: string) => {
  const range = getWeekDateRange(week);
  if (!range) return week;
  return `${formatDateShort(range.start)} à ${formatDateShort(range.end)}`;
};

export const ParticipantHistory: React.FC<ParticipantHistoryProps> = ({ participants, subjectTypes }) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);

  const selectedParticipant = useMemo(() => participants.find(p => p.id === selectedParticipantId), [selectedParticipantId, participants]);

  const sortedHistory = useMemo(() => {
    if (!selectedParticipant) return [];
    return [...selectedParticipant.assignmentHistory].sort((a, b) => b.week.localeCompare(a.week));
  }, [selectedParticipant]);

  const getSubject = (subjectTypeId: number) => subjectTypes.find(st => st.id === subjectTypeId);

  const totalHistoryEntries = useMemo(
    () => participants.reduce((n, p) => n + (p.assignmentHistory?.length || 0), 0),
    [participants]
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
          <ClockIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Historique</h1>
          <p className="text-xs text-gray-500">Attributions passées par participant</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-green-600">{participants.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Participants</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-indigo-600">{totalHistoryEntries}</p>
          <p className="text-xs text-gray-500 mt-0.5">Attributions au total</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-gray-700">{sortedHistory.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {selectedParticipant ? `de ${selectedParticipant.name}` : 'Choisir un participant'}
          </p>
        </div>
      </div>

      {/* Main panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-[#D6C4A8] border-b border-[#C0A882]">
          <label htmlFor="participant-select" className="block text-sm font-semibold text-[#3d2e1e]">
            Sélectionner un participant
          </label>
        </div>
        <div className="p-4 border-b border-gray-100">
          <select
            id="participant-select"
            value={selectedParticipantId ?? ''}
            onChange={(e) => setSelectedParticipantId(Number(e.target.value))}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 transition-colors"
          >
            <option value="" disabled>-- Choisir un participant --</option>
            {participants.sort((a, b) => a.name.localeCompare(b.name)).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {selectedParticipant ? (
          sortedHistory.length > 0 ? (
            <ul className="divide-y divide-gray-100 overflow-y-auto max-h-[500px]">
              {sortedHistory.map((item, index) => {
                const subject = getSubject(item.subjectTypeId);
                const weekMonthContext = formatWeekMonthContext(item.week);
                return (
                  <li
                    key={`${item.week}-${item.subjectTypeId}-${index}`}
                    className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{subject?.label || 'Sujet inconnu'}</p>
                      <p className="text-xs text-gray-500">{subject?.mainTopic}</p>
                    </div>
                    <div className="text-right">
                      {weekMonthContext && <p className="text-xs text-gray-400 mb-1">{weekMonthContext}</p>}
                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                        {formatWeekRangeShort(item.week)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-10 text-center">
              <BookOpenIcon className="mx-auto h-10 w-10 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">Aucun historique pour {selectedParticipant.name}.</p>
            </div>
          )
        ) : (
          <div className="p-10 text-center">
            <ClockIcon className="mx-auto h-10 w-10 text-gray-200" />
            <p className="mt-3 text-sm text-gray-400">Sélectionnez un participant pour voir son historique.</p>
          </div>
        )}
      </div>
    </div>
  );
};
