'use client';

import { useState } from 'react';
import { AdminRole, AdminPermission, AuditLog } from '@/types/admin';

interface SecurityManagementTabProps {
  roles: AdminRole[];
  permissions: AdminPermission[];
  auditLogs: AuditLog[];
  activeSessions: any[];
  onRoleAction: (action: string, params?: any) => Promise<void>;
  onPermissionAction: (action: string, params?: any) => Promise<void>;
  onSessionAction: (sessionId: string, action: string) => Promise<void>;
  darkMode: boolean;
}

export default function SecurityManagementTab({
  roles,
  permissions,
  auditLogs,
  activeSessions,
  onRoleAction,
  onPermissionAction,
  onSessionAction,
  darkMode
}: SecurityManagementTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    level: 1
  });

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) return;
    
    await onRoleAction('create', newRole);
    setNewRole({ name: '', description: '', permissions: [], level: 1 });
    setShowCreateRoleModal(false);
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    
    await onRoleAction('update', { id: selectedRole.id, ...newRole });
    setShowEditRoleModal(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      await onRoleAction('delete', { id: roleId });
    }
  };

  const subTabs = [
    { id: 'roles', label: 'Roles & Permissions', icon: '👥' },
    { id: 'audit', label: 'Audit Logs', icon: '📋' },
    { id: 'sessions', label: 'Active Sessions', icon: '🔐' },
    { id: 'settings', label: 'Security Settings', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-wrap gap-2">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Roles & Permissions */}
      {activeSubTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles List */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Roles</h3>
              <button
                onClick={() => setShowCreateRoleModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                + Add Role
              </button>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {roles.map((role) => (
                <div key={role.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {role.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          role.level === 10 ? 'bg-red-100 text-red-800' :
                          role.level >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Level {role.level}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {role.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{role.permissions.length} permissions</span>
                        <span>•</span>
                        <span>{role.adminCount || 0} admins</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRole(role);
                          setNewRole({
                            name: role.name,
                            description: role.description,
                            permissions: role.permissions,
                            level: role.level
                          });
                          setShowEditRoleModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      {role.name !== 'Super Admin' && (
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions List */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Available Permissions</h3>
            </div>
            
            <div className="p-4 space-y-4">
              {Object.entries(
                permissions.reduce((acc, perm) => {
                  const category = perm.category || 'General';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(perm);
                  return acc;
                }, {} as Record<string, AdminPermission[]>)
              ).map(([category, perms]) => (
                <div key={category}>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {category}
                  </h4>
                  <div className="space-y-2 ml-4">
                    {perms.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between">
                        <div>
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {permission.name}
                          </span>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {permission.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          permission.level === 10 ? 'bg-red-100 text-red-800' :
                          permission.level >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          L{permission.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Audit Logs</h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        log.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {log.severity}
                      </span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {JSON.stringify(log.details)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>👤 {log.adminEmail}</span>
                      <span>🌐 {log.ipAddress}</span>
                      <span>🕒 {new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Sessions */}
      {activeSubTab === 'sessions' && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Active Admin Sessions</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Admin</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>IP Address</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Activity</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeSessions.map((session) => (
                  <tr key={session.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {session.adminEmail}
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {session.ipAddress}
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(session.lastActivity).toLocaleString()}
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {session.role}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onSessionAction(session.id, 'revoke')}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create New Role
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  rows={3}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Access Level (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newRole.level}
                  onChange={(e) => setNewRole(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  className={`w-full px-3 py-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateRole}
                disabled={!newRole.name.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Create Role
              </button>
              <button
                onClick={() => {
                  setShowCreateRoleModal(false);
                  setNewRole({ name: '', description: '', permissions: [], level: 1 });
                }}
                className={`px-4 py-2 rounded ${
                  darkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
