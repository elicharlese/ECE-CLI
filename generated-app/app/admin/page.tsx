'use client';

import { useEffect } from 'react';

export default function AdminRedirect() {
  useEffect(() => {
    // Client-side redirect to the new admin-super dashboard
    window.location.href = '/admin-super';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to admin dashboard...</p>
      </div>
    </div>
  );
}