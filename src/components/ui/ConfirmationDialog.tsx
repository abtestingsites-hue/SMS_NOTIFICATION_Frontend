import React from 'react';
import { ConfirmDialog } from './ConfirmDialog';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = (props) => {
  return <ConfirmDialog {...props} />;
};

export { ConfirmDialog };

