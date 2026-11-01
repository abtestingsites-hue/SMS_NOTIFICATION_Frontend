import React from 'react';
import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  cancel?: {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  id?: string | number;
}

/**
 * Enterprise Centralized Toast Service (Phase 15 Addendum)
 * Standardizes messaging across all 11 modules with consistent colors, icons, and dismissal timings.
 */
export const toast = {
  success(title: string, options?: ToastOptions) {
    return sonnerToast.success(title, {
      description: options?.description,
      duration: options?.duration ?? 3500,
      action: options?.action,
      cancel: options?.cancel,
      id: options?.id,
    });
  },

  error(title: string, options?: ToastOptions) {
    return sonnerToast.error(title, {
      description: options?.description,
      duration: options?.duration ?? 7000,
      action: options?.action,
      cancel: options?.cancel,
      id: options?.id,
    });
  },

  warning(title: string, options?: ToastOptions) {
    return sonnerToast.warning(title, {
      description: options?.description,
      duration: options?.duration ?? 5000,
      action: options?.action,
      cancel: options?.cancel,
      id: options?.id,
    });
  },

  info(title: string, options?: ToastOptions) {
    return sonnerToast.info(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
      cancel: options?.cancel,
      id: options?.id,
    });
  },

  loading(title: string, options?: Omit<ToastOptions, 'duration'>) {
    return sonnerToast.loading(title, {
      description: options?.description,
      id: options?.id,
    });
  },

  dismiss(toastId?: string | number) {
    sonnerToast.dismiss(toastId);
  },

  promise<T>(
    promise: Promise<T>,
    data: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) {
    return sonnerToast.promise(promise, data);
  }
};
