
import React from 'react';
import { THEME_CLASSES } from '../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`${THEME_CLASSES.card} ${className}`}>
      {children}
    </div>
  );
};
