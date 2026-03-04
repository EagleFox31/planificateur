import React, { useState } from 'react';
import { Role, SpiritualRole, RolePermissions } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlusIcon, KeyIcon } from './ui/Icons';
import { COLORS, SUBJECT_COLORS } from '../constants';
import { api } from '../services/api';

const spiritualRoleLabels = (role: SpiritualRole): string => {
  if (role === 'Assistant Ministériel') return 'Assistants Ministériels';
  if (role.endsWith('eur')) return role.slice(0, -3) + 'eurs';
  if (role.endsWith('ien')) return role + 's';
  return `${role}s`;
};

interface AddRoleModalProps {
  onClose: () => void;
  onSave: (roleName: string) => void;
  existingRoles: string[];
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ onClose, onSave, existingRoles }) => {
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmedName = roleName.trim();
    if (!trimmedName) { setError('Le nom du rôle ne peut pas être vide.'); return; }
    if (existingRoles.some(r => r.toLowerCase() === trimmedName.toLowerCase())) { setError('Ce rôle existe déjà.'); return; }
    onSave(trimmedName);
  };

  return (
    <Modal title="Ajouter un nouveau rôle" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-2">Nom du nouveau rôle</label>
          <input
            id="roleName"
            type="text"
            value={roleName}
            onChange={(e) => { setRoleName(e.target.value); setError(''); }}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors"
            placeholder="Ex: Lecteur"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} className="!bg-white !text-slate-800 !border !border-gray-300">Annuler</Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Ajouter</Button>
        </div>
      </div>
    </Modal>
  );
};

interface RolePermissionCardProps {
  spiritualRole: SpiritualRole;
  assignedColors: string[];
  onColorToggle: (spiritualRole: SpiritualRole, color: string, isChecked: boolean) => void;
  isAdmin: boolean;
}

const RolePermissionCard: React.FC<RolePermissionCardProps> = ({ spiritualRole, assignedColors, onColorToggle, isAdmin }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-[#D6C4A8] border-b border-[#C0A882]">
        <p className="text-sm font-semibold text-[#3d2e1e]">{spiritualRoleLabels(spiritualRole)}</p>
        <p className="text-xs text-[#7a5c3a] mt-0.5">
          {assignedColors.length} catégorie{assignedColors.length !== 1 ? 's' : ''} autorisée{assignedColors.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SUBJECT_COLORS.map(color => {
          const isChecked = assignedColors.includes(color);
          const colorClass = COLORS[color as keyof typeof COLORS] || 'bg-gray-700';
          return (
            <label
              key={color}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                isChecked ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'
              } ${isAdmin ? 'cursor-pointer hover:border-indigo-300' : 'cursor-not-allowed opacity-60'}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => onColorToggle(spiritualRole, color, e.target.checked)}
                disabled={!isAdmin}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white disabled:opacity-50"
              />
              <span className="flex items-center gap-1.5">
                <span className={`h-3 w-3 rounded-full flex-shrink-0 ${colorClass}`} />
                <span className="capitalize text-xs font-medium text-gray-900">{color}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

interface RoleManagerProps {
  role: Role;
  rolePermissions: RolePermissions;
  setRolePermissions: React.Dispatch<React.SetStateAction<RolePermissions>>;
  spiritualRoles: SpiritualRole[];
  setSpiritualRoles: React.Dispatch<React.SetStateAction<SpiritualRole[]>>;
}

export const RoleManager: React.FC<RoleManagerProps> = ({ role, rolePermissions, setRolePermissions, spiritualRoles, setSpiritualRoles }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleColorToggle = (spiritualRole: SpiritualRole, color: string, isChecked: boolean) => {
    if (role !== Role.ADMIN) return;
    setRolePermissions(prev => {
      const currentColors = prev[spiritualRole] || [];
      const newColors = isChecked ? [...currentColors, color] : currentColors.filter(c => c !== color);
      return { ...prev, [spiritualRole]: [...new Set(newColors)] };
    });
  };

  const handleAddNewRole = async (newRoleName: string) => {
    if (role !== Role.ADMIN) return;
    try {
      await api.addSpiritualRole(newRoleName);
      setSpiritualRoles(prev => [...prev, newRoleName]);
      setRolePermissions(prev => ({ ...prev, [newRoleName]: [] }));
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding new role:', error);
      alert("Erreur lors de l'ajout du rôle");
    }
  };

  const handleSave = async () => {
    if (role !== Role.ADMIN) return;
    setIsSaving(true);
    try {
      await api.updateRolePermissions(rolePermissions);
    } catch (error) {
      console.error('Error saving role permissions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
            <KeyIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gestion des rôles</h1>
            <p className="text-xs text-gray-500">{spiritualRoles.length} rôle{spiritualRoles.length !== 1 ? 's' : ''} configuré{spiritualRoles.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {role === Role.ADMIN && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
            </Button>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-1.5" />
              Ajouter
            </Button>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-red-600">{spiritualRoles.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Rôles spirituels</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-indigo-600">{SUBJECT_COLORS.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Catégories de sujets</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-2xl font-bold text-green-600">
            {spiritualRoles.filter(sr => (rolePermissions[sr] || []).length > 0).length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Rôles avec permissions</p>
        </div>
      </div>

      {/* Role cards */}
      <div className="space-y-4">
        {spiritualRoles.map(sr => (
          <RolePermissionCard
            key={sr}
            spiritualRole={sr}
            assignedColors={rolePermissions[sr] || []}
            onColorToggle={handleColorToggle}
            isAdmin={role === Role.ADMIN}
          />
        ))}
      </div>

      {isAddModalOpen && (
        <AddRoleModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddNewRole}
          existingRoles={spiritualRoles}
        />
      )}
    </div>
  );
};
