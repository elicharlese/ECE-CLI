'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from 'react';
import { AdminUser, SystemHealth, AuditLog, CustomerProfile, AppManagement, FinancialAnalytics } from '@/types/admin';

// Enhanced Admin Dashboard with Advanced Features
export default function EnhancedAdminDashboard() {
  // Authentication & Session State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: false });
  const [loginError, setLoginError] = useState('');
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  
  // UI State
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  // Dashboard Data
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [_customers, _setCustomers] = useState<CustomerProfile[]>([]);
  const [_apps, _setApps] = useState<AppManagement[]>([]);
  const [analytics, setAnalytics] = useState<FinancialAnalytics | null>(null);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Security Features
  const [activeSessions, setActiveSessions] = useState<{ id: string; email: string; ip: string; ipAddress: string; lastActivity: string }[]>([]);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);

  // Load initial data
  useEffect(() => {
    checkAuthStatus();
    
    // Auto-refresh interval
    const interval = setInterval(() => {
      if (isLoggedIn) {
        refreshDashboardData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isLoggedIn, refreshInterval]);

  // Session timeout warning
  useEffect(() => {
    if (isLoggedIn && admin) {
      const sessionExpiry = new Date(admin.sessionExpiresAt);
      const now = new Date();
      const timeUntilExpiry = sessionExpiry.getTime() - now.getTime();
      
      // Show warning 10 minutes before expiry
      if (timeUntilExpiry <= 10 * 60 * 1000 && timeUntilExpiry > 0) {
        setSessionWarning(true);
      }
    }
  }, [isLoggedIn, admin]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/auth-enhanced');
      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
        setIsLoggedIn(true);
        await refreshDashboardData();
      }
    } catch (error: unknown) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboardData = async () => {
    try {
      await Promise.all([
        fetchSystemHealth(),
        fetchAuditLogs(),
        fetchCustomers(),
        fetchApps(),
        fetchAnalytics(),
        fetchActiveSessions()
      ]);
    } catch (error: unknown) {
      console.error('Dashboard refresh error:', error);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/admin/system?action=get_health');
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data.health);
      }
    } catch (error: unknown) {
      console.error('System health fetch error:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/admin/system?action=get_audit_logs&limit=20');
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs);
      }
    } catch (error: unknown) {
      console.error('Audit logs fetch error:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers-enhanced');
      if (response.ok) {
        const data = await response.json();
        _setCustomers(data.customers);
      }
    } catch (error: unknown) {
      console.error('Customers fetch error:', error);
    }
  };

  const fetchApps = async () => {
    try {
      const response = await fetch('/api/admin/apps');
      if (response.ok) {
        const data = await response.json();
        _setApps(data.apps);
      }
    } catch (error: unknown) {
      console.error('Apps fetch error:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/financial?action=analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error: unknown) {
      console.error('Analytics fetch error:', error);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('/api/admin/system?action=get_active_sessions');
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data.sessions);
      }
    } catch (error: unknown) {
      console.error('Active sessions fetch error:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/admin/auth-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresTwoFactor) {
          setTwoFactorRequired(true);
        } else {
          setAdmin(data.admin);
          setIsLoggedIn(true);
          await refreshDashboardData();
        }
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error: unknown) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth-enhanced', { method: 'DELETE' });
      setIsLoggedIn(false);
      setAdmin(null);
      setCurrentTab('dashboard');
    } catch (error: unknown) {
      console.error('Logout error:', error);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke_session',
          params: { sessionId }
        })
      });

      if (response.ok) {
        await fetchActiveSessions();
      }
    } catch (error: unknown) {
      console.error('Session revoke error:', error);
    }
  };

  const getSystemHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
        <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ECE-CLI Admin</h1>
            <p className="text-white/60">Enhanced Administration Panel</p>
          </div>

          {twoFactorRequired ? (
            <div className="text-center">
              <p className="text-white mb-4">Two-factor authentication required</p>
              <input
                type="text"
                placeholder="Enter 2FA Code"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="admin@ece-cli.com"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={loginForm.rememberMe}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-white/80 text-sm">Remember me for 30 days</label>
              </div>

              {loginError && (
                <div className="text-red-400 text-sm text-center">{loginError}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-violet-600 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex`}>
      {/* Session Warning Modal */}
      {sessionWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold mb-4">Session Expiring Soon</h3>
            <p className="mb-4">Your session will expire in less than 10 minutes. Would you like to extend it?</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSessionWarning(false);
                  checkAuthStatus(); // Refresh session
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg"
              >
                Extend Session
              </button>
              <button
                onClick={() => setSessionWarning(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            {!sidebarCollapsed && (
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>ECE-CLI Admin</h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {sidebarCollapsed ? '→' : '←'}
              </span>
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'orders', label: 'Orders', icon: '📋' },
              { id: 'customers', label: 'Customers', icon: '👥' },
              { id: 'apps', label: 'Applications', icon: '🚀' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'system', label: 'System Health', icon: '⚙️' },
              { id: 'security', label: 'Security', icon: '🔒' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                {!sidebarCollapsed && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
              </h2>
              {systemHealth && (
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${systemHealth.status === 'healthy' ? 'bg-green-400' : systemHealth.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                  <span className={`text-sm ${getSystemHealthColor(systemHealth.status)}`}>
                    {systemHealth.status.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {darkMode ? '☀️' : '🌙'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {admin?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className={`flex-1 overflow-auto p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {systemHealth && (
                  <>
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>System Uptime</h3>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatUptime(systemHealth.uptime)}
                      </p>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Memory Usage</h3>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {systemHealth.memory.percentage.toFixed(1)}%
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatBytes(systemHealth.memory.used)} / {formatBytes(systemHealth.memory.total)}
                      </p>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>CPU Usage</h3>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {systemHealth.cpu.usage.toFixed(1)}%
                      </p>
                    </div>

                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Active Builds</h3>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {systemHealth.builds.active}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {systemHealth.builds.queued} queued
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Revenue Analytics */}
              {analytics && (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Revenue Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
                      <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${analytics.revenue.total.toLocaleString()}
                      </p>
                      <p className={`text-sm ${analytics.revenue.growth.yearly > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {analytics.revenue.growth.yearly > 0 ? '+' : ''}{analytics.revenue.growth.yearly}% YoY
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${analytics.revenue.thisMonth.toLocaleString()}
                      </p>
                      <p className={`text-sm ${analytics.revenue.growth.monthly > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {analytics.revenue.growth.monthly > 0 ? '+' : ''}{analytics.revenue.growth.monthly}% MoM
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Profit Margin</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {analytics.profitability.margin}%
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ${analytics.profitability.netProfit.toLocaleString()} net
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Recent Activity</h3>
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {log.action.replace('_', ' ')}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {log.adminEmail} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.severity === 'low' ? 'bg-green-100 text-green-800' :
                        log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        log.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentTab === 'security' && (
            <div className="space-y-6">
              {/* Active Sessions */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Active Admin Sessions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Admin</th>
                        <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>IP Address</th>
                        <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Activity</th>
                        <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSessions.map((session) => (
                        <tr key={session.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Admin User
                          </td>
                          <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {session.ipAddress}
                          </td>
                          <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {new Date(session.lastActivity).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => revokeSession(session.id)}
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

              {/* Security Settings */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {admin?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        admin?.twoFactorEnabled
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white`}
                    >
                      {admin?.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Session Timeout</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Auto-logout after inactivity
                      </p>
                    </div>
                    <select className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="480">8 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="space-y-6">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Dashboard Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Auto-refresh Interval
                    </label>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                    >
                      <option value={15000}>15 seconds</option>
                      <option value={30000}>30 seconds</option>
                      <option value={60000}>1 minute</option>
                      <option value={300000}>5 minutes</option>
                      <option value={0}>Disabled</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Dark Mode
                    </label>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        darkMode ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute w-5 h-5 bg-white rounded-full transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-0.5'
                        } top-0.5`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Collapsed Sidebar
                    </label>
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        sidebarCollapsed ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute w-5 h-5 bg-white rounded-full transition-transform ${
                          sidebarCollapsed ? 'translate-x-6' : 'translate-x-0.5'
                        } top-0.5`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
