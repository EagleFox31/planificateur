import React, { useState, useEffect } from 'react';
import { Participant, Gender, SpiritualRole, Affiliation, RelationshipType, relationshipTypeLabels } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { SuccessModal } from './ui/SuccessModal';
import { api } from '../services/api';
import * as XLSX from 'xlsx';
import { getDefaultCapabilities } from '../utils/capabilities';

interface ImportedParticipant {
  name: string;
  age?: number;
  gender: Gender;
  tempId: number;
  spiritualRole?: SpiritualRole;
  affiliation: Affiliation[];
  capabilities?: Participant['capabilities'];
}

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newParticipants: Participant[]) => void;
  existingParticipants: Participant[];
  spiritualRoles: SpiritualRole[];
}

export const ImportWizard: React.FC<ImportWizardProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  existingParticipants,
  spiritualRoles,
}) => {
  const [step, setStep] = useState<'select-role' | 'upload' | 'confirm'>('select-role');
  const [selectedRole, setSelectedRole] = useState<SpiritualRole>('Proclamateur');
  const [importedData, setImportedData] = useState<ImportedParticipant[]>([]);
  const [maxId, setMaxId] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchMaxId = async () => {
        const participants = await api.getParticipants();
        const max = participants.length > 0 ? Math.max(...participants.map(p => p.id)) : 0;
        setMaxId(max);
      };
      fetchMaxId();
    }
  }, [isOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row and process data
        const rows = jsonData.slice(1) as any[][];
        const processedData: ImportedParticipant[] = rows
          .filter(row => row.length > 0 && row[0]) // Filter out empty rows
          .map((row, index) => {
            const ageValue = row[1];
            const parsedAge = ageValue === undefined || ageValue === '' ? undefined : Number(ageValue);
            const gender = row[2] === 'FEMALE' ? Gender.FEMALE : Gender.MALE;

            return {
              name: row[0] || '',
              age: Number.isFinite(parsedAge) ? parsedAge : undefined,
              gender,
              tempId: - (index + 1), // Negative temp IDs
              spiritualRole: selectedRole,
              affiliation: [],
              capabilities: getDefaultCapabilities(selectedRole, gender),
            };
          });

        setImportedData(processedData);
        setStep('confirm');
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleRoleSelect = (role: SpiritualRole) => {
    setSelectedRole(role);
    setStep('upload');
  };

  const handleSave = async () => {
    const participantsToSave: Omit<Participant, 'id' | 'assignmentHistory' | 'isExcluded'>[] = importedData.map((p, index) => ({
      id: maxId + index + 1,
      name: p.name,
      age: p.age ?? undefined,
      gender: p.gender,
      spiritualRole: selectedRole,
      unavailabilities: [],
      affiliation: [], // No affiliations for bulk import
      notes: '',
      capabilities: p.capabilities || getDefaultCapabilities(selectedRole, p.gender),
    }));

    try {
      const newParticipants = await api.bulkCreateParticipants(participantsToSave);
      onImportComplete(newParticipants);
      setSuccessMessage(`${newParticipants.length} participant(s) importé(s) avec succès !`);
      setIsSuccessModalOpen(true);
      onClose();
    } catch (error) {
      console.error('Error saving participants:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="Importer des participants" onClose={onClose} size="lg">
      {step === 'select-role' && (
        <div className="space-y-4">
          <p className="text-gray-700">Sélectionnez le rôle spirituel pour tous les participants à importer :</p>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as SpiritualRole)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {spiritualRoles.map(sr => <option key={sr} value={sr} className="bg-white text-gray-900">{sr}</option>)}
          </select>
          <Button onClick={() => setStep('upload')}>Suivant</Button>
        </div>
      )}

      {step === 'upload' && (
        <div className="space-y-4">
          <p className="text-gray-700">Sélectionnez un fichier Excel (.xlsx ou .xls) avec les colonnes: name (obligatoire), age (optionnel), gender (optionnel)</p>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="block w-full text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          <div className="flex justify-between items-center">
            <Button variant="secondary" onClick={() => setStep('select-role')}>Précédent</Button>
            <Button
              as="a"
              href="/import-template.xlsx"
              download="template-participants.xlsx"
              variant="secondary"
              size="sm"
            >
              Télécharger le template Excel
            </Button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <p className="text-gray-700">Confirmer l'import de {importedData.length} participant(s) avec le rôle "{selectedRole}" :</p>
          <ul className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
            {importedData.map((p, i) => (
              <li key={i} className="text-sm text-gray-700 py-1">
                {p.name} - {p.age !== undefined ? `${p.age} ans` : 'Âge non fourni'} - {p.gender}
              </li>
            ))}
          </ul>
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep('upload')}>Précédent</Button>
            <Button onClick={handleSave}>Importer</Button>
          </div>
        </div>
      )}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Import Réussi"
        message={successMessage}
      />
    </Modal>
  );
};
