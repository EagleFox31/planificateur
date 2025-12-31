import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Program, Participant, SubjectType, Role, RolePermissions } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProgramDetailView } from './ProgramDetailView';
import { DocumentTextIcon, CheckCircleIcon, TrashIcon } from './ui/Icons';
import { api } from '../services/api';
import { THEME_CLASSES } from '../styles/theme';

interface ProgramsManagerProps {
    role: Role;
    programs: Program[];
    setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
    participants: Participant[];
    subjectTypes: SubjectType[];
    rolePermissions: RolePermissions;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
};

export const ProgramsManager: React.FC<ProgramsManagerProps> = ({ role, programs, setPrograms, participants, subjectTypes, rolePermissions }) => {
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    
    const sortedPrograms = [...programs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handlePublish = async (programId: string) => {
        if (role !== Role.ADMIN) return;
        try {
            await api.updateProgram(programId, { status: 'published', updatedAt: new Date().toISOString() });
            // Reload programs to reflect changes
            const updatedPrograms = await api.getPrograms();
            setPrograms(updatedPrograms);
        } catch (error) {
            console.error('Error publishing program:', error);
        }
    };

    const handleDelete = async (programId: string, programTitle: string) => {
        if (role !== Role.ADMIN) return;
        const confirmed = window.confirm(`Supprimer définitivement le programme "${programTitle}" ?`);
        if (!confirmed) return;
        try {
            await api.deleteProgram(programId);
            setPrograms(prevPrograms => prevPrograms.filter(p => p.id !== programId));
        } catch (error) {
            console.error('Error deleting program:', error);
        }
    };

    if (selectedProgram) {
        return (
            <ProgramDetailView 
                program={selectedProgram}
                participants={participants}
                subjectTypes={subjectTypes}
                onBack={() => setSelectedProgram(null)}
                role={role}
                setPrograms={setPrograms}
                rolePermissions={rolePermissions}
            />
        );
    }
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
        >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 p-6">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-start gap-4"
                    >
                        <div className="bg-white p-3 rounded-xl shadow-sm">
                            <DocumentTextIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900">Programmes Générés</h3>
                            <p className="text-lg text-gray-700 max-w-3xl mt-2">
                                Consultez, modifiez, imprimez ou partagez les plannings générés.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </Card>

            {programs.length === 0 ? (
                 <Card className={`p-8 text-center ${THEME_CLASSES.card}`}>
                    <p className={THEME_CLASSES.text.muted}>Aucun programme n'a encore été généré.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {sortedPrograms.map(program => (
                        <div
                          key={program.id}
                          className="p-4 sm:p-6 bg-white text-black border border-gray-200 shadow-xl rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                          style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                        >
                            <div>
                                <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-lg text-black">{program.title}</h4>
                                    {program.status === 'draft' ? (
                                        <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${THEME_CLASSES.status.draft}`}>Brouillon</span>
                                    ) : (
                                        <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${THEME_CLASSES.status.published}`}>Publié</span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-700 mt-1 space-x-2">
                                    <span>Créé le : {formatDate(program.createdAt)}</span>
                                    <span>|</span>
                                    <span>Modifié le : {formatDate(program.updatedAt)}</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                {role === Role.ADMIN && program.status === 'draft' && (
                                     <Button onClick={() => handlePublish(program.id)} size="sm">
                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                        Publier
                                    </Button>
                                )}
                                {role === Role.ADMIN && (
                                    <Button
                                        onClick={() => handleDelete(program.id, program.title)}
                                        variant="secondary"
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 border border-red-700"
                                    >
                                        <TrashIcon className="h-5 w-5 mr-2" />
                                        Supprimer
                                    </Button>
                                )}
                                <Button onClick={() => setSelectedProgram(program)} variant="secondary" size="sm">
                                    Détails
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
