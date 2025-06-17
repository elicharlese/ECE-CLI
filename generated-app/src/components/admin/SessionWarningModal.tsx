'use client';

import { useState } from 'react';

interface SessionWarningModalProps {
  isOpen: boolean;
  onExtend: () => void;
  onLogout: () => void;
  onDismiss: () => void;
  minutesRemaining: number;
}

export default function SessionWarningModal({
  isOpen,
  onExtend,
  onLogout,
  onDismiss,
  minutesRemaining
}: SessionWarningModalProps) {
  const [countdown, setCountdown] = useState(minutesRemaining);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏰</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Session Expiring Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your session will expire in {countdown} minute{countdown !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onExtend}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Extend Session
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Dismiss
            </button>
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout Now
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You will be automatically logged out when the session expires
          </p>
        </div>
      </div>
    </div>
  );
}
