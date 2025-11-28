import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SubjectType, Role, Gender, SpiritualRole } from '../types';
import { Card } from './ui/Card';
import { COLORS, MAIN_TOPICS } from '../constants';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PencilSquareIcon, PlusIcon, ArchiveBoxIcon, ArrowUturnDownIcon } from './ui/Icons';
import { CAPABILITY_LABELS, CAPABILITY_ORDER } from '../utils/capabilities';
import { api } from '../services/api';

interface SubjectEditFormProps {
  subject: SubjectType;
  onSave: (subject: SubjectType) => void;
  onCancel: () => void;
  spiritualRoles: SpiritualRole[];
}

const SubjectEditForm: React.FC<SubjectEditFormProps> = ({ subject, onSave, onCancel, spiritualRoles }) => {
  const [formData, setFormData] = useState<Partial<SubjectType>>(subject);

  useEffect(() => {
    setFormData(subject);
  }, [subject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: SubjectType = {
      ...subject,
      ...formData,
      rotationWeeks: Number(formData.rotationWeeks),
      nbParticipants: Number(formData.nbParticipants),
      label: formData.label!,
      mainTopic: formData.mainTopic!,
      color: formData.color!,
      requiredGender: (formData.requiredGender as string) === '' ? undefined : formData.requiredGender as Gender,
      requiredSpiritualRole: (formData.requiredSpiritualRole as string) === '' ? undefined : formData.requiredSpiritualRole,
    };
    onSave(finalData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
            <label htmlFor="mainTopic" className="block text-sm font-medium text-gray-700 mb-2">Sujet Principal</label>
            <select id="mainTopic" name="mainTopic" value={formData.mainTopic || ''} onChange={handleChange} required className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors">
                {MAIN_TOPICS.map(topic => <option key={topic} value={topic}>{topic}</option>)}
            </select>
        </div>
         <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
            <select id="color" name="color" value={formData.color || 'noir'} onChange={handleChange} required className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 capitalize transition-colors">
                {Object.keys(COLORS).map(colorName => <option key={colorName} value={colorName}>{colorName}</option>)}
            </select>
        </div>
      </div>
      <div>
        <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">Intitulé</label>
        <input id="label" type="text" name="label" value={formData.label || ''} onChange={handleChange} required className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors"/>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="rotationWeeks" className="block text-sm font-medium text-gray-700 mb-2">Rotation (semaines)</label>
          <input id="rotationWeeks" type="number" name="rotationWeeks" value={formData.rotationWeeks || 0} onChange={handleChange} required className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors"/>
        </div>
        <div>
          <label htmlFor="nbParticipants" className="block text-sm font-medium text-gray-700 mb-2">Nb. Participants</label>
          <input id="nbParticipants" type="number" name="nbParticipants" value={formData.nbParticipants || 1} onChange={handleChange} required className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors"/>
        </div>
      </div>

      <div>
        <label htmlFor="requiredCapability" className="block text-sm font-medium text-gray-700 mb-2">Capacité requise</label>
        <select
          id="requiredCapability"
          name="requiredCapability"
          value={formData.requiredCapability || ''}
          onChange={handleChange}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors"
        >
          <option value="">Aucune</option>
          {CAPABILITY_ORDER.map(cap => (
            <option key={cap} value={cap}>{CAPABILITY_LABELS[cap]}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="requiredGender" className="block text-sm font-medium text-gray-700 mb-2">Genre Requis</label>
          <select id="requiredGender" name="requiredGender" value={formData.requiredGender || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors">
            <option value="">Aucun</option>
            {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="requiredSpiritualRole" className="block text-sm font-medium text-gray-700 mb-2">Rôle Spirituel Requis</label>
          <select id="requiredSpiritualRole" name="requiredSpiritualRole" value={formData.requiredSpiritualRole || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors">
            <option value="">Aucun</option>
            {spiritualRoles.map(sr => <option key={sr} value={sr}>{sr}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center">
            <input type="checkbox" id="isBinome" name="isBinome" checked={!!formData.isBinome} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white"/>
            <label htmlFor="isBinome" className="ml-3 block text-sm font-medium text-gray-700">Requiert un binôme</label>
        </div>
        <div className="flex items-center">
            <input type="checkbox" id="uppercaseTitle" name="uppercaseTitle" checked={!!formData.uppercaseTitle} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white"/>
            <label htmlFor="uppercaseTitle" className="ml-3 block text-sm font-medium text-gray-700">Titre en majuscules</label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="!bg-white !text-white !font-semibold !border !border-gray-300 !shadow-md hover:!shadow-lg hover:!bg-gray-50"
        >
          Annuler
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Enregistrer</Button>
      </div>
    </form>
  );
};

interface SubjectConfigurationProps {
  role: Role;
  subjectTypes: SubjectType[];
  setSubjectTypes: React.Dispatch<React.SetStateAction<SubjectType[]>>;
  spiritualRoles: SpiritualRole[];
}

export const SubjectConfiguration: React.FC<SubjectConfigurationProps> = ({ role, subjectTypes, setSubjectTypes, spiritualRoles }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectType | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const handleAdd = () => {
    const newSubjectTemplate: SubjectType = {
      id: 0, // Placeholder for new subject
      mainTopic: MAIN_TOPICS[0],
      label: '',
      color: 'noir',
      rotationWeeks: 4,
      nbParticipants: 1,
      isArchived: false,
    };
    setEditingSubject(newSubjectTemplate);
    setIsModalOpen(true);
  };

  const handleEdit = (subject: SubjectType) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleSave = async (subjectToSave: SubjectType) => {
    try {
      if (subjectToSave.id === 0) { // New subject
        const newSubject = await api.createSubjectType(subjectToSave);
        setSubjectTypes(prev => [...prev, newSubject]);
      } else { // Update existing
        const updatedSubject = await api.updateSubjectType(subjectToSave.id, subjectToSave);
        setSubjectTypes(prev => prev.map(s => s.id === subjectToSave.id ? updatedSubject : s));
      }
      handleClose();
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('Erreur lors de la sauvegarde du sujet');
    }
  };
  
  const handleToggleArchive = async (subjectId: number) => {
    if (role !== Role.ADMIN) return;
    try {
      const subject = subjectTypes.find(s => s.id === subjectId);
      if (!subject) return;
      const updatedSubject = await api.updateSubjectType(subjectId, { isArchived: !subject.isArchived });
      setSubjectTypes(prev =>
        prev.map(s =>
          s.id === subjectId ? updatedSubject : s
        )
      );
    } catch (error) {
      console.error('Error toggling archive:', error);
      alert('Erreur lors de l\'archivage du sujet');
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const visibleSubjects = useMemo(() => {
    return subjectTypes.filter(s => showArchived ? s.isArchived : !s.isArchived);
  }, [subjectTypes, showArchived]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 p-6 border-b border-gray-100">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold text-gray-900">Configuration des types de sujets</h3>
          </motion.div>
          {role === Role.ADMIN && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700">
                <PlusIcon className="h-5 w-5 mr-2"/>
                Ajouter un sujet
              </Button>
            </motion.div>
          )}
        </div>
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.4, duration: 0.5 }}
         className="flex items-center space-x-2 p-6 pt-2"
       >
          <input type="checkbox" id="showArchived" checked={showArchived} onChange={() => setShowArchived(p => !p)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white"/>
          <label htmlFor="showArchived" className="text-sm font-medium text-gray-700">Afficher les sujets archivés</label>
       </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="overflow-x-auto"
      >
        <table className="min-w-full divide-y divide-gray-200 text-base">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">Intitulé</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">Sujet principal</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">Rotation</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">Règles</th>
              {role === Role.ADMIN && (
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 uppercase tracking-wide">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleSubjects.map((s, index) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
                className={`${s.isArchived ? 'opacity-60' : ''} transition-colors duration-200 hover:bg-gray-50`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold text-gray-900">
                  <div className="flex items-center">
                    <span className={`h-3 w-3 rounded-full mr-3 ${COLORS[s.color as keyof typeof COLORS]}`}></span>
                    {s.label}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">{s.mainTopic}</td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">{s.rotationWeeks} sem.</td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">
                  <div className="flex flex-col space-y-1 text-base">
                    <span>Participants : {s.nbParticipants}</span>
                    {s.requiredGender && <span>Genre : {s.requiredGender}</span>}
                    {s.requiredSpiritualRole && <span>Rôle : {s.requiredSpiritualRole}</span>}
                    {s.requiredCapability && <span>Capacité : {CAPABILITY_LABELS[s.requiredCapability]}</span>}
                    {s.isBinome && <span className="text-green-600 font-medium">Binôme requis</span>}
                  </div>
                </td>
                {role === Role.ADMIN && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-semibold space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(s)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300">
                      <PencilSquareIcon className="h-4 w-4 text-white" />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleToggleArchive(s.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300">
                        {s.isArchived ?
                            <ArrowUturnDownIcon className="h-4 w-4 text-white" title="Désarchiver" /> :
                            <ArchiveBoxIcon className="h-4 w-4 text-white" title="Archiver" />
                        }
                    </Button>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      {isModalOpen && editingSubject && (
        <Modal title={editingSubject.id === 0 ? "Ajouter un nouveau sujet" : "Modifier les règles du sujet"} onClose={handleClose}>
          <SubjectEditForm
            subject={editingSubject}
            onSave={handleSave}
            onCancel={handleClose}
            spiritualRoles={spiritualRoles}
          />
        </Modal>
      )}
    </Card>
    </motion.div>
  );
};
