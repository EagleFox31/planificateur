import React, { useState, useMemo, useEffect } from 'react';
import { Participant, Role, Gender, SpiritualRole, Affiliation, RelationshipType, relationshipTypeLabels, CapabilityKey, ParticipantCapabilities, RolePermissions } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { SuccessModal } from './ui/SuccessModal';
import { PlusIcon, BellAlertIcon, TrashIcon, CalendarDaysIcon, DocumentTextIcon, UsersIcon } from './ui/Icons';
import { WeekPickerModal } from './ui/WeekPickerModal';
import { ImportWizard } from './ImportWizard';
import { api } from '../services/api';
import { CAPABILITY_LABELS, CAPABILITY_ORDER, getRoleCapabilityDefaults, cloneCapabilities } from '../utils/capabilities';

const ITEMS_PER_PAGE = 10;

const getRoleBadgeClasses = (role: SpiritualRole) => {
  const normalized = (role || '').toLowerCase();
  if (normalized.includes('ancien')) return 'bg-amber-500';
  if (normalized.includes('assistant')) return 'bg-emerald-500';
  if (normalized.includes('pionnier')) return 'bg-indigo-500';
  if (normalized.includes('proclamateur')) return 'bg-sky-500';
  return 'bg-slate-500';
};

interface ParticipantsManagerProps {
  role: Role;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  spiritualRoles: SpiritualRole[];
  rolePermissions: RolePermissions;
}

interface ParticipantFormProps {
  participant?: Participant;
  allParticipants: Participant[];
  onSave: (participant: Participant) => void;
  onCancel: () => void;
  spiritualRoles: SpiritualRole[];
  rolePermissions: RolePermissions;
}

