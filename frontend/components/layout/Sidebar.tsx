import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '../../types';
import {
  HomeIcon,
  UsersIcon,
  ListBulletIcon,
  ChartBarIcon,
  BookOpenIcon,
  KeyIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
} from '../ui/Icons';

interface SidebarProps {
  role: Role;
  onResetOnboarding: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl border transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 border-blue-100'
        : 'bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <span
      className={`mr-3 transition-colors ${
        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
      }`}
    >
      {icon}
    </span>
    <span className="font-medium">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ role, onResetOnboarding }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200">
      <div className="h-20 px-5 border-b border-slate-200 flex items-center">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/images/logo.webp" alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-slate-900 truncate">Planificateur</h1>
            <p className="text-xs text-slate-500 truncate">Reunions theocratiques</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-4">
        <nav className="space-y-1.5">
          {role === Role.ADMIN ? (
            <>
              <NavItem
                icon={<HomeIcon className="h-5 w-5" />}
                label="Tableau de bord"
                isActive={location.pathname === '/dashboard'}
                onClick={() => navigate('/dashboard')}
              />
              <NavItem
                icon={<BookOpenIcon className="h-5 w-5" />}
                label="Guide admin"
                isActive={location.pathname === '/admin-guide'}
                onClick={() => navigate('/admin-guide')}
              />
              <NavItem
                icon={<DocumentTextIcon className="h-5 w-5" />}
                label="Programmes"
                isActive={location.pathname === '/programs'}
                onClick={() => navigate('/programs')}
              />
              <NavItem
                icon={<UsersIcon className="h-5 w-5" />}
                label="Participants"
                isActive={location.pathname === '/participants'}
                onClick={() => navigate('/participants')}
              />
              <NavItem
                icon={<ClockIcon className="h-5 w-5" />}
                label="Historique"
                isActive={location.pathname === '/participant-history'}
                onClick={() => navigate('/participant-history')}
              />
              <NavItem
                icon={<ListBulletIcon className="h-5 w-5" />}
                label="Sujets"
                isActive={location.pathname === '/subjects'}
                onClick={() => navigate('/subjects')}
              />
              <NavItem
                icon={<ChartBarIcon className="h-5 w-5" />}
                label="Statistiques"
                isActive={location.pathname === '/statistics'}
                onClick={() => navigate('/statistics')}
              />
              <NavItem
                icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
                label="Indisponibilites"
                isActive={location.pathname === '/unavailabilities'}
                onClick={() => navigate('/unavailabilities')}
              />
              <NavItem
                icon={<Cog6ToothIcon className="h-5 w-5" />}
                label="Regles de rotation"
                isActive={location.pathname === '/rotation-rules'}
                onClick={() => navigate('/rotation-rules')}
              />
              <NavItem
                icon={<KeyIcon className="h-5 w-5" />}
                label="Gestion des roles"
                isActive={location.pathname === '/roles'}
                onClick={() => navigate('/roles')}
              />
            </>
          ) : (
            <NavItem
              icon={<UserCircleIcon className="h-5 w-5" />}
              label="Mes sujets"
              isActive={location.pathname === '/my-assignments'}
              onClick={() => navigate('/my-assignments')}
            />
          )}
        </nav>

        <div className="pt-4 mt-4 border-t border-slate-200">
          <NavItem
            icon={<BookOpenIcon className="h-5 w-5" />}
            label="Revoir l'introduction"
            isActive={false}
            onClick={onResetOnboarding}
          />
        </div>
      </div>
    </aside>
  );
};
