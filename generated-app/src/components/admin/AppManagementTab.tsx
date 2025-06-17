'use client';

import { useState } from 'react';
import { AppManagement } from '@/types/admin';

interface AppManagementTabProps {
  apps: AppManagement[];
  onAppAction: (appId: string, action: string, params?: any) => Promise<void>;
  darkMode: boolean;
}

export default function AppManagementTab({ apps, onAppAction, darkMode }: AppManagementTabProps) {
  const [selectedApp, setSelectedApp] = useState<AppManagement | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAppAction = async (appId: string, action: string, params?: any) => {
    setActionLoading(`${appId}-${action}`);
    try {
      await onAppAction(appId, action, params);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-500 bg-green-100 dark:bg-green-900';
      case 'building': return 'text-blue-500 bg-blue-100 dark:bg-blue-900';
      case 'failed': return 'text-red-500 bg-red-100 dark:bg-red-900';
      case 'pending': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Apps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div
            key={app.id}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:shadow-lg transition-shadow cursor-pointer`}
            onClick={() => setSelectedApp(app)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {app.name}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {app.framework} • {app.complexity}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                {app.status}
              </span>
            </div>

            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              {app.description}
            </p>

            {/* Progress Bar */}
            {app.buildProgress !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Build Progress</span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{app.buildProgress}%</span>
                </div>
                <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${app.buildProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              {app.status === 'deployed' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAppAction(app.id, 'restart_app');
                    }}
                    disabled={actionLoading === `${app.id}-restart_app`}
                    className="flex-1 px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {actionLoading === `${app.id}-restart_app` ? 'Restarting...' : 'Restart'}
                  </button>
                  {app.deployment?.url && (
                    <a
                      href={app.deployment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-3 py-2 text-xs text-center bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      View Live
                    </a>
                  )}
                </>
              )}
              {app.status === 'failed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAppAction(app.id, 'deploy_app');
                  }}
                  disabled={actionLoading === `${app.id}-deploy_app`}
                  className="flex-1 px-3 py-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  {actionLoading === `${app.id}-deploy_app` ? 'Rebuilding...' : 'Rebuild'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* App Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedApp.name}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Order: {selectedApp.orderId} • Customer: {selectedApp.customerId}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className={`text-gray-500 hover:text-gray-700 dark:hover:text-gray-300`}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* App Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Application Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Framework:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedApp.framework}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Complexity:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedApp.complexity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedApp.status)}`}>
                        {selectedApp.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Performance
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Response Time:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                        {selectedApp.monitoring?.responseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Uptime:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                        {selectedApp.monitoring?.uptime.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Error Rate:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                        {selectedApp.monitoring?.errorRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Security
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Vulnerabilities:</span>
                      <span className={`${selectedApp.security?.vulnerabilities?.length ? 'text-red-500' : 'text-green-500'}`}>
                        {selectedApp.security?.vulnerabilities?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Last Scan:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                        {new Date(selectedApp.security?.lastSecurityScan || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleAppAction(selectedApp.id, 'restart_app')}
                  disabled={actionLoading === `${selectedApp.id}-restart_app`}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {actionLoading === `${selectedApp.id}-restart_app` ? 'Restarting...' : 'Restart App'}
                </button>
                
                <button
                  onClick={() => handleAppAction(selectedApp.id, 'create_backup')}
                  disabled={actionLoading === `${selectedApp.id}-create_backup`}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {actionLoading === `${selectedApp.id}-create_backup` ? 'Creating...' : 'Create Backup'}
                </button>
                
                <button
                  onClick={() => handleAppAction(selectedApp.id, 'run_security_scan')}
                  disabled={actionLoading === `${selectedApp.id}-run_security_scan`}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                >
                  {actionLoading === `${selectedApp.id}-run_security_scan` ? 'Scanning...' : 'Security Scan'}
                </button>
                
                <button
                  onClick={() => handleAppAction(selectedApp.id, 'scale_app', { instances: 2 })}
                  disabled={actionLoading === `${selectedApp.id}-scale_app`}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  {actionLoading === `${selectedApp.id}-scale_app` ? 'Scaling...' : 'Scale App'}
                </button>
              </div>

              {/* Build Logs */}
              {selectedApp.buildLogs && selectedApp.buildLogs.length > 0 && (
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                    Build Logs
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedApp.buildLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-sm`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {log.step}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {log.message}
                        </p>
                        {log.duration && (
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            Duration: {log.duration}s
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
