import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Assignment, Participant, SubjectType } from '../types';
import { Button } from './ui/Button';
import { ChartBarIcon, BookOpenIcon } from './ui/Icons';

interface StatisticsProps {
  assignments: Assignment[];
  participants: Participant[];
  subjectTypes: SubjectType[];
}

const THEME_COLORS = ['#4f85e4', '#52a352', '#d4af37', '#e48a4f', '#a352a3', '#52a39f', '#a35252'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const displayLabel = label || entry?.payload?.name || entry?.name || '';
    const valueLabel = entry?.name || entry?.payload?.name || '';
    return (
      <div className="bg-gray-800/90 backdrop-blur-md p-3 border border-gray-600 rounded-lg shadow-lg">
        <p className="font-semibold text-white text-xs">{displayLabel}</p>
        <p className="text-blue-200 text-xs">{`${valueLabel} : ${entry?.value}`}</p>
      </div>
    );
  }
  return null;
};

const GUIDE_STEPS = [
  { title: 'Cartes KPI', description: "Ces cartes montrent les métriques clés : nombre de participants actifs, total d'attributions, moyenne par participant et taux de participation.", element: 'kpi-cards' },
  { title: 'Attributions par sujet', description: "Répartition des attributions par sujet. Permet de voir quels sujets sont les plus populaires et ajuster la configuration.", element: 'chart-2' },
  { title: 'Couverture par sujet', description: "Nombre de participants uniques par sujet principal. Montre la diversité des attributions.", element: 'chart-5' },
  { title: 'Matrice de compétences', description: "Heatmap montrant les attributions des participants les plus actifs sur les principaux sujets. Plus la couleur est intense, plus d'attributions.", element: 'chart-7' },
];

const ITEMS_PER_PAGE = 10;

