import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Role, SpiritualRole, RolePermissions } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlusIcon, Cog6ToothIcon } from './ui/Icons';
import { COLORS, SUBJECT_COLORS } from '../constants';
import { api } from '../services/api';
import { THEME_CLASSES } from '../styles/theme';

const spiritualRoleLabels = (role: SpiritualRole): string => {
  if (role === 'Assistant Ministériel') {
    return 'Assistants Ministériels';
  }
  if (role.endsWith('eur')) {
    return role.slice(0, -3) + 'eurs';
  }
  if (role.endsWith('ien')) {
      return role + 's';
  }
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
        if (!trimmedName) {
            setError('Le nom du rôle ne peut pas être vide.');
            return;
        }
        if (existingRoles.some(r => r.toLowerCase() === trimmedName.toLowerCase())) {
            setError('Ce rôle existe déjà.');
            return;
        }
        onSave(trimmedName);
    };

    return (
        <Modal title="Ajouter un nouveau rôle" onClose={onClose}>
            <div className="space-y-6">
                <div>
                    <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-2">Nom du nouveau rôle</label>
                    <input id="roleName" type="text" value={roleName} onChange={(e) => { setRoleName(e.target.value); setError(''); }} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors" placeholder="Ex: Lecteur"/>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button variant="secondary" onClick={onClose} className="!bg-white !hover:bg-gray-50 !text-white !border !border-gray-300">Annuler</Button>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-xl font-bold text-gray-900 mb-4">{spiritualRoleLabels(spiritualRole)}</h4>
        <p className="text-sm text-gray-700 mb-6">
          Cochez les catégories de sujets (par couleur) que ce groupe peut se voir attribuer.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SUBJECT_COLORS.map(color => {
            const isChecked = assignedColors.includes(color);
            const colorClass = COLORS[color as keyof typeof COLORS] || 'bg-slate-blue-700';

            return (
              <motion.label
                key={color}
                whileHover={{ scale: isAdmin ? 1.02 : 1 }}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                  isChecked ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-300 bg-gray-50'
                } ${isAdmin ? 'cursor-pointer hover:border-indigo-400 hover:bg-indigo-25' : 'cursor-not-allowed opacity-70'}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => onColorToggle(spiritualRole, color, e.target.checked)}
                  disabled={!isAdmin}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white disabled:opacity-50"
                />
                <span className="flex items-center space-x-2">
                  <span className={`h-4 w-4 rounded-full ${colorClass}`}></span>
                  <span className="capitalize font-medium text-gray-900">{color}</span>
                </span>
              </motion.label>
            );
          })}
        </div>
      </Card>
    </motion.div>
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
      const newColors = isChecked
        ? [...currentColors, color]
        : currentColors.filter(c => c !== color);
      
      const updatedPermissions = { ...prev };
      updatedPermissions[spiritualRole] = [...new Set(newColors)];
      return updatedPermissions;
    });
  };

  const handleAddNewRole = async (newRoleName: string) => {
    if (role !== Role.ADMIN) return;
    try {
      await api.addSpiritualRole(newRoleName);
      setSpiritualRoles(prev => [...prev, newRoleName]);
      setRolePermissions(prev => {
        const updatedPermissions = { ...prev };
        updatedPermissions[newRoleName] = [];
        return updatedPermissions;
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding new role:', error);
      alert('Erreur lors de l\'ajout du rôle');
    }
  };

  const handleSave = async () => {
    if (role !== Role.ADMIN) return;
    setIsSaving(true);
    try {
      await api.updateRolePermissions(rolePermissions);
      // Optionally show success message
    } catch (error) {
      console.error('Error saving role permissions:', error);
    } finally {
      setIsSaving(false);
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 p-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-start gap-4"
          >
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <Cog6ToothIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">Gestion des Rôles</h3>
              <p className="text-lg text-gray-700 max-w-3xl mt-2">
                Définissez ici quels rôles peuvent être assignés aux catégories de sujets. Vous pouvez aussi créer de nouveaux rôles.
              </p>
            </div>
          </motion.div>
          {role === Role.ADMIN && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex space-x-3"
            >
              <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder les permissions'}
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Ajouter un rôle
              </Button>
            </motion.div>
          )}
        </div>
      </Card>

      <div className="space-y-6">
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
    </motion.div>
  );
};