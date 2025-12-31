import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmClassName = '',
  onConfirm,
  onCancel,
}) => (
  <Modal title={title} onClose={onCancel}>
    <div className="space-y-4">
      <p className="text-sm text-gray-700">{description}</p>
      <div className="flex justify-end space-x-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} className={confirmClassName}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);
