import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SubjectType, Role } from '../types';
import { Card } from './ui/Card';
import { Cog6ToothIcon } from './ui/Icons';
import { THEME_CLASSES } from '../styles/theme';
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
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(subject);
    });
    return Object.entries(groups).sort(([keyA], [keyB]) => Number(keyA) - Number(keyB));
  }, [subjectTypes]);

  const handleRotationChange = async (subjectId: number, newRotation: number) => {
    if (role !== Role.ADMIN) return;
    try {
      const updatedSubject = await api.updateSubjectType(subjectId, { rotationWeeks: newRotation });
      setSubjectTypes(prev =>
        prev.map(s =>
          s.id === subjectId ? updatedSubject : s
        )
      );
    } catch (error) {
      console.error('Error updating rotation:', error);
      alert('Erreur lors de la mise à jour de la rotation');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
        <div className="flex items-start sm:items-center gap-6 p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
              <Cog6ToothIcon className="h-8 w-8 text-indigo-600" />
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
              <h3 className="text-3xl font-bold text-gray-900">Gestion des Règles de Rotation</h3>
              <p className="text-lg text-gray-700 max-w-3xl mt-2">
                  Modifiez la période de rotation pour chaque sujet. Les sujets avec la même période sont considérés comme un groupe et ne peuvent pas être attribués à la même personne dans cet intervalle.
              </p>
          </motion.div>
        </div>
      </Card>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="space-y-8"
      >
        {groupedByRotation.map(([rotation, subjects], index) => (
          <motion.div
            key={rotation}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
          >
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl border-b border-gray-100">
                <h4 className="text-2xl font-bold text-gray-900">Rotation de {rotation} semaine{Number(rotation) > 1 ? 's' : ''}</h4>
                <p className="text-base text-gray-700 mt-1">
                  {Number(rotation) === 0
                    ? "La rotation est désactivée pour ce groupe."
                    : `Un participant ne peut faire qu'un seul sujet de ce groupe toutes les ${rotation} semaines.`
                  }
                </p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.sort((a,b) => a.label.localeCompare(b.label)).map((subject, subIndex) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 + subIndex * 0.05, duration: 0.4 }}
                    className="bg-gray-50 p-4 rounded-xl flex items-center justify-between gap-3 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900 flex-1">{subject.label}</span>
                    <input
                      type="number"
                      value={subject.rotationWeeks}
                      onChange={(e) => handleRotationChange(subject.id, Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={role !== Role.ADMIN}
                      className="w-20 bg-white border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100 transition-colors"
                      min="0"
                      aria-label={`Rotation pour ${subject.label}`}
                    />
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};