import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/Dashboard';
import { ParticipantsManager } from './components/ParticipantsManager';
import { Statistics } from './components/Statistics';
import { SubjectConfiguration } from './components/SubjectConfiguration';
import { RoleManager } from './components/RoleManager';
import { UnavailabilityViewer } from './components/UnavailabilityViewer';
import { ProgramsManager } from './components/ProgramsManager';
import { MyAssignmentsView } from './components/MyAssignmentsView';
import { SplashScreen } from './components/onboarding/SplashScreen';
import { Role, Participant, SubjectType, Assignment, AppState, RolePermissions, SpiritualRole, Program } from './types';
import { INITIAL_PARTICIPANTS, INITIAL_SUBJECT_TYPES, INITIAL_PROGRAMS, INITIAL_ROLE_PERMISSIONS, INITIAL_SPIRITUAL_ROLES } from './constants';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { ParticipantHistory } from './components/ParticipantHistory';
import { RotationManager } from './components/RotationManager';
import { api } from './services/api';
import { AdminGuide } from './components/AdminGuide';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';

const toArray = (data: any) => Array.isArray(data) ? data : [];

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [appState, setAppState] = useState<AppState>(AppState.SPLASH);
  const [role, setRole] = useState<Role>(Role.ADMIN);
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [subjectTypes, setSubjectTypes] = useState<SubjectType[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(INITIAL_ROLE_PERMISSIONS);
  const [spiritualRoles, setSpiritualRoles] = useState<SpiritualRole[]>(INITIAL_SPIRITUAL_ROLES);
  
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);

  const allAssignments = useMemo(() => {
    if (!Array.isArray(programs)) return [];
    return programs.flatMap(p => p.assignments || []);
  }, [programs]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [participantsData, subjectTypesData, programsData, rolePermissionsData, spiritualRolesData] = await Promise.all([
          api.getParticipants(),
          api.getSubjectTypes(),
          api.getPrograms(),
          api.getRolePermissions(),
          api.getSpiritualRoles(),
        ]);
        // Always update state with API data, even if empty
        setParticipants(toArray(participantsData));
        setSubjectTypes(toArray(subjectTypesData));
        setPrograms(toArray(programsData));
        setRolePermissions(rolePermissionsData || INITIAL_ROLE_PERMISSIONS);
        const normalizedSpiritualRoles = toArray(spiritualRolesData);
        setSpiritualRoles(normalizedSpiritualRoles.length ? normalizedSpiritualRoles : INITIAL_SPIRITUAL_ROLES);
      } catch (error) {
        console.error('Failed to load data from API:', error);
        // Fallback to empty data instead of initial data
        setParticipants([]);
        setSubjectTypes([]);
        setPrograms([]);
        setRolePermissions(INITIAL_ROLE_PERMISSIONS);
        setSpiritualRoles(INITIAL_SPIRITUAL_ROLES);
      }
    };
    if (appState === AppState.MAIN_APP) {
      loadData();
    }
  }, [appState]);
  
  useEffect(() => {
    if (appState === AppState.MAIN_APP) {
      const hasSeenGuide = localStorage.getItem('userGuideSeen');
      if (!hasSeenGuide) {
        setShowUserGuide(true);
        localStorage.setItem('userGuideSeen', 'true');
      }
    }
  }, [appState]);
  
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === Role.ADMIN) {
        setCurrentUser(null);
        navigate('/dashboard');
    } else {
        navigate('/my-assignments');
    }
  }

  const handleResetOnboarding = useCallback(() => {
      setAppState(AppState.SPLASH);
  }, []);

  const handleStartApp = useCallback(() => {
    setAppState(AppState.MAIN_APP);
    navigate('/admin-guide');
  }, [navigate]);



  if (appState === AppState.SPLASH) {
    return <SplashScreen onStart={handleStartApp} />;
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Global background image */}
      <div
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[url('/images/onboarding-1.jpg')] bg-cover bg-center"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-slate-blue-900/20 to-black/30" />
      </div>

      <div className="relative z-10 flex h-screen bg-transparent">
        <Sidebar role={role} onResetOnboarding={handleResetOnboarding} />
        <div className="flex-1 flex flex-col overflow-hidden backdrop-blur-sm bg-black/10">
          <Header
              role={role}
              setRole={handleRoleChange}
              programs={programs}
              navigate={navigate}
              participants={participants}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            <Routes>
              <Route path="/dashboard" element={<Dashboard role={role} assignments={allAssignments} programs={programs} setPrograms={setPrograms} participants={participants} setParticipants={setParticipants} subjectTypes={subjectTypes} rolePermissions={rolePermissions} />} />
              <Route path="/participants" element={<ParticipantsManager role={role} participants={participants} setParticipants={setParticipants} spiritualRoles={spiritualRoles} />} />
              <Route path="/subjects" element={<SubjectConfiguration role={role} subjectTypes={subjectTypes} setSubjectTypes={setSubjectTypes} spiritualRoles={spiritualRoles} />} />
              <Route path="/statistics" element={<Statistics assignments={allAssignments} participants={participants} subjectTypes={subjectTypes} />} />
              <Route path="/roles" element={<RoleManager role={role} rolePermissions={rolePermissions} setRolePermissions={setRolePermissions} spiritualRoles={spiritualRoles} setSpiritualRoles={setSpiritualRoles} />} />
              <Route path="/unavailabilities" element={<UnavailabilityViewer participants={participants} />} />
              <Route path="/programs" element={<ProgramsManager role={role} programs={programs} setPrograms={setPrograms} participants={participants} subjectTypes={subjectTypes} rolePermissions={rolePermissions} />} />
              <Route path="/my-assignments" element={<MyAssignmentsView assignments={allAssignments} subjectTypes={subjectTypes} currentUser={currentUser} setParticipants={setParticipants} />} />
              <Route path="/participant-history" element={<ParticipantHistory participants={participants} subjectTypes={subjectTypes} />} />
              <Route path="/rotation-rules" element={<RotationManager role={role} subjectTypes={subjectTypes} setSubjectTypes={setSubjectTypes} />} />
              <Route path="/admin-guide" element={<AdminGuide />} />
              <Route path="/" element={<Navigate to="/admin-guide" replace />} />
            </Routes>
          </main>
        </div>
         <BottomNavBar role={role} setRole={handleRoleChange} onResetOnboarding={handleResetOnboarding} />
        {showUserGuide && (
          <Modal title="Bienvenue ! Guide rapide" onClose={() => setShowUserGuide(false)} size="lg">
            <div className="space-y-3 text-slate-blue-50">
              <p className="text-slate-blue-100">Voici les étapes clés pour démarrer :</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-blue-50">
                <li>
                  <button className="underline text-sanctus-blue" onClick={() => { navigate('/participants'); setShowUserGuide(false); }}>
                    Ajouter ou importer des participants
                  </button>
                </li>
                <li>
                  <button className="underline text-sanctus-blue" onClick={() => { navigate('/subjects'); setShowUserGuide(false); }}>
                    Configurer les sujets et capacités
                  </button>
                </li>
                <li>
                  <button className="underline text-sanctus-blue" onClick={() => { navigate('/unavailabilities'); setShowUserGuide(false); }}>
                    Renseigner les indisponibilités
                  </button>
                </li>
                <li>
                  <button className="underline text-sanctus-blue" onClick={() => { navigate('/programs'); setShowUserGuide(false); }}>
                    Générer et ajuster les programmes
                  </button>
                </li>
                <li>
                  <button className="underline text-sanctus-blue" onClick={() => { navigate('/statistics'); setShowUserGuide(false); }}>
                    Consulter les statistiques
                  </button>
                </li>
              </ol>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setShowUserGuide(false)}>Fermer</Button>
                <Button onClick={() => { navigate('/admin-guide'); setShowUserGuide(false); }}>Voir le guide complet</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default App;
