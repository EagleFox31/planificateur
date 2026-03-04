import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Program, Participant, SubjectType, Role, RolePermissions } from '../types';
import { ProgramDetailView } from './ProgramDetailView';
import { DocumentTextIcon, CheckCircleIcon, TrashIcon } from './ui/Icons';
import { api } from '../services/api';
import { ConfirmModal } from './ui/ConfirmModal';

interface ProgramsManagerProps {
    role: Role;
    programs: Program[];
    setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
    participants: Participant[];
    subjectTypes: SubjectType[];
    rolePermissions: RolePermissions;
}

const COL_TEMPLATE = 'grid-cols-[minmax(220px,1fr)_90px_120px_120px_160px]';

const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const parseWeekNumber = (isoWeek: string) => {
    const match = isoWeek.match(/(\d{4})-W(\d{2})/);
    return match ? parseInt(match[2], 10) : 0;
};

const countWeeks = (start: string, end: string) => {
    const s = parseWeekNumber(start);
    const e = parseWeekNumber(end);
    return e >= s ? e - s + 1 : 1;
};

// KPI Card
const KpiCard: React.FC<{
    label: string;
    value: number | string;
    color: string;
    icon: React.ReactNode;
}> = ({ label, value, color, icon }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                {icon}
            </div>
        </div>
        <span className="text-4xl font-bold text-gray-900 tracking-tight">{value}</span>
    </div>
);

export const ProgramsManager: React.FC<ProgramsManagerProps> = ({ role, programs, setPrograms, participants, subjectTypes, rolePermissions }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedProgramId = searchParams.get('programId');
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);

    const sortedPrograms = [...programs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // KPIs
    const totalPublished = programs.filter((p: Program) => p.status === 'published').length;
    const totalDraft = programs.filter((p: Program) => p.status === 'draft').length;
    const totalAssignments = programs.reduce((acc: number, p: Program) => acc + (p.assignments?.length ?? 0), 0);

    useEffect(() => {
        if (!selectedProgramId) { setSelectedProgram(null); return; }
        setSelectedProgram(programs.find((p: Program) => p.id === selectedProgramId) ?? null);
    }, [selectedProgramId, programs]);

    const openProgramDetails = (programId: string) => {
        const next = new URLSearchParams(searchParams);
        next.set('programId', programId);
        setSearchParams(next);
    };

    const closeProgramDetails = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('programId');
        setSearchParams(next);
    };

    const handlePublish = async (programId: string) => {
        if (role !== Role.ADMIN) return;
        try {
            await api.updateProgram(programId, { status: 'published', updatedAt: new Date().toISOString() });
            setPrograms(await api.getPrograms());
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (programId: string) => {
        if (role !== Role.ADMIN) return;
        try {
            await api.deleteProgram(programId);
            setPrograms((prev: Program[]) => prev.filter((p: Program) => p.id !== programId));
        } catch (e) { console.error(e); }
    };

    if (selectedProgram) {
        return (
            <ProgramDetailView
                key={selectedProgram.id}
                program={selectedProgram}
                participants={participants}
                subjectTypes={subjectTypes}
                onBack={closeProgramDetails}
                role={role}
                setPrograms={setPrograms}
                rolePermissions={rolePermissions}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">Programmes</h1>
                    <p className="text-sm text-gray-500">Consultez, modifiez, imprimez ou partagez les plannings.</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Total"
                    value={programs.length}
                    color="bg-blue-50"
                    icon={<DocumentTextIcon className="h-4 w-4 text-blue-500" />}
                />
                <KpiCard
                    label="Publiés"
                    value={totalPublished}
                    color="bg-emerald-50"
                    icon={<CheckCircleIcon className="h-4 w-4 text-emerald-500" />}
                />
                <KpiCard
                    label="Brouillons"
                    value={totalDraft}
                    color="bg-amber-50"
                    icon={
                        <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                    }
                />
                <KpiCard
                    label="Affectations"
                    value={totalAssignments}
                    color="bg-violet-50"
                    icon={
                        <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Table */}
            {programs.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                    <DocumentTextIcon className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Aucun programme généré pour le moment.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    {/* Scroll wrapper horizontal */}
                    <div className="overflow-x-auto">
                    {/* Table header — sticky */}
                    <div className={`grid ${COL_TEMPLATE} gap-0 border-b border-[#C0A882] bg-[#D6C4A8] sticky top-0 z-10 min-w-[660px]`}>
                        {['Programme', 'Semaines', 'Statut', 'Affectations', 'Actions'].map((h, i) => (
                            <div
                                key={h}
                                className={`px-5 py-3 text-[11px] font-semibold text-[#f5ede3] uppercase tracking-widest ${i > 0 ? 'text-center' : ''}`}
                            >
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* Rows — scroll vertical */}
                    <div className="divide-y divide-gray-50 overflow-y-auto max-h-[60vh] min-w-[660px]">
                        {sortedPrograms.map((program, idx) => {
                            const weeks = countWeeks(program.weekRange.start, program.weekRange.end);
                            const assignCount = program.assignments?.length ?? 0;
                            return (
                                <motion.div
                                    key={program.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className={`grid ${COL_TEMPLATE} gap-0 items-center transition-colors duration-150 group hover:bg-[#f5ede3]/60 ${idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/70'}`}
                                >
                                    {/* Programme */}
                                    <div className="px-5 py-4 min-w-0">
                                        <button
                                            onClick={() => openProgramDetails(program.id)}
                                            className="text-left group-hover:text-blue-600 transition-colors"
                                        >
                                            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{program.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Créé le {formatDateShort(program.createdAt)}</p>
                                        </button>
                                    </div>

                                    {/* Semaines */}
                                    <div className="px-5 py-4 text-center">
                                        <span className="text-sm font-semibold text-gray-700">{weeks}</span>
                                        <p className="text-[10px] text-gray-400">{weeks > 1 ? 'semaines' : 'semaine'}</p>
                                    </div>

                                    {/* Statut */}
                                    <div className="px-5 py-4 text-center">
                                        {program.status === 'draft' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                                                Brouillon
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                                Publié
                                            </span>
                                        )}
                                    </div>

                                    {/* Affectations */}
                                    <div className="px-5 py-4 text-center">
                                        <span className="text-sm font-semibold text-gray-700">{assignCount}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="px-5 py-4 flex items-center justify-end gap-1.5">
                                        {role === Role.ADMIN && program.status === 'draft' && (
                                            <button
                                                onClick={() => handlePublish(program.id)}
                                                title="Publier"
                                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                            >
                                                <CheckCircleIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openProgramDetails(program.id)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                                        >
                                            Détails
                                        </button>
                                        {role === Role.ADMIN && (
                                            <button
                                                onClick={() => setDeleteTarget(program)}
                                                title="Supprimer"
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    </div>{/* end scroll wrapper */}

                    {/* Footer */}
                    <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
                        <p className="text-xs text-gray-400">{programs.length} programme{programs.length > 1 ? 's' : ''} · {totalAssignments} affectations au total</p>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <ConfirmModal
                    title="Supprimer le programme"
                    description={`Supprimer définitivement "${deleteTarget.title}" ?`}
                    confirmLabel="Supprimer"
                    confirmClassName="bg-red-600 hover:bg-red-700"
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={() => { handleDelete(deleteTarget.id); setDeleteTarget(null); }}
                />
            )}
        </motion.div>
    );
};
