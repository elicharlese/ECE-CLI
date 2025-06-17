'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from 'react';
import { AdminUser, SystemHealth, AuditLog, CustomerProfile, AppManagement, FinancialAnalytics } from '@/types/admin';
import TwoFactorModal from '@/components/admin/TwoFactorModal';
import SessionWarningModal from '@/components/admin/SessionWarningModal';
import AppManagementTab from '@/components/admin/AppManagementTab';
import FinancialAnalyticsTab from '@/components/admin/FinancialAnalyticsTab';

// Enhanced Admin Dashboard with integrated security, app management, and analytics
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
  
  // Enhanced Security
  const [show2FA, setShow2FA] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionMinutesRemaining, setSessionMinutesRemaining] = useState(0);
  
  // Dashboard Data
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [apps, setApps] = useState<AppManagement[]>([]);
  const [analytics, setAnalytics] = useState<FinancialAnalytics | null>(null);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('all');

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
      const minutesRemaining = Math.floor(timeUntilExpiry / (1000 * 60));
      
      // Show warning 10 minutes before expiry
      if (minutesRemaining <= 10 && minutesRemaining > 0) {
        setSessionMinutesRemaining(minutesRemaining);
        setShowSessionWarning(true);
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
        fetchAnalytics()
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
        setCustomers(data.customers);
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
        setApps(data.apps);
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
          setShow2FA(true);
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

  const handle2FASubmit = async (code: string) => {
    try {
      const response = await fetch('/api/admin/auth-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loginForm, twoFactorCode: code })
      });

      const data = await response.json();

      if (response.ok) {
        setAdmin(data.admin);
        setIsLoggedIn(true);
        setShow2FA(false);
        await refreshDashboardData();
      } else {
        throw new Error(data.error || '2FA verification failed');
      }
    } catch (error: unknown) {
      throw error;
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

  const handleSessionExtend = async () => {
    try {
      await checkAuthStatus(); // Refresh session
      setShowSessionWarning(false);
    } catch (error: unknown) {
      console.error('Session extend error:', error);
    }
  };

  const handleAppAction = async (appId: string, action: string, params?: any) => {
    try {
      const response = await fetch('/api/admin/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, appId, params })
      });

      if (response.ok) {
        await fetchApps(); // Refresh apps data
      }
    } catch (error: unknown) {
      console.error('App action error:', error);
    }
  };

  const handleRefundAction = async (orderId: string, amount: number, reason: string) => {
    try {
      const response = await fetch('/api/admin/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process_refund', orderId, amount, reason })
      });

      if (response.ok) {
        await refreshDashboardData(); // Refresh all data
      }
    } catch (error: unknown) {
      console.error('Refund action error:', error);
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
        </div>

        {/* 2FA Modal */}
        <TwoFactorModal
          isOpen={show2FA}
          onClose={() => setShow2FA(false)}
          onSubmit={handle2FASubmit}
          loading={loading}
          error={loginError}
        />
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex`}>
      {/* Session Warning Modal */}
      <SessionWarningModal
        isOpen={showSessionWarning}
        onExtend={handleSessionExtend}
        onLogout={handleLogout}
        onDismiss={() => setShowSessionWarning(false)}
        minutesRemaining={sessionMinutesRemaining}
      />

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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentTab === tab.id
                    ? 'bg-purple-500 text-white'
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
          
          {currentTab === 'apps' && (
            <AppManagementTab
              apps={apps}
              onAppAction={handleAppAction}
              darkMode={darkMode}
            />
          )}

          {currentTab === 'analytics' && analytics && (
            <FinancialAnalyticsTab
              analytics={analytics}
              onRefundAction={handleRefundAction}
              darkMode={darkMode}
            />
          )}

          {/* Other tabs content would go here */}
          {currentTab !== 'dashboard' && currentTab !== 'apps' && currentTab !== 'analytics' && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Content
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This tab is under development. Enhanced features coming soon.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
