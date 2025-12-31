import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Participant, Role } from '../types';
import { Card } from './ui/Card';
import { UserCircleIcon, ClipboardDocumentListIcon } from './ui/Icons';
import { Button } from './ui/Button';
import { api } from '../services/api';

interface UnavailabilityViewerProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  role: Role;
}

const getUnavailabilitiesByWeek = (participants: Participant[]) => {
    const byWeek: { [week: string]: Participant[] } = {};
    participants.forEach(participant => {
        if (participant.unavailabilities && participant.unavailabilities.length > 0) {
            participant.unavailabilities.forEach(week => {
                if (!byWeek[week]) {
                    byWeek[week] = [];
                }
                byWeek[week].push(participant);
            });
        }
    });
    return Object.entries(byWeek).sort(([weekA], [weekB]) => weekA.localeCompare(weekB));
};

export const UnavailabilityViewer: React.FC<UnavailabilityViewerProps> = ({ participants, setParticipants, role }) => {
    const unavailabilitiesByWeek = useMemo(() => getUnavailabilitiesByWeek(participants), [participants]);
    const excludedParticipants = useMemo(() => participants.filter(p => p.isExcluded), [participants]);
    const [dateEdits, setDateEdits] = useState<Record<number, string>>({});

    useEffect(() => {
        setDateEdits(prev => {
            const next = { ...prev };
            participants.forEach(p => {
                if (p.isExcluded && next[p.id] === undefined) {
                    next[p.id] = p.exclusionEndDate || '';
                }
                if (!p.isExcluded && next[p.id] !== undefined) {
                    delete next[p.id];
                }
            });
            return next;
        });
    }, [participants]);

    const handleDateChange = (participantId: number, value: string) => {
        setDateEdits(prev => ({ ...prev, [participantId]: value }));
    };

    const handleUpdateExclusionDate = async (participant: Participant) => {
        if (role !== Role.ADMIN) return;
        const selectedDate = dateEdits[participant.id] ?? participant.exclusionEndDate ?? '';
        if (!selectedDate) {
            alert("Veuillez choisir une date de fin d'exclusion.");
            return;
        }
        const updatedParticipant = { ...participant, isExcluded: true, exclusionEndDate: selectedDate };
        try {
            await api.updateParticipant(participant.id, { isExcluded: true, exclusionEndDate: selectedDate });
            setParticipants(prev => prev.map(p => p.id === participant.id ? updatedParticipant : p));
        } catch (error) {
            console.error('Error updating exclusion date:', error);
            alert("Erreur lors de la mise à jour de la date d'exclusion.");
        }
    };

    const handleSetIndefiniteExclusion = async (participant: Participant) => {
        if (role !== Role.ADMIN) return;
        const updatedParticipant = { ...participant, isExcluded: true, exclusionEndDate: undefined };
        try {
            await api.updateParticipant(participant.id, { isExcluded: true, exclusionEndDate: null });
            setParticipants(prev => prev.map(p => p.id === participant.id ? updatedParticipant : p));
            setDateEdits(prev => ({ ...prev, [participant.id]: '' }));
        } catch (error) {
            console.error('Error setting indefinite exclusion:', error);
            alert("Erreur lors de la mise à jour de l'exclusion.");
        }
    };

    const handleDeactivateParticipant = async (participant: Participant) => {
        if (role !== Role.ADMIN) return;
        const confirmed = window.confirm(`Desactiver ${participant.name} et le retirer de la base ?`);
        if (!confirmed) return;
        try {
            await api.deleteParticipant(participant.id);
            setParticipants(prev => prev.filter(p => p.id !== participant.id));
        } catch (error) {
            console.error('Error deactivating participant:', error);
            alert("Erreur lors de la desactivation du participant.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
        >
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
                <div className="flex items-start sm:items-center gap-6 p-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                        className="bg-white p-4 rounded-xl shadow-sm"
                    >
                       <ClipboardDocumentListIcon className="h-8 w-8 text-orange-600" />
                    </motion.div>
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <h3 className="text-3xl font-bold text-gray-900">Indisponibilités</h3>
                        <p className="text-lg text-gray-700 max-w-3xl mt-2">
                            Vue d'ensemble de toutes les indisponibilités enregistrées, groupées par semaine.
                        </p>
                    </motion.div>
                </div>
            </Card>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <div className="p-6 bg-gradient-to-r from-rose-50 to-red-50 rounded-t-xl border-b border-gray-100">
                        <h4 className="font-bold text-xl text-gray-900">Participants exclus</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            {excludedParticipants.length} participant{excludedParticipants.length > 1 ? 's' : ''} exclu{excludedParticipants.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    {excludedParticipants.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Aucun participant exclu pour le moment.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {excludedParticipants.map((p, index) => (
                                <motion.li
                                    key={p.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                                    className="p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center">
                                            <UserCircleIcon className="h-6 w-6 mr-4 text-red-500" />
                                            <div>
                                                <span className="text-gray-900 font-medium block">{p.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {p.exclusionEndDate ? `Jusqu'au ${p.exclusionEndDate}` : 'Exclusion indefinie'}
                                                </span>
                                            </div>
                                        </div>
                                        {role === Role.ADMIN && (
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                <input
                                                    type="date"
                                                    value={dateEdits[p.id] ?? p.exclusionEndDate ?? ''}
                                                    onChange={(e) => handleDateChange(p.id, e.target.value)}
                                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleUpdateExclusionDate(p)}
                                                    className="bg-gray-100 hover:bg-gray-200 text-white border-gray-300"
                                                >
                                                    Mettre a jour
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleSetIndefiniteExclusion(p)}
                                                    className="bg-red-500 hover:bg-red-600 text-white border-red-600"
                                                >
                                                    Exclusion indefinie
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleDeactivateParticipant(p)}
                                                    className="bg-slate-700 hover:bg-slate-800 text-white border-slate-800"
                                                >
                                                    Desactiver
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                    <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-xl border-b border-gray-100">
                        <h4 className="font-bold text-xl text-gray-900">Indisponibilités périodiques</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Vue par semaine des indisponibilités enregistrées.
                        </p>
                    </div>
                    {unavailabilitiesByWeek.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Aucune indisponibilité enregistrée pour le moment.
                        </div>
                    ) : (
                        <div className="space-y-4 p-4">
                            {unavailabilitiesByWeek.map(([week, unavailableParticipants], index) => (
                                <motion.div
                                    key={week}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                    <div className="p-4 bg-white border-b border-gray-100">
                                        <h5 className="font-semibold text-gray-900">Semaine : {week}</h5>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {unavailableParticipants.length} participant{unavailableParticipants.length > 1 ? 's' : ''} indisponible{unavailableParticipants.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <ul className="divide-y divide-gray-100">
                                        {unavailableParticipants.map((p, subIndex) => (
                                            <motion.li
                                                key={p.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.6 + index * 0.1 + subIndex * 0.05, duration: 0.3 }}
                                                className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <UserCircleIcon className="h-5 w-5 mr-3 text-orange-500" />
                                                <span className="text-gray-900 font-medium">{p.name}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Card>
            </motion.div>
        </motion.div>
    );
};
