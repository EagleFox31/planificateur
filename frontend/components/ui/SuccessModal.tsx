import React from 'react';
import { Modal } from './Modal';
import { CheckCircleIcon } from './Icons';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal title={title} onClose={onClose} position="top">
      <div className="text-center py-6">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <p className="text-slate-blue-200 text-lg">{message}</p>
        <button
          onClick={onClose}
          className="mt-6 bg-sanctus-blue hover:bg-sanctus-blue/80 text-white px-6 py-2 rounded-md transition-colors"
        >
          Fermer
        </button>
      </div>
    </Modal>
  );
};
