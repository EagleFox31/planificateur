import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { BookOpenIcon } from './ui/Icons';

export const AdminGuide: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Participants',
      description: 'Ici vous créez ou importez les frères/soeurs avec leur rôle spirituel et leurs capacités.',
      details: [
        'A quoi ça sert : la génération du programme ne peut fonctionner sans les personnes et leurs rôles.',
        'Quand l’utiliser : avant toute génération ou lorsqu’un profil change (nouveau rôle, capacité, note).',
        'Actions rapides : ajouter, modifier, supprimer ou importer via Excel.',
      ],
      action: () => navigate('/participants'),
      cta: 'Gérer les participants',
    },
    {
      title: 'Sujets',
      description: 'Configurez les sujets (types d’assignations), leurs exigences et le nombre de participants.',
      details: [
        'A quoi ça sert : dire à l’outil quels sujets doivent être planifiés et qui peut les tenir.',
        'Quand l’utiliser : au démarrage, quand un sujet change ou pour archiver un sujet non utilisé.',
        'Actions rapides : créer/éditer un sujet, définir les rôles/genres/capacités requis, activer le binôme.',
      ],
      action: () => navigate('/subjects'),
      cta: 'Configurer les sujets',
    },
    {
      title: 'Indisponibilités',
      description: 'Déclarez les semaines où un participant ne peut pas être assigné.',
      details: [
        'A quoi ça sert : éviter que l’algorithme désigne quelqu’un indisponible.',
        'Quand l’utiliser : avant chaque génération ou dès qu’une absence est connue.',
        'Actions rapides : ajouter/retirer une semaine d’indisponibilité pour un participant.',
      ],
      action: () => navigate('/unavailabilities'),
      cta: 'Voir les indisponibilités',
    },
    {
      title: 'Règles et rôles',
      description: 'Définissez les permissions par rôle et les règles de rotation.',
      details: [
        'A quoi ça sert : contrôler qui peut présider, prier, lire, etc., et espacer les affectations.',
        'Quand l’utiliser : lors de la mise en place initiale ou si les anciens ajustent les règles.',
        'Actions rapides : configurer les capacités par rôle, régler les délais/rotations entre deux mêmes sujets.',
      ],
      action: () => navigate('/roles'),
      cta: 'Gestion des rôles',
      secondary: { label: 'Règles de rotation', action: () => navigate('/rotation-rules') },
    },
    {
      title: 'Programmes',
      description: 'Générez automatiquement, puis ajustez manuellement les affectations par semaine.',
      details: [
        'A quoi ça sert : produire le planning complet des semaines avec les bonnes personnes.',
        'Quand l’utiliser : après avoir renseigné participants, sujets et indisponibilités.',
        'Actions rapides : générer plusieurs semaines, éditer une affectation, imprimer ou partager.',
      ],
      action: () => navigate('/programs'),
      cta: 'Aller aux programmes',
    },
    {
      title: 'Statistiques',
      description: 'Suivez l’équilibre des affectations et l’activité des participants.',
      details: [
        'A quoi ça sert : vérifier que les assignations sont réparties équitablement.',
        'Quand l’utiliser : après plusieurs semaines générées ou pour préparer une réunion d’anciens.',
        'Actions rapides : consulter les compteurs par personne et par sujet.',
      ],
      action: () => navigate('/statistics'),
      cta: 'Voir les statistiques',
    },
  ];

  const cardColors = [
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-purple-500 to-pink-600',
    'bg-gradient-to-br from-green-500 to-teal-600',
    'bg-gradient-to-br from-orange-500 to-red-600',
    'bg-gradient-to-br from-cyan-500 to-blue-600',
    'bg-gradient-to-br from-rose-500 to-pink-600',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
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
              <BookOpenIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Guide Admin</h1>
              <p className="text-lg text-gray-700 max-w-3xl mt-2">
                Liens directs pour vos actions CRUD, la génération et le suivi.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button onClick={() => navigate(-1)} variant="secondary" className="bg-white hover:bg-gray-50 text-white border-gray-300">
              Retour
            </Button>
          </motion.div>
        </div>
      </Card>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.3
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  duration: 0.6
                }
              }
            }}
            whileHover={{
              y: -8,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="h-full"
          >
            <Card className="h-full overflow-hidden relative">
              <div className={`p-6 ${cardColors[index % cardColors.length]} text-white relative overflow-hidden`}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                >
                  <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 animate-pulse" />
                </motion.div>
              </div>
              <div className="p-6 space-y-4 bg-white flex-grow">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {section.description}
                </motion.p>
                {section.details && (
                  <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                    className="list-disc list-inside text-gray-600 text-sm space-y-2"
                  >
                    {section.details.map((line, subIndex) => (
                      <motion.li
                        key={line}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 + subIndex * 0.05, duration: 0.3 }}
                      >
                        {line}
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                  className="flex flex-wrap gap-3 pt-2"
                >
                  <Button size="sm" onClick={section.action} className="flex-1 min-w-0">
                    {section.cta}
                  </Button>
                  {section.secondary && (
                    <Button size="sm" variant="secondary" onClick={section.secondary.action} className="flex-1 min-w-0">
                      {section.secondary.label}
                    </Button>
                  )}
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
