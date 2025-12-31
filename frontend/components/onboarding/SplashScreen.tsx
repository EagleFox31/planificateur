import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-slate-blue-900 to-white">
      {/* Animated Background - Divine Light Particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Floating Light Particles - White particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/70 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-40, -140, -40],
              x: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 2, 0.8],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Larger Divine Light Orbs - Subtle on white */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-sanctus-blue/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-divine-gold/5 rounded-full blur-2xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.1, 0.05, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Animated Biblical Quote - centered */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 transform z-10 text-center max-w-2xl px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.5 }}
        >
        <motion.p
          className="text-white text-lg md:text-xl font-light italic mb-2"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          "La parole de Dieu est vivante et efficace,
          <br className="hidden sm:block" />plus tranchante qu'une épée à deux tranchants"
        </motion.p>
        <motion.p
          className="text-white/80 text-sm"
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          Hébreux 4:12
        </motion.p>
        </motion.div>
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
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 pt-24 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <div className="relative w-full">
            {/* Main Badge Container */}
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-blue-200 overflow-hidden">
              {/* Header */}
              <div className="bg-sanctus-blue px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sanctus-blue" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">jw.org</h3>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-slate-blue-50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-sanctus-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>

                <h4 className="text-slate-blue-900 font-semibold text-lg sm:text-xl mb-2">
                  Réunions Théocratiques
                </h4>

                <p className="text-slate-blue-600 text-xs sm:text-sm leading-relaxed">
                  Organisez et planifiez intelligemment les réunions de votre assemblée
                </p>

                {/* Decorative Elements */}
                <div className="mt-4 sm:mt-6 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-sanctus-blue rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-divine-gold rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-sanctus-blue rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>

            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-12 h-12 bg-divine-gold rounded-full flex items-center justify-center shadow-lg"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 w-10 h-10 bg-sanctus-blue rounded-full flex items-center justify-center shadow-lg"
              animate={{
                y: [0, -10, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.div>
          </div>

          {/* CTA Button with Material Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.0,
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="mt-10 flex justify-center"
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
      </div>
    </div>
  );
};
