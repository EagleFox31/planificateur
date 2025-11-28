import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Participant, SubjectType } from '../types';
import { Card } from './ui/Card';
import { UserCircleIcon, BookOpenIcon, ClockIcon } from './ui/Icons';
import { THEME_CLASSES } from '../styles/theme';

interface ParticipantHistoryProps {
  participants: Participant[];
  subjectTypes: SubjectType[];
}

export const ParticipantHistory: React.FC<ParticipantHistoryProps> = ({ participants, subjectTypes }) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);

  const selectedParticipant = useMemo(() => {
    return participants.find(p => p.id === selectedParticipantId);
  }, [selectedParticipantId, participants]);

  const sortedHistory = useMemo(() => {
    if (!selectedParticipant) return [];
    // Sort descending by week string
    return [...selectedParticipant.assignmentHistory].sort((a, b) => b.week.localeCompare(a.week));
  }, [selectedParticipant]);
  
  const getSubject = (subjectTypeId: number) => {
      return subjectTypes.find(st => st.id === subjectTypeId);
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
    >
        <Card className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-100">
            <div className="flex items-start sm:items-center gap-6 p-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                    className="bg-white p-4 rounded-xl shadow-sm"
                >
                    <ClockIcon className="h-8 w-8 text-green-600" />
                </motion.div>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <h3 className="text-3xl font-bold text-gray-900">Historique des Participants</h3>
                    <p className="text-lg text-gray-700 max-w-3xl mt-2">
                        Consultez l'historique complet des attributions pour chaque participant.
                    </p>
                </motion.div>
            </div>
        </Card>
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
        >
            <Card className="bg-white border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl">
                    <label htmlFor="participant-select" className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un participant</label>
                    <select
                        id="participant-select"
                        value={selectedParticipantId ?? ''}
                        onChange={(e) => setSelectedParticipantId(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                    >
                        <option value="" disabled>-- Choisir un participant --</option>
                        {participants.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                {selectedParticipant ? (
                    sortedHistory.length > 0 ? (
                        <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                           {sortedHistory.map((item, index) => {
                               const subject = getSubject(item.subjectTypeId);
                               return (
                                   <motion.li
                                       key={`${item.week}-${item.subjectTypeId}-${index}`}
                                       initial={{ opacity: 0, x: -10 }}
                                       animate={{ opacity: 1, x: 0 }}
                                       transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                                       className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                   >
                                       <div>
                                           <p className="font-semibold text-gray-900">{subject?.label || 'Sujet inconnu'}</p>
                                           <p className="text-sm text-gray-600">{subject?.mainTopic}</p>
                                       </div>
                                       <div className="text-right">
                                         <p className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{item.week}</p>
                                       </div>
                                   </motion.li>
                               )
                           })}
                        </ul>
                    ) : (
                         <div className="p-12 text-center">
                            <BookOpenIcon className="mx-auto h-16 w-16 text-gray-300" />
                            <p className="mt-4 text-gray-500 text-lg">Aucun historique d'attribution pour {selectedParticipant.name}.</p>
                        </div>
                    )
                ) : (
                     <div className="p-12 text-center">
                        <UserCircleIcon className="mx-auto h-16 w-16 text-gray-300" />
                        <p className="mt-4 text-gray-500 text-lg">Veuillez sélectionner un participant pour voir son historique.</p>
                    </div>
                )}
            </Card>
        </motion.div>
    </motion.div>
  );
};