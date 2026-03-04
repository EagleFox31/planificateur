import React, { useMemo } from 'react';
import { SubjectType, Role } from '../types';
import { Cog6ToothIcon } from './ui/Icons';
import { api } from '../services/api';

interface RotationManagerProps {
  role: Role;
  subjectTypes: SubjectType[];
  setSubjectTypes: React.Dispatch<React.SetStateAction<SubjectType[]>>;
}

export const RotationManager: React.FC<RotationManagerProps> = ({ role, subjectTypes, setSubjectTypes }) => {

  const groupedByRotation = useMemo(() => {
    const groups: { [key: number]: SubjectType[] } = {};
    subjectTypes.forEach(subject => {
      const key = subject.rotationWeeks;
      if (!groups[key]) groups[key] = [];
      groups[key].push(subject);
    });
    return Object.entries(groups).sort(([keyA], [keyB]) => Number(keyA) - Number(keyB));
  }, [subjectTypes]);

  const handleRotationChange = async (subjectId: number, newRotation: number) => {
    if (role !== Role.ADMIN) return;
    try {
      const updatedSubject = await api.updateSubjectType(subjectId, { rotationWeeks: newRotation });
      setSubjectTypes(prev => prev.map(s => s.id === subjectId ? updatedSubject : s));
    } catch (error) {
      console.error('Error updating rotation:', error);
      alert('Erreur lors de la mise à jour de la rotation');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Cog6ToothIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Règles de rotation</h1>
          <p className="text-xs text-gray-500">Intervalle minimum entre deux attributions identiques</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-indigo-600">{subjectTypes.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Sujets configurés</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-purple-600">{groupedByRotation.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Groupes de rotation</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-gray-700">
            {subjectTypes.length > 0 ? Math.max(...subjectTypes.map(s => s.rotationWeeks)) : 0}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Rotation max (sem.)</p>
        </div>
      </div>

      {/* Rotation groups */}
      <div className="space-y-4">
        {groupedByRotation.map(([rotation, subjects]) => (
          <div key={rotation} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#D6C4A8] border-b border-[#C0A882]">
              <p className="text-sm font-semibold text-[#3d2e1e]">
                Rotation : {rotation} semaine{Number(rotation) > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-[#7a5c3a] mt-0.5">
                {Number(rotation) === 0
                  ? 'Rotation désactivée pour ce groupe'
                  : `Min. ${rotation} semaine${Number(rotation) > 1 ? 's' : ''} entre deux attributions identiques`}
              </p>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.sort((a, b) => a.label.localeCompare(b.label)).map(subject => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 flex-1 truncate">{subject.label}</span>
                  <input
                    type="number"
                    value={subject.rotationWeeks}
                    onChange={(e) => handleRotationChange(subject.id, Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={role !== Role.ADMIN}
                    className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-center text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100 transition-colors"
                    min="0"
                    aria-label={`Rotation pour ${subject.label}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
