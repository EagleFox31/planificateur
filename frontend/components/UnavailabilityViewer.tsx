import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Participant } from '../types';
import { Card } from './ui/Card';
import { UserCircleIcon, ClipboardDocumentListIcon } from './ui/Icons';
import { THEME_CLASSES } from '../styles/theme';

interface UnavailabilityViewerProps {
  participants: Participant[];
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

export const UnavailabilityViewer: React.FC<UnavailabilityViewerProps> = ({ participants }) => {
    const unavailabilitiesByWeek = useMemo(() => getUnavailabilitiesByWeek(participants), [participants]);

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

            {unavailabilitiesByWeek.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <Card className="p-12 text-center bg-white border border-gray-200 shadow-sm">
                        <p className="text-gray-500 text-lg">Aucune indisponibilité enregistrée pour le moment.</p>
                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="space-y-6"
                >
                    {unavailabilitiesByWeek.map(([week, unavailableParticipants], index) => (
                        <motion.div
                            key={week}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        >
                            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                               <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-xl border-b border-gray-100">
                                 <h4 className="font-bold text-xl text-gray-900">Semaine : {week}</h4>
                                 <p className="text-sm text-gray-600 mt-1">{unavailableParticipants.length} participant{unavailableParticipants.length > 1 ? 's' : ''} indisponible{unavailableParticipants.length > 1 ? 's' : ''}</p>
                               </div>
                               <ul className="divide-y divide-gray-100">
                                    {unavailableParticipants.map((p, subIndex) => (
                                        <motion.li
                                            key={p.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + index * 0.1 + subIndex * 0.05, duration: 0.3 }}
                                            className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <UserCircleIcon className="h-6 w-6 mr-4 text-orange-500" />
                                            <span className="text-gray-900 font-medium">{p.name}</span>
                                        </motion.li>
                                    ))}
                               </ul>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
};
