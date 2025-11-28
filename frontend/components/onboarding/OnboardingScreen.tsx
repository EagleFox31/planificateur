import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { ArrowLeftIcon, ArrowRightIcon } from '../ui/Icons';
import { THEME_CLASSES } from '../../styles/theme';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2070&auto=format&fit=crop',
    title: 'Bienvenue',
    text: 'Cette application vous aide à organiser les attributions pour les réunions de semaine de manière simple et équitable.',
    quote: '"Que toutes choses se fassent décemment et avec ordre." - 1 Corinthiens 14:40',
  },
  {
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2232&auto=format&fit=crop',
    title: 'Planification Intelligente',
    text: "Utilisez l'intelligence artificielle pour générer un programme qui respecte les rôles, le genre et l'historique de chaque participant.",
    quote: '"Le projet de l’homme appliqué réussit, mais tous ceux qui agissent avec précipitation vont à la misère." - Proverbes 21:5',
  },
  {
    image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?q=80&w=2070&auto=format&fit=crop',
    title: 'Gestion Centralisée',
    text: 'Gérez facilement la liste des participants, leurs rôles et leurs disponibilités depuis une seule interface.',
    quote: '"Il y a diversité de services, mais il y a le même Seigneur." - 1 Corinthiens 12:5',
  },
  {
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    title: 'Prêt à commencer',
    text: "Vous êtes maintenant prêt à explorer l'application. Que votre service soit une source de joie et d'encouragement.",
    quote: '"Servez Jéhovah avec joie. Entrez en sa présence avec des cris de joie." - Psaume 100:2',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { image, title, text, quote } = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-blue-900 via-slate-blue-950 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, 0],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 left-1/3 w-64 h-64 bg-sanctus-blue rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            scale: [1.05, 1, 1.05],
            rotate: [5, 0, 5],
            opacity: [0.08, 0.05, 0.08]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-divine-gold rounded-full blur-2xl"
        />
      </div>

      {/* Skip Button */}
      <AnimatePresence>
        {!isLastStep && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-6 right-6 z-20"
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={onComplete}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
            >
              Passer
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Image Section */}
        <div className="relative h-2/5 w-full overflow-hidden">
          <motion.div
            key={currentStep}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative h-full"
          >
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-blue-950/80"></div>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between p-6 md:p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2
              }}
              className="flex-1 flex flex-col justify-center text-center max-w-2xl mx-auto"
            >
              {/* Title with Material Typography */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className={`${THEME_CLASSES.typography.headline.large} text-white mb-6`}
              >
                {title}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className={`${THEME_CLASSES.typography.body.large} text-slate-blue-200 mb-8 leading-relaxed`}
              >
                {text}
              </motion.p>

              {/* Quote with special styling */}
              <motion.blockquote
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className={`${THEME_CLASSES.typography.body.medium} text-slate-blue-300 italic border-l-4 border-sanctus-blue pl-6 py-2`}
              >
                « {quote} »
              </motion.blockquote>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-12"
          >
            {/* Progress Indicator - Material Design 3 style */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                {onboardingSteps.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`relative h-3 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-8 bg-sanctus-blue'
                        : 'w-3 bg-slate-blue-600 hover:bg-slate-blue-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {index === currentStep && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-sanctus-blue rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <motion.div
                whileHover={{ scale: currentStep > 0 ? 1.02 : 1 }}
                whileTap={{ scale: currentStep > 0 ? 0.98 : 1 }}
              >
                <Button
                  variant="secondary"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`transition-all duration-300 ${
                    currentStep === 0
                      ? 'opacity-0 pointer-events-none'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30'
                  }`}
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Précédent
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={nextStep}
                  className="bg-sanctus-blue hover:bg-sanctus-blue/90 text-white px-8 py-3 rounded-full shadow-xl shadow-sanctus-blue/30 hover:shadow-2xl hover:shadow-sanctus-blue/40 transition-all duration-300"
                >
                  {isLastStep ? "Commencer l'aventure" : 'Continuer'}
                  {!isLastStep && <ArrowRightIcon className="h-5 w-5 ml-2" />}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
