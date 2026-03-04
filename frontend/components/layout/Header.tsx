import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Role, Program, Participant } from '../../types';
import { BellAlertIcon } from '../ui/Icons';

interface HeaderProps {
  role: Role;
  setRole: (role: Role) => void;
  programs: Program[];
  navigate: (path: string) => void;
  participants: Participant[];
  currentUser: Participant | null;
  setCurrentUser: (user: Participant | null) => void;
}

const getWeekString = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

export const Header: React.FC<HeaderProps> = ({
  role,
  setRole,
  programs,
  navigate,
  participants,
  currentUser,
  setCurrentUser,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const handleRoleChange = () => {
    const newRole = role === Role.ADMIN ? Role.MEMBER : Role.ADMIN;
    setRole(newRole);
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value, 10);
    const user = participants.find((p) => p.id === selectedId) || null;
    setCurrentUser(user);
  };

  const urgentDrafts = useMemo(() => {
    if (role !== Role.ADMIN) return [];

    const today = new Date();
    const currentWeek = getWeekString(today);
    const nextWeekDate = new Date();
    nextWeekDate.setDate(today.getDate() + 7);
    const nextWeek = getWeekString(nextWeekDate);

    return programs.filter((p) => {
      if (p.status !== 'draft') return false;
      const programStartWeek = p.weekRange.start;
      return programStartWeek === currentWeek || programStartWeek === nextWeek;
    });
  }, [programs, role]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  return (
    <header className="h-16 sm:h-20 px-4 sm:px-6 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="h-full flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
            {role === Role.ADMIN ? 'Espace administration' : 'Espace membre'}
          </h2>
          <p className="hidden md:block text-xs text-slate-500 mt-0.5">
            {role === Role.ADMIN
              ? 'Pilotage des programmes et affectations'
              : 'Suivi de vos affectations et indisponibilites'}
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50">
          <span className={`text-sm font-medium ${role === Role.MEMBER ? 'text-blue-700' : 'text-slate-500'}`}>
            Membre
          </span>
          <button
            onClick={handleRoleChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              role === Role.ADMIN ? 'bg-blue-600' : 'bg-slate-400'
            }`}
            aria-label="Basculer de role"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                role === Role.ADMIN ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${role === Role.ADMIN ? 'text-blue-700' : 'text-slate-500'}`}>
            Admin
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {role === Role.ADMIN ? (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                aria-label="Notifications"
              >
                <BellAlertIcon className="h-5 w-5" />
                {urgentDrafts.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] leading-[18px] font-semibold text-center">
                    {urgentDrafts.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <h4 className="font-semibold text-slate-900">Notifications</h4>
                  </div>
                  {urgentDrafts.length > 0 ? (
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-slate-700">
                        {urgentDrafts.length} programme(s) brouillon a valider bientot.
                      </p>
                      <ul className="text-xs list-disc list-inside text-slate-600 space-y-1 max-h-28 overflow-y-auto">
                        {urgentDrafts.map((p) => (
                          <li key={p.id}>{p.title}</li>
                        ))}
                      </ul>
                      <button
                        onClick={() => {
                          navigate('/programs');
                          setIsNotifOpen(false);
                        }}
                        className="w-full text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 border border-blue-100 rounded-lg py-2 transition-colors"
                      >
                        Ouvrir les programmes
                      </button>
                    </div>
                  ) : (
                    <p className="p-4 text-sm text-slate-500">Aucune nouvelle notification.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center">
              <select
                value={currentUser?.id || ''}
                onChange={handleUserSelect}
                className="min-w-[220px] bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>
                  Selectionner un participant
                </option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
