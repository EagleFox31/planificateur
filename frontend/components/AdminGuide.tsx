import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { ChevronRightIcon, MagicWandIcon, UsersIcon, ListBulletIcon, CalendarDaysIcon, KeyIcon, ClipboardDocumentListIcon, ChartBarIcon } from './ui/Icons';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

interface Step {
  Icon: IconComponent;
  title: string;
  tagline: string;
  tip: string;
  details: string[];
  cta: string;
  route: string;
  badgeClass: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  secondary?: { label: string; route: string };
}

const STEPS: Step[] = [
  {
    Icon: UsersIcon,
    title: 'Participants',
    tagline: 'Les personnes qui seront assignées',
    tip: 'Commencez toujours ici — sans participants, rien ne peut être généré.',
    details: [
      'Ajoutez chaque frère ou sœur avec son rôle spirituel et ses capacités.',
      'Importez rapidement depuis Excel si vous avez déjà une liste.',
      'Mettez les profils à jour dès qu\'un rôle ou une capacité change.',
    ],
    cta: 'Gérer les participants',
    route: '/participants',
    badgeClass: 'bg-indigo-600',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-100',
  },
  {
    Icon: ListBulletIcon,
    title: 'Sujets',
    tagline: 'Ce qui doit être planifié chaque semaine',
    tip: 'Définissez chaque type d\'assignation : qui peut le tenir et combien de personnes.',
    details: [
      'Créez ou modifiez les types d\'assignation (Prière, Présidence, Discours…).',
      'Précisez pour chaque sujet : rôle requis, genre, capacités et si c\'est un binôme.',
      'Archivez les sujets temporairement inutilisés sans les supprimer.',
    ],
    cta: 'Configurer les sujets',
    route: '/subjects',
    badgeClass: 'bg-purple-600',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-100',
  },
  {
    Icon: CalendarDaysIcon,
    title: 'Indisponibilités',
    tagline: 'Les absences connues avant la génération',
    tip: 'Déclarez les absences avant de générer — évitez les mauvaises surprises.',
    details: [
      'Indiquez les semaines où un participant ne peut pas être là.',
      'L\'algorithme ignorera automatiquement ces personnes sur ces semaines.',
      'Mettez à jour dès qu\'une absence est confirmée.',
    ],
    cta: 'Voir les indisponibilités',
    route: '/unavailabilities',
    badgeClass: 'bg-orange-500',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-100',
  },
  {
    Icon: KeyIcon,
    title: 'Rôles & Règles',
    tagline: 'Qui peut faire quoi, et à quelle fréquence',
    tip: 'À configurer une bonne fois au démarrage — rarement besoin d\'y revenir.',
    details: [
      'Définissez les capacités associées à chaque rôle spirituel.',
      'Réglez les délais de rotation : combien de semaines entre deux assignations identiques.',
      'Ajustez selon les décisions des anciens.',
    ],
    cta: 'Gérer les rôles',
    route: '/roles',
    badgeClass: 'bg-red-600',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-100',
    secondary: { label: 'Règles de rotation', route: '/rotation-rules' },
  },
  {
    Icon: ClipboardDocumentListIcon,
    title: 'Programmes',
    tagline: 'Générez et ajustez le planning complet',
    tip: 'Une fois les 4 étapes précédentes faites, la génération prend quelques secondes.',
    details: [
      'Choisissez la plage de semaines et lancez la génération automatique.',
      'Ajustez manuellement si une affectation ne vous convient pas.',
      'Exportez ou imprimez pour partager avec la congrégation.',
    ],
    cta: 'Aller aux programmes',
    route: '/programs',
    badgeClass: 'bg-emerald-600',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-100',
  },
  {
    Icon: ChartBarIcon,
    title: 'Statistiques',
    tagline: 'Vérifiez l\'équilibre des affectations',
    tip: 'Pratique après plusieurs semaines générées pour équilibrer la charge.',
    details: [
      'Consultez le nombre d\'assignations par personne et par sujet.',
      'Identifiez les participants sous- ou sur-sollicités.',
      'Utile pour préparer une réunion du corps des anciens.',
    ],
    cta: 'Voir les statistiques',
    route: '/statistics',
    badgeClass: 'bg-cyan-600',
    bgClass: 'bg-cyan-50',
    textClass: 'text-cyan-700',
    borderClass: 'border-cyan-100',
  },
];

export const AdminGuide: React.FC = () => {
  const navigate = useNavigate();
  const [openStep, setOpenStep] = useState<number | null>(0);

  const toggle = (i: number) => setOpenStep((prev: number | null) => (prev === i ? null : i));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Par où commencer ?</h1>
        <p className="text-sm text-gray-500 mt-1">
          Suivez ces 6 étapes dans l'ordre et votre programme sera prêt en quelques minutes.
        </p>
      </motion.div>

      {/* Quick-nav pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-wrap gap-2"
      >
        {STEPS.map((step, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              openStep === i
                ? `${step.badgeClass} text-white border-transparent shadow-sm scale-105`
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            <step.Icon className="h-3.5 w-3.5" />
            {step.title}
          </button>
        ))}
      </motion.div>

      {/* Accordion steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="space-y-2"
      >
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`rounded-2xl overflow-hidden border shadow-sm transition-shadow ${
              openStep === i ? `${step.borderClass} shadow-md` : 'border-gray-100'
            }`}
          >
            {/* Row header */}
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`w-9 h-9 rounded-xl ${step.badgeClass} flex items-center justify-center flex-shrink-0`}>
                <step.Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-400 w-4 text-center flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{step.tagline}</p>
              </div>
              <ChevronRightIcon
                className="h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200"
                style={{ transform: openStep === i ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>

            {/* Expandable body */}
            <AnimatePresence initial={false}>
              {openStep === i && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className={`${step.bgClass} px-5 py-4 border-t ${step.borderClass}`}>
                    {/* Tip callout */}
                    <div className="flex items-start gap-2 bg-white/80 rounded-xl px-3 py-2.5 mb-3 border border-white">
                      <span className="text-sm leading-none mt-0.5 flex-shrink-0">💡</span>
                      <p className={`text-xs font-medium ${step.textClass}`}>{step.tip}</p>
                    </div>

                    {/* Detail bullets */}
                    <ul className="space-y-1.5 mb-4">
                      {step.details.map((d, di) => (
                        <li key={di} className="flex items-start gap-2 text-xs text-gray-700">
                          <span className="text-gray-400 mt-0.5 flex-shrink-0">›</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => navigate(step.route)}>
                        {step.cta}
                      </Button>
                      {step.secondary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(step.secondary!.route)}
                        >
                          {step.secondary.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {/* Bottom CTA banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-100"
      >
        <div>
          <p className="font-bold text-gray-900 text-sm">Tout est configuré ?</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Lancez la génération — votre programme sera prêt en quelques secondes.
          </p>
        </div>
        <Button onClick={() => navigate('/programs')} className="flex-shrink-0">
          <MagicWandIcon className="h-4 w-4 mr-1.5" />
          Générer un programme
        </Button>
      </motion.div>
    </div>
  );
};
