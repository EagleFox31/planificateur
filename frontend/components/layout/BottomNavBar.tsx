import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '../../types';
import { HomeIcon, UsersIcon, ListBulletIcon, ChartBarIcon, DashboardIcon, XMarkIcon, KeyIcon, BookOpenIcon, ClipboardDocumentListIcon, DocumentTextIcon, UserCircleIcon, ClockIcon, Cog6ToothIcon } from '../ui/Icons';
import { Button } from '../ui/Button';

// NavItem sub-component
const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-xs font-medium transition-all duration-300 rounded-xl mx-1 relative overflow-hidden ${
      isActive ? 'text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25' : 'text-gray-600 hover:text-indigo-700 hover:bg-white/80 hover:shadow-md hover:shadow-gray-200/50'
    }`}
  >
    {isActive && (
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
    )}
    <div className={`transition-transform duration-200 relative z-10 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
      {icon}
    </div>
    <span className="mt-1 font-semibold relative z-10">{label}</span>
  </button>
);

// MoreMenuItem sub-component
const MoreMenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center w-full px-5 py-4 text-left text-gray-700 hover:text-white hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-indigo-500/25">
        <div className="text-indigo-500">{icon}</div>
        <span className="ml-4 text-sm font-semibold">{label}</span>
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

  const handleResetClick = () => {
    onResetOnboarding();
    setIsMenuOpen(false);
  };

  const handleRoleChange = () => {
    const newRole = role === Role.ADMIN ? Role.MEMBER : Role.ADMIN;
    setRole(newRole);
  };

  const mainNavItems = role === Role.ADMIN ? [
      { path: '/dashboard', label: 'Accueil', icon: <HomeIcon className="h-6 w-6" /> },
      { path: '/programs', label: 'Programmes', icon: <DocumentTextIcon className="h-6 w-6" /> },
      { path: '/participants', label: 'Participants', icon: <UsersIcon className="h-6 w-6" /> },
      { path: '/statistics', label: 'Stats', icon: <ChartBarIcon className="h-6 w-6" /> },
  ] : [
      { path: '/my-assignments', label: 'Mes Sujets', icon: <UserCircleIcon className="h-6 w-6" /> },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-2xl lg:hidden">
        {mainNavItems.map(item => (
            <NavItem key={item.path} {...item} isActive={location.pathname === item.path} onClick={() => navigate(item.path)} />
        ))}
        <NavItem icon={<DashboardIcon className="h-6 w-6" />} label="Menu" isActive={isMenuOpen} onClick={() => setIsMenuOpen(true)} />
      </nav>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setIsMenuOpen(false)}></div>
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl rounded-t-3xl p-6 lg:hidden animate-slide-up border-t border-white/30 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Menu Principal</h3>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-gray-900">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            
            <div className="space-y-2">
                {role === Role.ADMIN ? (
                  <>
                    <MoreMenuItem icon={<ClockIcon className="h-6 w-6" />} label="Historique" onClick={() => navigate('/participant-history')} />
                    <MoreMenuItem icon={<ListBulletIcon className="h-6 w-6" />} label="Sujets" onClick={() => navigate('/subjects')} />
                    <MoreMenuItem icon={<ClipboardDocumentListIcon className="h-6 w-6" />} label="Indisponibilités" onClick={() => navigate('/unavailabilities')} />
                    <MoreMenuItem icon={<Cog6ToothIcon className="h-6 w-6" />} label="Règles de Rotation" onClick={() => navigate('/rotation-rules')} />
                    <MoreMenuItem icon={<KeyIcon className="h-6 w-6" />} label="Gestion des rôles" onClick={() => navigate('/roles')} />
                  </>
                ): (
                   <MoreMenuItem icon={<HomeIcon className="h-6 w-6" />} label="Tableau de bord" onClick={() => navigate('/dashboard')} />
                )}
                <MoreMenuItem icon={<BookOpenIcon className="h-6 w-6" />} label="Revoir l'introduction" onClick={handleResetClick} />
            </div>

            <hr className="my-4 border-slate-blue-700" />
            
            <div className="p-3 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-inner">
                <label className="block text-sm font-semibold text-indigo-900 mb-3">Voir en tant que :</label>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-inner">
                    <span className={`text-sm font-bold ${role === Role.MEMBER ? 'text-indigo-700' : 'text-gray-500'}`}>
                        Membre
                    </span>
                    <button
                        onClick={handleRoleChange}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shadow-lg ${
                          role === Role.ADMIN ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-gray-300 to-gray-500'
                        }`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                          role === Role.ADMIN ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                    <span className={`text-sm font-bold ${role === Role.ADMIN ? 'text-indigo-700' : 'text-gray-500'}`}>
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
              animation: slide-up 0.3s ease-out;
            }
          `}</style>
        </>
      )}
    </>
  );
};