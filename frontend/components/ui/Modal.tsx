
import React from 'react';
import { XMarkIcon } from './Icons';
import { THEME_CLASSES } from '../../styles/theme';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'center' | 'top';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, position = 'center', size = 'md' }) => {
  const verticalAlignment = position === 'top' ? 'items-start pt-12' : 'items-center';

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex justify-center ${verticalAlignment} p-4 animate-fade-in`}>
      <div className={`bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} border border-gray-200 animate-scale-in`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-indigo-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-indigo-100">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
