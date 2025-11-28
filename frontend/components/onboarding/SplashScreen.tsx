import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { THEME_CLASSES } from '../../styles/theme';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black bg-[url('/images/splash-bg.jpg')] bg-cover bg-center">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/splash-bg.jpg"
          aria-hidden="true"
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-slate-blue-950/25 to-black/35" />
      </div>

      {/* Background Pattern - Subtle animated elements */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-sanctus-blue rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.1, 0.15]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-divine-gold rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94] // Material emphasized easing
            }}
            className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0"
          >
            {/* Logo/Icon with elevation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1] // Material emphasized deceleration
              }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto lg:mx-0 bg-sanctus-blue rounded-2xl flex items-center justify-center shadow-2xl shadow-sanctus-blue/30">
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* JW Meeting Icon - Simple cross/book design */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </motion.svg>
              </div>
            </motion.div>

            {/* Typography Hierarchy - Material Design 3 */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4,
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className={`${THEME_CLASSES.typography.display.large} text-white mb-2`}
            >
              Planificateur
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6,
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className={`${THEME_CLASSES.typography.headline.medium} text-slate-blue-200 mb-6`}
            >
              Réunions Théocratiques
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className={`${THEME_CLASSES.typography.body.large} text-slate-blue-300 mb-12 max-w-xl mx-auto lg:mx-0`}
            >
              Organisez et planifiez intelligemment les réunions de votre assemblée avec une précision divine.
            </motion.p>

            {/* Loading Indicator - Material Design style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="flex justify-center lg:justify-start mb-8"
            >
              <div className="flex space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0,
                    ease: "easeInOut"
                  }}
                  className="w-3 h-3 bg-sanctus-blue rounded-full shadow-lg"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-3 h-3 bg-divine-gold rounded-full shadow-lg"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.4,
                    ease: "easeInOut"
                  }}
                  className="w-3 h-3 bg-sanctus-blue rounded-full shadow-lg"
                />
              </div>
            </motion.div>

            {/* CTA Button with Material Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.2,
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1]
              }}
            >
              <Button
                onClick={onStart}
                size="lg"
                className="px-8 py-4 text-lg font-medium bg-sanctus-blue hover:bg-sanctus-blue/90 text-white rounded-full shadow-xl shadow-sanctus-blue/30 hover:shadow-2xl hover:shadow-sanctus-blue/40 transition-all duration-300 hover:scale-105"
              >
                Accéder à votre espace
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
            className="hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-slate-blue-800">
              <img
                src="/images/onboarding-1.jpg"
                alt="Illustration d'organisation de réunion"
                className="w-full h-[420px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
