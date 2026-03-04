import React, { useMemo, useEffect, useState } from 'react';
import { Participant, Role } from '../types';
import { UsersIcon, CalendarDaysIcon } from './ui/Icons';
import { Button } from './ui/Button';
import { api } from '../services/api';
import { ConfirmModal } from './ui/ConfirmModal';

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
    const [deactivateTarget, setDeactivateTarget] = useState<Participant | null>(null);

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
        try {
            await api.deleteParticipant(participant.id);
            setParticipants(prev => prev.filter(p => p.id !== participant.id));
        } catch (error) {
            console.error('Error deactivating participant:', error);
            alert("Erreur lors de la desactivation du participant.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <CalendarDaysIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Indisponibilités</h1>
                    <p className="text-xs text-gray-500">Absences et exclusions par semaine</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-2xl font-bold text-orange-500">{unavailabilitiesByWeek.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Semaines concernées</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-2xl font-bold text-amber-600">{unavailabilitiesByWeek.reduce((n, [, arr]) => n + arr.length, 0)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Absences déclarées</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-2xl font-bold text-red-500">{excludedParticipants.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Exclus</p>
                </div>
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Excluded participants */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-[#D6C4A8] border-b border-[#C0A882]">
                        <p className="text-sm font-semibold text-[#3d2e1e]">Participants exclus</p>
                        <p className="text-xs text-[#7a5c3a] mt-0.5">
                            {excludedParticipants.length} exclu{excludedParticipants.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {excludedParticipants.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">
                            Aucun participant exclu pour le moment.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 overflow-y-auto max-h-80">
                            {excludedParticipants.map((p) => (
                                <li key={p.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <UsersIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                                            <div>
                                                <span className="text-sm font-medium text-gray-900 block">{p.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {p.exclusionEndDate ? `Jusqu'au ${p.exclusionEndDate}` : 'Exclusion indéfinie'}
                                                </span>
                                            </div>
                                        </div>
                                        {role === Role.ADMIN && (
                                            <div className="flex flex-wrap sm:flex-row sm:items-center gap-2">
                                                <input
                                                    type="date"
                                                    value={dateEdits[p.id] ?? p.exclusionEndDate ?? ''}
                                                    onChange={(e) => handleDateChange(p.id, e.target.value)}
                                                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700"
                                                />
                                                <Button size="sm" variant="secondary" onClick={() => handleUpdateExclusionDate(p)}>
                                                    Mettre à jour
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => handleSetIndefiniteExclusion(p)} className="bg-red-500 hover:bg-red-600 !text-white border-red-600">
                                                    Indéfinie
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => setDeactivateTarget(p)} className="bg-slate-700 hover:bg-slate-800 !text-white border-slate-800">
                                                    Désactiver
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Weekly unavailabilities */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-[#D6C4A8] border-b border-[#C0A882]">
                        <p className="text-sm font-semibold text-[#3d2e1e]">Indisponibilités par semaine</p>
                        <p className="text-xs text-[#7a5c3a] mt-0.5">Absences temporaires enregistrées</p>
                    </div>
                    {unavailabilitiesByWeek.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">
                            Aucune indisponibilité enregistrée pour le moment.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 overflow-y-auto max-h-80">
                            {unavailabilitiesByWeek.map(([week, unavailableParticipants]) => (
                                <div key={week} className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-semibold text-gray-900">{week}</p>
                                        <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                                            {unavailableParticipants.length} absent{unavailableParticipants.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {unavailableParticipants.map((p) => (
                                            <span key={p.id} className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 rounded-full px-2.5 py-1 border border-orange-100">
                                                <UsersIcon className="h-3 w-3" />
                                                {p.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {deactivateTarget && (
                <ConfirmModal
                    title="Désactiver un participant"
                    description={`Désactiver ${deactivateTarget.name} et le retirer de la base ?`}
                    confirmLabel="Désactiver"
                    confirmClassName="bg-red-600 hover:bg-red-700"
                    onCancel={() => setDeactivateTarget(null)}
                    onConfirm={() => {
                        handleDeactivateParticipant(deactivateTarget);
                        setDeactivateTarget(null);
                    }}
                />
            )}
        </div>
    );
};
