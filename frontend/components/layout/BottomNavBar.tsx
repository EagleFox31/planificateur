import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '../../types';
import {
  HomeIcon,
  UsersIcon,
  ListBulletIcon,
  ChartBarIcon,
  DashboardIcon,
  XMarkIcon,
  KeyIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
} from '../ui/Icons';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-2 text-[11px] font-medium transition-colors ${
      isActive ? 'text-blue-700' : 'text-slate-500'
    }`}
  >
    <span
      className={`mb-1 p-1.5 rounded-lg ${
        isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
      }`}
    >
      {icon}
    </span>
    <span>{label}</span>
  </button>
);

const MoreMenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full px-4 py-3 rounded-xl text-left text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
  >
    <span className="text-slate-500">{icon}</span>
    <span className="ml-3 text-sm font-medium">{label}</span>
  </button>
);

interface BottomNavBarProps {
  role: Role;
  setRole: (role: Role) => void;
  onResetOnboarding: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ role, setRole, onResetOnboarding }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenuAndNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleResetClick = () => {
    onResetOnboarding();
    setIsMenuOpen(false);
  };

  const handleRoleChange = () => {
    const newRole = role === Role.ADMIN ? Role.MEMBER : Role.ADMIN;
    setRole(newRole);
  };

  const mainNavItems =
    role === Role.ADMIN
      ? [
          { path: '/dashboard', label: 'Accueil', icon: <HomeIcon className="h-5 w-5" /> },
          { path: '/programs', label: 'Programmes', icon: <DocumentTextIcon className="h-5 w-5" /> },
          { path: '/participants', label: 'Participants', icon: <UsersIcon className="h-5 w-5" /> },
          { path: '/statistics', label: 'Stats', icon: <ChartBarIcon className="h-5 w-5" /> },
        ]
      : [
          { path: '/my-assignments', label: 'Mes sujets', icon: <UserCircleIcon className="h-5 w-5" /> },
        ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around bg-white/95 backdrop-blur border-t border-slate-200 lg:hidden pb-[env(safe-area-inset-bottom)]">
        {mainNavItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
        <NavItem
          icon={<DashboardIcon className="h-5 w-5" />}
          label="Menu"
          isActive={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
        />
      </nav>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl p-5 lg:hidden border-t border-slate-200 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900">Menu</h3>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              {role === Role.ADMIN ? (
                <>
                  <MoreMenuItem icon={<ClockIcon className="h-5 w-5" />} label="Historique" onClick={() => closeMenuAndNavigate('/participant-history')} />
                  <MoreMenuItem icon={<ListBulletIcon className="h-5 w-5" />} label="Sujets" onClick={() => closeMenuAndNavigate('/subjects')} />
                  <MoreMenuItem icon={<ClipboardDocumentListIcon className="h-5 w-5" />} label="Indisponibilites" onClick={() => closeMenuAndNavigate('/unavailabilities')} />
                  <MoreMenuItem icon={<Cog6ToothIcon className="h-5 w-5" />} label="Regles de rotation" onClick={() => closeMenuAndNavigate('/rotation-rules')} />
                  <MoreMenuItem icon={<KeyIcon className="h-5 w-5" />} label="Gestion des roles" onClick={() => closeMenuAndNavigate('/roles')} />
                </>
              ) : (
                <MoreMenuItem icon={<HomeIcon className="h-5 w-5" />} label="Tableau de bord" onClick={() => closeMenuAndNavigate('/dashboard')} />
              )}
              <MoreMenuItem icon={<BookOpenIcon className="h-5 w-5" />} label="Revoir l'introduction" onClick={handleResetClick} />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Mode</label>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                <span className={`text-sm ${role === Role.MEMBER ? 'text-blue-700 font-medium' : 'text-slate-500'}`}>
                  Membre
                </span>
                <button
                  onClick={handleRoleChange}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    role === Role.ADMIN ? 'bg-blue-600' : 'bg-slate-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      role === Role.ADMIN ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${role === Role.ADMIN ? 'text-blue-700 font-medium' : 'text-slate-500'}`}>
                  Admin
                </span>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes slide-up {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            .animate-slide-up {
              animation: slide-up 0.22s ease-out;
            }
          `}</style>
        </>
      )}
    </>
  );
};
