import React, { useState, useMemo } from 'react';
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

export const Header: React.FC<HeaderProps> = ({ role, setRole, programs, navigate, participants, currentUser, setCurrentUser }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleRoleChange = () => {
    const newRole = role === Role.ADMIN ? Role.MEMBER : Role.ADMIN;
    setRole(newRole);
  };
  
  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = parseInt(e.target.value, 10);
      const user = participants.find(p => p.id === selectedId) || null;
      setCurrentUser(user);
  };
  
  const urgentDrafts = useMemo(() => {
    if (role !== Role.ADMIN) return [];
    
    const today = new Date();
    const currentWeek = getWeekString(today);
    const nextWeekDate = new Date();
    nextWeekDate.setDate(today.getDate() + 7);
    const nextWeek = getWeekString(nextWeekDate);

    return programs.filter(p => {
        if (p.status !== 'draft') return false;
        const programStartWeek = p.weekRange.start;
        return programStartWeek === currentWeek || programStartWeek === nextWeek;
    });
  }, [programs, role]);

  const handleNotificationClick = () => {
    setIsNotifOpen(prev => !prev);
  }
  
  const handleGoToPrograms = () => {
    navigate('/programs');
    setIsNotifOpen(false);
  }

  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-6 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
      <div className="flex items-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {role === Role.ADMIN ? 'Tableau de bord Admin' : 'Vue Membre'}
        </h2>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:flex items-center space-x-2">
        <span className="hidden sm:inline text-sm font-medium text-slate-blue-400">Mode :</span>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-semibold transition-colors duration-300 ${
            role === Role.MEMBER ? 'text-indigo-700' : 'text-gray-400'
          }`}>
            Membre
          </span>
          <button
            onClick={handleRoleChange}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shadow-lg ${
              role === Role.ADMIN ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-gray-400 to-gray-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                role === Role.ADMIN ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-bold transition-colors duration-300 ${
            role === Role.ADMIN ? 'text-indigo-700' : 'text-gray-400'
          }`}>
            Admin
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {role === Role.ADMIN ? (
          <div className="relative">
            <button onClick={handleNotificationClick} className="relative text-gray-600 hover:text-gray-900 p-2">
              <BellAlertIcon className="h-6 w-6" />
              {urgentDrafts.length > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl z-20">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl">
                  <h4 className="font-bold text-indigo-900">Notifications</h4>
                </div>
                {urgentDrafts.length > 0 ? (
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {urgentDrafts.length} programme(s) en brouillon approchent et nécessitent une validation.
                    </p>
                    <ul className="text-xs list-disc list-inside text-gray-600 space-y-1">
                        {urgentDrafts.map(p => <li key={p.id} className="text-gray-700">{p.title}</li>)}
                    </ul>
                    <button onClick={handleGoToPrograms} className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-2 rounded-lg transition-colors mt-3">
                        Valider les programmes
                    </button>
                  </div>
                ) : (
                  <p className="p-4 text-sm text-gray-500">Aucune nouvelle notification.</p>
                )}
              </div>
            )}
          </div>
        ) : (
            <div className="hidden lg:flex items-center">
                 <select
                   value={currentUser?.id || ''}
                   onChange={handleUserSelect}
                   className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-lg hover:shadow-xl transition-all"
                 >
                    <option value="" disabled>Sélectionner un participant</option>
                    {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
        )}
      </div>
    </header>
  );
};