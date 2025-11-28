import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '../../types';
import { HomeIcon, UsersIcon, ListBulletIcon, ChartBarIcon, BookOpenIcon, KeyIcon, ClipboardDocumentListIcon, DocumentTextIcon, UserCircleIcon, ClockIcon, Cog6ToothIcon } from '../ui/Icons';

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
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 border-l-4 relative overflow-hidden ${
      isActive
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
        : 'text-gray-700 hover:bg-white/80 hover:text-indigo-700 hover:shadow-md border-transparent'
    }`}
  >
    {isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
    )}
    {icon}
    <span className="ml-4 relative z-10">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ role, onResetOnboarding }) => {
  const navigate = useNavigate();
  const location = useLocation();
    
  return (
    <div className="hidden lg:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-xl">
        <div className="flex items-center h-20 px-4 border-b border-white/30">
          <div className="flex items-center">
            <img src="/images/logo.webp" alt="Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold ml-2 text-gray-900">Planificateur</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between p-4">
          <nav className="space-y-2">
            {role === Role.ADMIN ? (
              <>
                <NavItem
                  icon={<HomeIcon className="h-6 w-6" />}
                  label="Tableau de bord"
                  isActive={location.pathname === '/dashboard'}
                  onClick={() => navigate('/dashboard')}
                />
                <NavItem
                  icon={<BookOpenIcon className="h-6 w-6" />}
                  label="Guide admin"
                  isActive={location.pathname === '/admin-guide'}
                  onClick={() => navigate('/admin-guide')}
                />
                 <NavItem
                  icon={<DocumentTextIcon className="h-6 w-6" />}
                  label="Programmes"
                  isActive={location.pathname === '/programs'}
                  onClick={() => navigate('/programs')}
                />
                <NavItem
                  icon={<UsersIcon className="h-6 w-6" />}
                  label="Participants"
                  isActive={location.pathname === '/participants'}
                  onClick={() => navigate('/participants')}
                />
                 <NavItem
                  icon={<ClockIcon className="h-6 w-6" />}
                  label="Historique"
                  isActive={location.pathname === '/participant-history'}
                  onClick={() => navigate('/participant-history')}
                />
                <NavItem
                  icon={<ListBulletIcon className="h-6 w-6" />}
                  label="Sujets"
                  isActive={location.pathname === '/subjects'}
                  onClick={() => navigate('/subjects')}
                />
                <NavItem
                  icon={<ChartBarIcon className="h-6 w-6" />}
                  label="Statistiques"
                  isActive={location.pathname === '/statistics'}
                  onClick={() => navigate('/statistics')}
                />
                <NavItem
                  icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
                  label="Indisponibilités"
                  isActive={location.pathname === '/unavailabilities'}
                  onClick={() => navigate('/unavailabilities')}
                />
                 <NavItem
                  icon={<Cog6ToothIcon className="h-6 w-6" />}
                  label="Règles de Rotation"
                  isActive={location.pathname === '/rotation-rules'}
                  onClick={() => navigate('/rotation-rules')}
                />
                <NavItem
                  icon={<KeyIcon className="h-6 w-6" />}
                  label="Gestion des rôles"
                  isActive={location.pathname === '/roles'}
                  onClick={() => navigate('/roles')}
                />
              </>
            ) : (
                 <NavItem
                    icon={<UserCircleIcon className="h-6 w-6" />}
                    label="Mes Sujets"
                    isActive={location.pathname === '/my-assignments'}
                    onClick={() => navigate('/my-assignments')}
                />
            )}
          </nav>
          <div>
            <hr className="my-4 border-white/30" />
            <NavItem
              icon={<BookOpenIcon className="h-6 w-6" />}
              label="Revoir l'introduction"
              isActive={false}
              onClick={onResetOnboarding}
            />
          </div>
        </div>
      </div>
  );
};
