import React, { useState, useEffect, useMemo } from 'react';
import { SubjectType, Role, Gender, SpiritualRole } from '../types';
import { COLORS, MAIN_TOPICS } from '../constants';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PencilSquareIcon, PlusIcon, ArchiveBoxIcon, ArrowUturnDownIcon, ListBulletIcon } from './ui/Icons';
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
          className="!bg-white !text-slate-800 !font-semibold !border !border-gray-300 !shadow-md hover:!shadow-lg hover:!bg-gray-50"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
            <ListBulletIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sujets</h1>
            <p className="text-xs text-gray-500">{subjectTypes.filter(s => !s.isArchived).length} sujet{subjectTypes.filter(s => !s.isArchived).length !== 1 ? 's' : ''} actif{subjectTypes.filter(s => !s.isArchived).length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input type="checkbox" id="showArchived" checked={showArchived} onChange={() => setShowArchived(p => !p)} className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white"/>
            Archivés
          </label>
          {role === Role.ADMIN && (
            <Button size="sm" onClick={handleAdd}>
              <PlusIcon className="h-4 w-4 mr-1.5"/>
              Ajouter
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-purple-600">{subjectTypes.filter(s => !s.isArchived).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Sujets actifs</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-gray-400">{subjectTypes.filter(s => s.isArchived).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Archivés</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-emerald-600">{subjectTypes.filter(s => s.isBinome).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Binômes</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-[#D6C4A8] sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#3d2e1e] uppercase tracking-wide">Intitulé</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#3d2e1e] uppercase tracking-wide">Section</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#3d2e1e] uppercase tracking-wide">Rotation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#3d2e1e] uppercase tracking-wide">Règles</th>
                {role === Role.ADMIN && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#3d2e1e] uppercase tracking-wide">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {visibleSubjects.map((s, index) => (
                <tr
                  key={s.id}
                  className={`transition-colors hover:bg-gray-50 ${s.isArchived ? 'opacity-50' : ''} ${index % 2 === 1 ? 'bg-gray-50/40' : ''}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${COLORS[s.color as keyof typeof COLORS]}`}></span>
                      {s.label}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{s.mainTopic}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{s.rotationWeeks} sem.</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>{s.nbParticipants} pers.</span>
                      {s.requiredGender && <span>{s.requiredGender}</span>}
                      {s.requiredSpiritualRole && <span>{s.requiredSpiritualRole}</span>}
                      {s.requiredCapability && <span>{CAPABILITY_LABELS[s.requiredCapability]}</span>}
                      {s.isBinome && <span className="text-emerald-600 font-medium">Binôme</span>}
                    </div>
                  </td>
                  {role === Role.ADMIN && (
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-1">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(s)}>
                        <PencilSquareIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleToggleArchive(s.id)}>
                        {s.isArchived
                          ? <ArrowUturnDownIcon className="h-4 w-4" title="Désarchiver" />
                          : <ArchiveBoxIcon className="h-4 w-4" title="Archiver" />
                        }
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
};