export const Statistics: React.FC<StatisticsProps> = ({ assignments, participants, subjectTypes }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [matrixPage, setMatrixPage] = useState(1);

  const startGuide = () => { setCurrentStep(0); setIsGuideOpen(true); };
  const nextStep = () => { currentStep < GUIDE_STEPS.length - 1 ? setCurrentStep(currentStep + 1) : setIsGuideOpen(false); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
  const closeGuide = () => setIsGuideOpen(false);

  React.useEffect(() => {
    if (isGuideOpen && GUIDE_STEPS[currentStep]) {
      const element = document.getElementById(GUIDE_STEPS[currentStep].element);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isGuideOpen]);

  const kpiData = useMemo(() => {
    const safeParticipants = Array.isArray(participants) ? participants : [];
    const safeAssignments = Array.isArray(assignments) ? assignments : [];
    const activeParticipants = safeParticipants.filter(p => safeAssignments.some(a => a.participantIds.includes(p.id))).length;
    const totalAssignments = safeAssignments.length;
    const avgAssignments = activeParticipants > 0 ? (totalAssignments / activeParticipants).toFixed(1) : '0';
    const participationRate = safeParticipants.length > 0 ? ((activeParticipants / safeParticipants.length) * 100).toFixed(1) : '0';
    return { activeParticipants, totalAssignments, avgAssignments, participationRate };
  }, [assignments, participants]);

  const assignmentsPerSubjectType = useMemo(() => {
    const safeAssignments = Array.isArray(assignments) ? assignments : [];
    const safeSubjectTypes = Array.isArray(subjectTypes) ? subjectTypes : [];
    const counts: { [key: string]: number } = {};
    for (const assignment of safeAssignments) {
      const subject = safeSubjectTypes.find(s => s.id === assignment.subjectTypeId);
      if (subject) counts[subject.mainTopic] = (counts[subject.mainTopic] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [assignments, subjectTypes]);

  const participantsPerSubjectType = useMemo(() => {
    const safeAssignments = Array.isArray(assignments) ? assignments : [];
    const safeSubjectTypes = Array.isArray(subjectTypes) ? subjectTypes : [];
    const participantSets: { [key: string]: Set<number> } = {};
    for (const assignment of safeAssignments) {
      const subject = safeSubjectTypes.find(s => s.id === assignment.subjectTypeId);
      if (subject) {
        if (!participantSets[subject.mainTopic]) participantSets[subject.mainTopic] = new Set();
        assignment.participantIds.forEach(id => participantSets[subject.mainTopic].add(id));
      }
    }
    return Object.entries(participantSets).map(([name, participantSet]) => ({ name, value: participantSet.size }));
  }, [assignments, subjectTypes]);

  const skillsMatrix = useMemo(() => {
    const safeParticipants = Array.isArray(participants) ? participants : [];
    const safeAssignments = Array.isArray(assignments) ? assignments : [];
    const safeSubjectTypes = Array.isArray(subjectTypes) ? subjectTypes : [];
    const matrix: { [participantId: number]: { [subjectId: number]: number } } = {};
    const allActiveParticipants = safeParticipants
      .filter(p => safeAssignments.some(a => a.participantIds.includes(p.id)))
      .sort((a, b) => a.name.localeCompare(b.name));
    const allSubjects = safeSubjectTypes;
    allActiveParticipants.forEach(p => {
      matrix[p.id] = {};
      allSubjects.forEach(subject => {
        matrix[p.id][subject.id] = safeAssignments.filter(a => a.participantIds.includes(p.id) && a.subjectTypeId === subject.id).length;
      });
    });
    return { matrix, allActiveParticipants, allSubjects };
  }, [assignments, participants, subjectTypes]);

  const paginatedParticipants = useMemo(() => {
    const startIndex = (matrixPage - 1) * ITEMS_PER_PAGE;
    return skillsMatrix.allActiveParticipants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [skillsMatrix.allActiveParticipants, matrixPage]);

  const totalMatrixPages = Math.ceil(skillsMatrix.allActiveParticipants.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center flex-shrink-0">
            <ChartBarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Statistiques</h1>
            <p className="text-xs text-gray-500">Métriques de participation et d'attribution</p>
          </div>
        </div>
        <Button onClick={startGuide} variant="secondary" size="sm">
          <BookOpenIcon className="h-4 w-4 mr-1.5" />
          Guide
        </Button>
      </div>

      {/* KPIs */}
      <div id="kpi-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-blue-600">{kpiData.activeParticipants}</p>
          <p className="text-xs text-gray-500 mt-0.5">Participants actifs</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-green-600">{kpiData.totalAssignments}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total attributions</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-purple-600">{kpiData.avgAssignments}</p>
          <p className="text-xs text-gray-500 mt-0.5">Moyenne / participant</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-orange-500">{kpiData.participationRate}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Taux de participation</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="chart-2" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-[#D6C4A8] border-b border-[#C0A882]">
            <p className="text-sm font-semibold text-[#3d2e1e]">Attributions par sujet principal</p>
          </div>
          <div className="p-5" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assignmentsPerSubjectType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={110}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {assignmentsPerSubjectType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div id="chart-5" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-[#D6C4A8] border-b border-[#C0A882]">
            <p className="text-sm font-semibold text-[#3d2e1e]">Couverture par sujet</p>
          </div>
          <div className="p-5" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participantsPerSubjectType} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={THEME_COLORS[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Matrix */}
      <div id="chart-7" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-[#D6C4A8] border-b border-[#C0A882]">
          <p className="text-sm font-semibold text-[#3d2e1e]">Matrice de compétences</p>
          <p className="text-xs text-[#7a5c3a] mt-0.5">Attributions par participant et par sujet</p>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left text-gray-900 font-semibold w-4 min-w-4">Participant</th>
                {skillsMatrix.allSubjects.map((subject, index) => (
                  <th
                    key={subject.id}
                    className={`px-0.5 py-1 text-center text-gray-900 font-semibold w-4 min-w-4 ${index === 0 ? 'pl-1' : ''}`}
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  >
                    {subject.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedParticipants.map(p => (
                <tr key={p.id}>
                  <td className="px-1 py-1 font-medium text-gray-900 w-4 min-w-4 truncate">{p.name}</td>
                  {skillsMatrix.allSubjects.map((subject, index) => {
                    const count = skillsMatrix.matrix[p.id]?.[subject.id] || 0;
                    const intensity = Math.min(count * 50, 255);
                    return (
                      <td
                        key={subject.id}
                        className={`px-0.5 py-1 text-center w-4 min-w-4 text-xs font-semibold text-gray-900 ${index === 0 ? 'pl-1' : ''}`}
                        style={{ backgroundColor: `rgba(79, 133, 228, ${count > 0 ? 0.3 + (intensity / 255) * 0.7 : 0.1})` }}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3 border-t border-gray-100 gap-3">
          <span className="text-xs text-gray-500">
            {((matrixPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(matrixPage * ITEMS_PER_PAGE, skillsMatrix.allActiveParticipants.length)} sur {skillsMatrix.allActiveParticipants.length} participants
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMatrixPage(prev => Math.max(prev - 1, 1))}
              disabled={matrixPage === 1}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${matrixPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'}`}
            >
              Précédent
            </button>
            <span className="text-xs text-gray-500">Page {matrixPage} / {totalMatrixPages}</span>
            <button
              onClick={() => setMatrixPage(prev => Math.min(prev + 1, totalMatrixPages))}
              disabled={matrixPage === totalMatrixPages}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${matrixPage === totalMatrixPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'}`}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Guide modal */}
      {isGuideOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeGuide} />
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white p-4 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold">{GUIDE_STEPS[currentStep].title}</h3>
              <button onClick={closeGuide} className="text-gray-400 hover:text-white text-lg leading-none">×</button>
            </div>
            <p className="text-xs text-gray-300 mb-4">{GUIDE_STEPS[currentStep].description}</p>
            <div className="flex items-center justify-between">
              <Button onClick={prevStep} disabled={currentStep === 0} size="sm" variant="secondary">Précédent</Button>
              <span className="text-xs text-gray-400">{currentStep + 1} / {GUIDE_STEPS.length}</span>
              <Button onClick={nextStep} size="sm">{currentStep === GUIDE_STEPS.length - 1 ? 'Terminer' : 'Suivant'}</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
