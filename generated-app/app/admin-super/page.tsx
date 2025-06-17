'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from 'react';
import { AdminUser, SystemHealth, AuditLog, CustomerProfile, AppManagement, FinancialAnalytics, AdminRole, AdminPermission } from '@/types/admin';
import TwoFactorModal from '@/components/admin/TwoFactorModal';
import SessionWarningModal from '@/components/admin/SessionWarningModal';
import AppManagementTab from '@/components/admin/AppManagementTab';
import FinancialAnalyticsTab from '@/components/admin/FinancialAnalyticsTab';
import CustomerManagementTab from '@/components/admin/CustomerManagementTab';
import SecurityManagementTab from '@/components/admin/SecurityManagementTab';

// Order Status Badge Component
function OrderStatusBadge({ status, darkMode }: { status: string; darkMode: boolean }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'paid': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'building': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'refunded': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
}

// Order Action Button Component
function OrderActionButton({ 
  order, 
  onAction, 
  darkMode 
}: { 
  order: any; 
  onAction: (orderId: string, action: string, params?: any) => void; 
  darkMode: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');

  const handleAction = (action: string) => {
    if (action === 'handoff') {
      setModalAction('handoff');
      setShowModal(true);
    } else {
      onAction(order.id, action);
    }
  };

  const handleHandoff = (deploymentUrl: string, githubRepo: string, notes: string) => {
    onAction(order.id, 'handoff', {
      status: 'completed',
      deliveryUrl: deploymentUrl,
      adminNotes: `App handoff completed. GitHub: ${githubRepo}, Deployment: ${deploymentUrl}. Notes: ${notes}`
    });
    setShowModal(false);
  };

  return (
    <>
      <div className="flex space-x-2">
        {order.status === 'paid' && (
          <button
            onClick={() => handleAction('start-build')}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Start Build
          </button>
        )}
        {order.status === 'building' && (
          <button
            onClick={() => handleAction('handoff')}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
          >
            Complete & Handoff
          </button>
        )}
        {order.status === 'pending' && (
          <button
            onClick={() => handleAction('cancel')}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Handoff Modal */}
      {showModal && modalAction === 'handoff' && (
        <HandoffModal
          order={order}
          onHandoff={handleHandoff}
          onClose={() => setShowModal(false)}
          darkMode={darkMode}
        />
      )}
    </>
  );
}

// App Handoff Modal Component
function HandoffModal({
  order,
  onHandoff,
  onClose,
  darkMode
}: {
  order: any;
  onHandoff: (deploymentUrl: string, githubRepo: string, notes: string) => void;
  onClose: () => void;
  darkMode: boolean;
}) {
  const [formData, setFormData] = useState({
    deploymentUrl: '',
    githubRepo: '',
    adminPassword: '',
    databaseUrl: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onHandoff(formData.deploymentUrl, formData.githubRepo, formData.notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Complete App Handoff
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
          App: {order.appName} for {order.customerName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Deployment URL *
            </label>
            <input
              type="url"
              value={formData.deploymentUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, deploymentUrl: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="https://your-app.vercel.app"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              GitHub Repository *
            </label>
            <input
              type="text"
              value={formData.githubRepo}
              onChange={(e) => setFormData(prev => ({ ...prev, githubRepo: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="https://github.com/username/repo"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Admin Password (if applicable)
            </label>
            <input
              type="text"
              value={formData.adminPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Auto-generated admin credentials"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Database URL (if applicable)
            </label>
            <input
              type="text"
              value={formData.databaseUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, databaseUrl: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Database connection details"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Handoff Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Important notes, credentials, or instructions for the customer..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Complete Handoff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [apps, setApps] = useState<AppManagement[]>([]);
  const [analytics, setAnalytics] = useState<FinancialAnalytics | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState<any>(null);
  
  // Enhanced Security Management
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [_dateRange, _setDateRange] = useState({ start: '', end: '' });
  const [_statusFilter, _setStatusFilter] = useState('all');
  
  // Security Features
  const [activeSessions, setActiveSessions] = useState<{ id: string; email: string; ip: string; lastActivity: string }[]>([]);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');

  // Load initial data
  useEffect(() => {
    checkAuthStatus();
    
    // Auto-refresh interval
    const interval = setInterval(() => {
      if (isLoggedIn) {
        refreshDashboardData();
        // Check session expiry inline
        if (admin?.sessionExpiresAt) {
          const sessionExpiry = new Date(admin.sessionExpiresAt);
          const now = new Date();
          const timeUntilExpiry = sessionExpiry.getTime() - now.getTime();
          
          // Show warning 10 minutes before expiry
          if (timeUntilExpiry <= 10 * 60 * 1000 && timeUntilExpiry > 0) {
            setSessionWarning(true);
          }
        }
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isLoggedIn, refreshInterval, admin]);

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
        fetchOrders(),
        fetchActiveSessions(),
        fetchRoles(),
        fetchPermissions()
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

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setOrderStats(data.stats);
      }
    } catch (error: unknown) {
      console.error('Orders fetch error:', error);
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

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/security/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      }
    } catch (error: unknown) {
      console.error('Roles fetch error:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/security/permissions');
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions);
      }
    } catch (error: unknown) {
      console.error('Permissions fetch error:', error);
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

  const handleTwoFactorSubmit = async (code: string) => {
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
        setTwoFactorRequired(false);
        await refreshDashboardData();
      } else {
        setTwoFactorError(data.error || '2FA verification failed');
      }
    } catch (error: unknown) {
      setTwoFactorError('2FA verification failed');
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
        body: JSON.stringify({ action: 'refund', orderId, amount, reason })
      });

      if (response.ok) {
        await fetchAnalytics(); // Refresh analytics data
      }
    } catch (error: unknown) {
      console.error('Refund action error:', error);
    }
  };

  const handleOrderAction = async (orderId: string, action: string, params?: any) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...params })
      });

      if (response.ok) {
        await fetchOrders(); // Refresh orders data
      }
    } catch (error: unknown) {
      console.error('Order action error:', error);
    }
  };

  const handleCustomerAction = async (customerId: string, action: string, params?: any) => {
    try {
      const response = await fetch('/api/admin/customers-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, customerId, params })
      });

      if (response.ok) {
        await fetchCustomers(); // Refresh customers data
      }
    } catch (error: unknown) {
      console.error('Customer action error:', error);
    }
  };

  const handleRoleAction = async (action: string, params?: any) => {
    try {
      const response = await fetch('/api/admin/security/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params })
      });

      if (response.ok) {
        await fetchRoles(); // Refresh roles data
      }
    } catch (error: unknown) {
      console.error('Role action error:', error);
    }
  };

  const handlePermissionAction = async (action: string, params?: any) => {
    try {
      const response = await fetch('/api/admin/security/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params })
      });

      if (response.ok) {
        await fetchPermissions(); // Refresh permissions data
      }
    } catch (error: unknown) {
      console.error('Permission action error:', error);
    }
  };

  const handleSessionAction = async (sessionId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/security/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, sessionId })
      });

      if (response.ok) {
        await fetchActiveSessions(); // Refresh sessions data
      }
    } catch (error: unknown) {
      console.error('Session action error:', error);
    }
  };

  const extendSession = async () => {
    try {
      await fetch('/api/admin/auth-enhanced?action=extend_session', { method: 'POST' });
      setSessionWarning(false);
      await checkAuthStatus(); // Refresh session info
    } catch (error: unknown) {
      console.error('Session extension error:', error);
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
  if (!isLoggedIn && !loading) {
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

        {/* Two-Factor Modal */}
        <TwoFactorModal
          isOpen={twoFactorRequired}
          onClose={() => setTwoFactorRequired(false)}
          onSubmit={handleTwoFactorSubmit}
          loading={loading}
          error={twoFactorError}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex`}>
      {/* Session Warning Modal */}
      <SessionWarningModal
        isOpen={sessionWarning}
        onExtend={extendSession}
        onLogout={handleLogout}
        onDismiss={() => setSessionWarning(false)}
        minutesRemaining={10}
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
              { id: 'apps', label: 'App Management', icon: '🚀' },
              { id: 'analytics', label: 'Financial Analytics', icon: '💰' },
              { id: 'system', label: 'System Health', icon: '⚙️' },
              { id: 'security', label: 'Security', icon: '🔒' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
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

          {currentTab === 'apps' && (
            <AppManagementTab
              apps={apps}
              onAppAction={handleAppAction}
              darkMode={darkMode}
            />
          )}

          {currentTab === 'orders' && (
            <div className="space-y-6">
              {/* Order Statistics */}
              {orderStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Total Orders</h3>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {orderStats.total}
                    </p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Completed</h3>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {orderStats.completed}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {orderStats.completionRate?.toFixed(1)}% completion rate
                    </p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Total Revenue</h3>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${orderStats.totalRevenue?.toLocaleString()}
                    </p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>This Week</h3>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {orderStats.weeklyOrders}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      New orders
                    </p>
                  </div>
                </div>
              )}

              {/* Orders Table */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Recent Orders
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Customer
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          App Name
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Status
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Amount
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Timeline
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Created
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {orders.map((order) => (
                        <tr key={order.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {order.customerName}
                              </div>
                              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {order.customerEmail}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {order.appName}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {order.complexity} • {order.framework}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <OrderStatusBadge status={order.status} darkMode={darkMode} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              ${order.totalAmount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {order.timeline}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <OrderActionButton
                              order={order}
                              onAction={handleOrderAction}
                              darkMode={darkMode}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'analytics' && analytics && (
            <FinancialAnalyticsTab
              analytics={analytics}
              onRefundAction={handleRefundAction}
              darkMode={darkMode}
            />
          )}

          {currentTab === 'customers' && (
            <CustomerManagementTab
              customers={customers}
              onCustomerAction={handleCustomerAction}
              darkMode={darkMode}
            />
          )}

          {currentTab === 'security' && (
            <SecurityManagementTab
              roles={roles}
              permissions={permissions}
              auditLogs={auditLogs}
              activeSessions={activeSessions}
              onRoleAction={handleRoleAction}
              onPermissionAction={handlePermissionAction}
              onSessionAction={handleSessionAction}
              darkMode={darkMode}
            />
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
                      <option value={5000}>5 seconds</option>
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
                      ></div>
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