interface ParticipantFormState {
  name: string;
  age: string;
  gender: Gender;
  spiritualRole: SpiritualRole;
  affiliation: Affiliation[];
  notes: string;
  unavailabilities: string[];
  capabilities: ParticipantCapabilities;
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({ participant, allParticipants, onSave, onCancel, spiritualRoles, rolePermissions }) => {
  const [formData, setFormData] = useState<ParticipantFormState>({
    name: participant?.name || '',
    age: participant?.age !== undefined && participant?.age !== null ? String(participant.age) : '',
    gender: participant?.gender || Gender.MALE,
    spiritualRole: participant?.spiritualRole || 'Proclamateur',
    affiliation: participant?.affiliation || [],
    notes: participant?.notes || '',
    unavailabilities: participant?.unavailabilities || [],
    capabilities: participant?.capabilities || getRoleCapabilityDefaults(rolePermissions, participant?.spiritualRole || 'Proclamateur', participant?.gender || Gender.MALE),
  });
  const [isWeekPickerOpen, setIsWeekPickerOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'gender') {
      const newGender = value as Gender;
      setFormData(prev => ({
        ...prev,
        gender: newGender,
        capabilities: cloneCapabilities(prev.capabilities ?? getRoleCapabilityDefaults(rolePermissions, prev.spiritualRole, newGender))
      }));
      return;
    }
    if (name === 'spiritualRole') {
      const newRole = value as SpiritualRole;
      setFormData(prev => ({
        ...prev,
        spiritualRole: newRole,
        capabilities: cloneCapabilities(getRoleCapabilityDefaults(rolePermissions, newRole, prev.gender))
      }));
      return;
    }
    const key = name as keyof ParticipantFormState;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCapabilityToggle = (capability: CapabilityKey) => {
    setFormData(prev => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: !prev.capabilities?.[capability],
      },
    }));
  };

  const handleAddAffiliation = () => {
    const newAffiliation: Affiliation = {
      relationship: RelationshipType.PARENT,
      withParticipantId: 0,
    };
    setFormData(prev => ({ ...prev, affiliation: [...prev.affiliation, newAffiliation] }));
  };

  const handleRemoveAffiliation = (index: number) => {
    setFormData(prev => ({ ...prev, affiliation: prev.affiliation.filter((_, i) => i !== index) }));
  };

  const handleAffiliationChange = (index: number, field: 'relationship' | 'withParticipantId', value: string) => {
    setFormData(prev => {
        const newAffiliations = [...prev.affiliation];
        newAffiliations[index] = { ...newAffiliations[index], [field]: field === 'withParticipantId' ? parseInt(value) : value as RelationshipType };
        return { ...prev, affiliation: newAffiliations };
    });
  };

  const handleSaveUnavailabilities = (weeks: string[]) => {
      setFormData(prev => ({ ...prev, unavailabilities: weeks.sort() }));
  };

  const handleRemoveUnavailability = (week: string) => {
    setFormData(prev => ({ ...prev, unavailabilities: prev.unavailabilities.filter(w => w !== week) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAge = formData.age === '' ? undefined : Number(formData.age);
    const { age, ...restFormData } = formData;
    const finalParticipant: Participant = {
      id: participant?.id || Date.now(),
      assignmentHistory: participant?.assignmentHistory || [],
      isExcluded: participant?.isExcluded || false,
      exclusionEndDate: participant?.exclusionEndDate,
      ...restFormData,
      age: Number.isFinite(parsedAge) ? parsedAge : undefined,
      affiliation: restFormData.affiliation.filter(aff => aff.withParticipantId > 0),
    };
    onSave(finalParticipant);
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/*... other fields ...*/}
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Âge</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Optionnel"
          min="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Genre</label>
        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500">
          {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Rôle spirituel</label>
        <select name="spiritualRole" value={formData.spiritualRole} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500">
          {spiritualRoles.map(sr => <option key={sr} value={sr}>{sr}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Capacités</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CAPABILITY_ORDER.map(cap => (
            <label key={cap} className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!formData.capabilities?.[cap]}
                onChange={() => handleCapabilityToggle(cap)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{CAPABILITY_LABELS[cap]}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Affiliation Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Affiliations familiales</label>
        {formData.affiliation.map((aff, index) => (
          <div key={index} className="flex items-center space-x-2">
            <select
              value={aff.relationship}
              onChange={e => handleAffiliationChange(index, 'relationship', e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.entries(relationshipTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <select
              value={aff.withParticipantId}
              onChange={e => handleAffiliationChange(index, 'withParticipantId', e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={0}>Sélectionner...</option>
              {allParticipants
                .filter(p => p.id !== participant?.id)
                .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Button type="button" variant="secondary" size="sm" onClick={() => handleRemoveAffiliation(index)}>
                <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={handleAddAffiliation}>
          Ajouter une affiliation
        </Button>
      </div>

      {/* Unavailability Section */}
       <div className="space-y-2">
           <label className="block text-sm font-medium text-gray-700 flex items-center">
               <CalendarDaysIcon className="h-5 w-5 mr-2 text-indigo-600" />
               Indisponibilités
           </label>
            <Button type="button" variant="secondary" onClick={() => setIsWeekPickerOpen(true)}>
                Gérer les semaines d'indisponibilité
            </Button>
            {formData.unavailabilities.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {formData.unavailabilities.map(week => (
                        <span key={week} className="flex items-center bg-indigo-100 text-indigo-800 text-sm rounded-full px-3 py-1 border border-indigo-200">
                            {week}
                            <button type="button" onClick={() => handleRemoveUnavailability(week)} className="ml-2 text-indigo-600 hover:text-indigo-800">
                                <TrashIcon className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes (confidentiel)</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="!bg-white !hover:bg-gray-50 !text-slate-800 !border !border-gray-300">Annuler</Button>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
    {isWeekPickerOpen && (
      <WeekPickerModal 
          initialSelectedWeeks={formData.unavailabilities}
          onSave={handleSaveUnavailabilities}
          onClose={() => setIsWeekPickerOpen(false)}
      />
    )}
    </>
  );
};

export const ParticipantsManager: React.FC<ParticipantsManagerProps> = ({ role, participants, setParticipants, spiritualRoles, rolePermissions }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState<Participant | undefined>(undefined);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    const [genderFilter, setGenderFilter] = useState('ALL');
    const [ageFilter, setAgeFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [capabilityFilter, setCapabilityFilter] = useState<'ALL' | CapabilityKey>('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredParticipants = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const hasCapability = (participant: Participant) => {
            if (capabilityFilter === 'ALL') return true;
            const explicit = participant.capabilities?.[capabilityFilter];
            if (typeof explicit !== 'undefined') return !!explicit;
            const defaults = getRoleCapabilityDefaults(rolePermissions, participant.spiritualRole, participant.gender);
            return !!defaults[capabilityFilter];
        };

        return participants
            .filter(p => {
                if (!p?.name) return false;
                if (normalizedSearch && !p.name.toLowerCase().includes(normalizedSearch)) return false;
                if (genderFilter !== 'ALL' && p.gender !== genderFilter) return false;
                if (ageFilter === 'CHILD') {
                    if (p.age === undefined || p.age === null) return false;
                    if (p.age >= 18) return false;
                }
                if (ageFilter === 'ADULT') {
                    if (p.age === undefined || p.age === null) return false;
                    if (p.age < 18) return false;
                }
                if (roleFilter !== 'ALL' && p.spiritualRole !== roleFilter) return false;
                if (!hasCapability(p)) return false;
                return true;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [participants, genderFilter, ageFilter, roleFilter, searchTerm, capabilityFilter, rolePermissions]);

    useEffect(() => {
        setCurrentPage(1);
    }, [genderFilter, ageFilter, roleFilter, searchTerm, capabilityFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredParticipants.length / ITEMS_PER_PAGE));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedParticipants = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredParticipants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredParticipants, currentPage]);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages && filteredParticipants.length > 0;
    const firstItemIndex = filteredParticipants.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const lastItemIndex = filteredParticipants.length === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, filteredParticipants.length);
    const displayRangeText = filteredParticipants.length === 0 ? '0' : `${firstItemIndex}-${lastItemIndex}`;


    const handleAdd = () => {
        setEditingParticipant(undefined);
        setIsModalOpen(true);
    };
    
    const handleEdit = (participant: Participant) => {
        setEditingParticipant(participant);
        setIsModalOpen(true);
    };

    const handleSave = async (participant: Participant) => {
        try {
            if (editingParticipant) {
                const updated = await api.updateParticipant(participant.id, participant);
                setParticipants(prev => prev.map(p => p.id === participant.id ? updated : p));
                setSuccessMessage('Participant mis à jour avec succès !');
            } else {
                const nextId = participants.length > 0 ? Math.max(...participants.map(p => p.id || 0)) + 1 : 1;
                const newParticipant = await api.createParticipant({
                    id: nextId,
                    name: participant.name,
                    age: participant.age ?? undefined,
                    gender: participant.gender,
                    spiritualRole: participant.spiritualRole,
                    unavailabilities: participant.unavailabilities,
                    affiliation: participant.affiliation,
                    notes: participant.notes,
                    capabilities: participant.capabilities,
                });
                setParticipants(prev => [...prev, newParticipant]);
                setSuccessMessage('Participant ajouté avec succès !');
            }
            setIsModalOpen(false);
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error('Error saving participant:', error);
        }
    };

    const handleToggleExclusion = async (participantId: number) => {
        try {
            const participant = participants.find(p => p.id === participantId);
            if (!participant) return;

            const isNowExcluded = !participant.isExcluded;
            let exclusionEndDate: string | undefined = participant.exclusionEndDate;

            if (isNowExcluded) {
                const today = new Date();
                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                exclusionEndDate = lastDayOfMonth.toISOString().split('T')[0];
            } else {
                exclusionEndDate = undefined;
            }

            const updatedParticipant = { ...participant, isExcluded: isNowExcluded, exclusionEndDate };
            await api.updateParticipant(participantId, updatedParticipant);
            setParticipants(prev => prev.map(p => p.id === participantId ? updatedParticipant : p));
        } catch (error) {
            console.error('Error toggling exclusion:', error);
            alert('Erreur lors de la mise à jour du statut d\'exclusion');
        }
    };

    const handleImportComplete = (newParticipants: Participant[]) => {
        setParticipants(prev => [...prev, ...newParticipants]);
    };

    const getParticipantNameById = (id: number) => participants.find(p => p.id === id)?.name || 'Inconnu';

    const today = new Date();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        <UsersIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Participants</h1>
                        <p className="text-xs text-gray-500">
                            {participants.length} personne{participants.length !== 1 ? 's' : ''} enregistrée{participants.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                {role === Role.ADMIN && (
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setIsImportOpen(true)}>
                            <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                            Importer
                        </Button>
                        <Button size="sm" onClick={handleAdd}>
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            Ajouter
                        </Button>
                    </div>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-2xl font-bold text-indigo-600">{participants.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Au total</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-2xl font-bold text-green-600">{participants.filter(p => !p.isExcluded).length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Actifs</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-2xl font-bold text-red-500">{participants.filter(p => p.isExcluded).length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Exclus</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    <div className="lg:col-span-4">
                        <label htmlFor="searchFilter" className="block text-xs font-medium text-gray-500 mb-1.5">Rechercher par nom</label>
                        <input
                            id="searchFilter"
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Tapez un nom…"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <label htmlFor="genderFilter" className="block text-xs font-medium text-gray-500 mb-1.5">Genre</label>
                        <select id="genderFilter" value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900">
                            <option value="ALL">Tous</option>
                            <option value={Gender.MALE}>Hommes</option>
                            <option value={Gender.FEMALE}>Femmes</option>
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label htmlFor="ageFilter" className="block text-xs font-medium text-gray-500 mb-1.5">Âge</label>
                        <select id="ageFilter" value={ageFilter} onChange={e => setAgeFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900">
                            <option value="ALL">Tous</option>
                            <option value="CHILD">Enfants (-18 ans)</option>
                            <option value="ADULT">Adultes</option>
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label htmlFor="roleFilter" className="block text-xs font-medium text-gray-500 mb-1.5">Rôle</label>
                        <select id="roleFilter" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900">
                            <option value="ALL">Tous les rôles</option>
                            {spiritualRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label htmlFor="capabilityFilter" className="block text-xs font-medium text-gray-500 mb-1.5">Capacité</label>
                        <select
                            id="capabilityFilter"
                            value={capabilityFilter}
                            onChange={e => setCapabilityFilter(e.target.value as 'ALL' | CapabilityKey)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        >
                            <option value="ALL">Toutes les capacités</option>
                            {CAPABILITY_ORDER.map(cap => (
                                <option key={cap} value={cap}>{CAPABILITY_LABELS[cap]}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
                    <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-[#D6C4A8] sticky top-0 z-10">
                        <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#3d2e1e] uppercase tracking-wide">Nom</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#3d2e1e] uppercase tracking-wide">Affiliation</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#3d2e1e] uppercase tracking-wide">Rôle</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#3d2e1e] uppercase tracking-wide">Statut</th>
                        {role === Role.ADMIN && <th className="px-4 py-3 text-right text-xs font-semibold text-[#3d2e1e] uppercase tracking-wide">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                {filteredParticipants.length > 0 ? (
                    paginatedParticipants.map((p, index) => {
                        const needsReminder = p.isExcluded && p.exclusionEndDate && new Date(p.exclusionEndDate) < today;
                        return (
                            <tr
                                key={p.id}
                                className={`transition-colors hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50/40' : ''}`}
                            >
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {p.affiliation.length > 0
                                    ? p.affiliation.map(aff => `${relationshipTypeLabels[aff.relationship]} ${getParticipantNameById(aff.withParticipantId)}`).join(', ')
                                    : <span className="text-gray-400">—</span>
                                }
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-white text-xs font-semibold ${getRoleBadgeClasses(p.spiritualRole)}`}>
                                    {p.spiritualRole}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        {role === Role.ADMIN ? (
                                            <button
                                                onClick={() => handleToggleExclusion(p.id)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.isExcluded ? 'bg-red-500' : 'bg-green-500'}`}
                                            >
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${p.isExcluded ? 'translate-x-1' : 'translate-x-4'}`}/>
                                            </button>
                                        ) : null}
                                        <span className={`text-xs font-medium ${p.isExcluded ? 'text-red-600' : 'text-green-600'}`}>
                                            {p.isExcluded ? 'Exclu' : 'Actif'}
                                        </span>
                                        {needsReminder && role === Role.ADMIN && <BellAlertIcon className="h-4 w-4 text-amber-500" title="Réévaluation requise" />}
                                    </div>
                                </td>
                                {role === Role.ADMIN && (
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="secondary" size="sm" onClick={() => handleEdit(p)}>Détails</Button>
                                    </td>
                                )}
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan={role === Role.ADMIN ? 5 : 4} className="text-center py-12 text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                                <UsersIcon className="h-10 w-10 text-gray-200" />
                                <span className="text-sm">Aucun participant ne correspond aux filtres.</span>
                            </div>
                        </td>
                    </tr>
                )}
                    </tbody>
                    </table>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 border-t border-gray-100 gap-3 bg-gray-50/50">
                    <span className="text-xs text-gray-500">
                        {filteredParticipants.length === 0 ? 'Aucun résultat' : `${displayRangeText} sur ${filteredParticipants.length}`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={!canGoPrevious}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${canGoPrevious ? 'bg-white hover:bg-gray-50 text-gray-900 border-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100'}`}
                        >
                            Précédent
                        </button>
                        <span className="text-xs text-gray-500">
                            {filteredParticipants.length === 0 ? '1 / 1' : `${currentPage} / ${totalPages}`}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={!canGoNext}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${canGoNext ? 'bg-white hover:bg-gray-50 text-gray-900 border-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100'}`}
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            </div>

        {isModalOpen && (
            <Modal
                title={editingParticipant ? "Détails du participant" : "Ajouter un participant"}
                onClose={() => setIsModalOpen(false)}
                size="xl"
                position="top"
            >
                <ParticipantForm
                    participant={editingParticipant}
                    allParticipants={participants}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    spiritualRoles={spiritualRoles}
                    rolePermissions={rolePermissions}
                />
            </Modal>
        )}
        <ImportWizard
            isOpen={isImportOpen}
            onClose={() => setIsImportOpen(false)}
            onImportComplete={handleImportComplete}
            existingParticipants={participants}
            spiritualRoles={spiritualRoles}
        />
        <SuccessModal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
            title="Succès"
            message={successMessage}
        />
        </div>
    );
};
