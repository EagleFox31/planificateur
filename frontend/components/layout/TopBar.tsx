import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Role, Program, Participant } from '../../types';
import {
  BellAlertIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  KeyIcon,
  ListBulletIcon,
  UserCircleIcon,
  UsersIcon,
} from '../ui/Icons';

interface TopBarProps {
  role: Role;
  setRole: (role: Role) => void;
  programs: Program[];
  navigate: (path: string) => void;
  participants: Participant[];
  currentUser: Participant | null;
  setCurrentUser: (user: Participant | null) => void;
  onResetOnboarding: () => void;
}

const getWeekString = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const NavButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'border-blue-200 bg-blue-50 text-blue-700'
        : 'border-transparent bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <span className={active ? 'text-blue-600' : 'text-slate-400'}>{icon}</span>
    <span>{label}</span>
  </button>
);

export const TopBar: React.FC<TopBarProps> = ({
  role,
  setRole,
  programs,
  navigate,
  participants,
  currentUser,
  setCurrentUser,
  onResetOnboarding,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const navItems = useMemo(
    () =>
      role === Role.ADMIN
        ? [
            { path: '/dashboard', label: 'Tableau de bord', icon: <HomeIcon className="h-4 w-4" /> },
            { path: '/admin-guide', label: 'Guide admin', icon: <BookOpenIcon className="h-4 w-4" /> },
            { path: '/programs', label: 'Programmes', icon: <DocumentTextIcon className="h-4 w-4" /> },
            { path: '/participants', label: 'Participants', icon: <UsersIcon className="h-4 w-4" /> },
            { path: '/participant-history', label: 'Historique', icon: <ClockIcon className="h-4 w-4" /> },
            { path: '/subjects', label: 'Sujets', icon: <ListBulletIcon className="h-4 w-4" /> },
            { path: '/statistics', label: 'Statistiques', icon: <ChartBarIcon className="h-4 w-4" /> },
            { path: '/unavailabilities', label: 'Indisponibilites', icon: <ClipboardDocumentListIcon className="h-4 w-4" /> },
            { path: '/rotation-rules', label: 'Regles de rotation', icon: <Cog6ToothIcon className="h-4 w-4" /> },
            { path: '/roles', label: 'Gestion des roles', icon: <KeyIcon className="h-4 w-4" /> },
          ]
        : [{ path: '/my-assignments', label: 'Mes sujets', icon: <UserCircleIcon className="h-4 w-4" /> }],
    [role]
  );

  const urgentDrafts = useMemo(() => {
    if (role !== Role.ADMIN) return [];

    const today = new Date();
    const currentWeek = getWeekString(today);
    const nextWeekDate = new Date();
    nextWeekDate.setDate(today.getDate() + 7);
    const nextWeek = getWeekString(nextWeekDate);

    return programs.filter((program) => {
      if (program.status !== 'draft') return false;
      const programStartWeek = program.weekRange.start;
      return programStartWeek === currentWeek || programStartWeek === nextWeek;
    });
  }, [programs, role]);

  useEffect(() => {
    setIsNotifOpen(false);
  }, [location.pathname, role]);

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

  const handleRoleChange = () => {
    setRole(role === Role.ADMIN ? Role.MEMBER : Role.ADMIN);
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value, 10);
    const user = participants.find((participant) => participant.id === selectedId) || null;
    setCurrentUser(user);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex min-w-0 items-center gap-3 rounded-lg px-1 text-left transition-colors hover:text-blue-700"
          >
            <img src="/images/logo.webp" alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-slate-900">Planificateur</h1>
              <p className="hidden sm:block truncate text-xs text-slate-500">Reunions theocratiques</p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className={`text-sm ${role === Role.MEMBER ? 'font-medium text-blue-700' : 'text-slate-500'}`}>
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
              <span className={`text-sm ${role === Role.ADMIN ? 'font-medium text-blue-700' : 'text-slate-500'}`}>
                Admin
              </span>
            </div>

            {role === Role.ADMIN ? (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen((prev) => !prev)}
                  className="relative rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  aria-label="Notifications"
                >
                  <BellAlertIcon className="h-5 w-5" />
                  {urgentDrafts.length > 0 && (
                    <span className="absolute -right-1 -top-1 min-h-[18px] min-w-[18px] rounded-full bg-red-600 px-1 text-center text-[11px] font-semibold leading-[18px] text-white">
                      {urgentDrafts.length}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                      <h4 className="font-semibold text-slate-900">Notifications</h4>
                    </div>
                    {urgentDrafts.length > 0 ? (
                      <div className="space-y-3 p-4">
                        <p className="text-sm text-slate-700">
                          {urgentDrafts.length} programme(s) brouillon a valider bientot.
                        </p>
                        <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-slate-600">
                          {urgentDrafts.map((program) => (
                            <li key={program.id} className="list-disc list-inside">
                              {program.title}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => navigate('/programs')}
                          className="w-full rounded-lg border border-blue-100 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800"
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
                  className="min-w-[220px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Selectionner un participant
                  </option>
                  {participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onResetOnboarding}
              className="hidden lg:inline-flex rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Revoir l'introduction
            </button>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto border-t border-slate-100 py-2">
          {navItems.map((item) => (
            <NavButton
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
};
