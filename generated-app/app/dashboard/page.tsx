'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types/business';

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
  joinedAt: string;
  subscriptionStatus?: 'active' | 'inactive' | 'trial';
  nextBillingDate?: string;
  preferredDelivery?: 'github' | 'zip' | 'deployed';
}

interface DashboardStats {
  activeOrders: number;
  completedOrders: number;
  inReview: number;
  totalSpent: number;
  avgDeliveryTime: number;
  successRate: number;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    completedOrders: 0,
    inReview: 0,
    totalSpent: 0,
    avgDeliveryTime: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'projects' | 'billing' | 'settings'>('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        // Mock user data - in real app, fetch from API
        const mockUser: User = {
          id: 'user-1',
          email: 'demo@ece-cli.com',
          name: 'Demo User',
          plan: 'pro',
          totalOrders: 8,
          activeOrders: 2,
          completedOrders: 6,
          totalSpent: 2450,
          joinedAt: '2024-01-15',
          subscriptionStatus: 'active',
          nextBillingDate: '2024-02-15',
          preferredDelivery: 'github'
        };

        // Mock notifications
        const mockNotifications: Notification[] = [
          {
            id: 'notif-1',
            type: 'success',
            title: 'Project Delivered',
            message: 'Your E-commerce Platform has been successfully delivered to your GitHub repository.',
            timestamp: '2024-01-20T14:30:00Z',
            read: false
          },
          {
            id: 'notif-2',
            type: 'info',
            title: 'Build Progress Update',
            message: 'Your Task Management App is now 75% complete. Expected delivery: Tomorrow.',
            timestamp: '2024-01-20T10:15:00Z',
            read: false
          },
          {
            id: 'notif-3',
            type: 'warning',
            title: 'Payment Reminder',
            message: 'Your Pro subscription will renew in 3 days. Manage billing in settings.',
            timestamp: '2024-01-19T16:20:00Z',
            read: true
          }
        ];

        // Mock orders data
        const mockOrders: Order[] = [
          {
            id: 'ord-1',
            customerId: 'user-1',
            customerEmail: 'demo@ece-cli.com',
            customerName: 'Demo User',
            appName: 'E-commerce Platform',
            appDescription: 'Modern online store with Stripe payments',
            framework: 'Next.js',
            features: ['Payment Processing', 'User Authentication', 'Admin Panel'],
            complexity: 'complex',
            database: 'PostgreSQL',
            authentication: ['email', 'google'],
            timeline: '1w',
            rushOrder: false,
            price: 599,
            currency: 'USD',
            status: 'in_progress',
            paymentStatus: 'paid',
            deliveryMethod: 'github',
            createdAt: '2024-01-20T10:00:00Z',
            paidAt: '2024-01-20T10:15:00Z',
            startedAt: '2024-01-20T11:00:00Z',
            buildProgress: 75,
            buildSteps: ['Setup', 'Backend', 'Frontend', 'Testing', 'Deployment'],
            currentStep: 'Testing'
          },
          {
            id: 'ord-2',
            customerId: 'user-1',
            customerEmail: 'demo@ece-cli.com',
            customerName: 'Demo User',
            appName: 'Task Management App',
            appDescription: 'Team collaboration tool with real-time updates',
            framework: 'React',
            features: ['Real-time Chat', 'File Upload', 'Team Management'],
            complexity: 'medium',
            database: 'MongoDB',
            authentication: ['email'],
            timeline: '3d',
            rushOrder: false,
            price: 299,
            currency: 'USD',
            status: 'delivered',
            paymentStatus: 'paid',
            deliveryMethod: 'github',
            repositoryUrl: 'https://github.com/user/task-app',
            createdAt: '2024-01-15T14:00:00Z',
            paidAt: '2024-01-15T14:10:00Z',
            startedAt: '2024-01-15T15:00:00Z',
            deliveredAt: '2024-01-18T12:00:00Z',
            buildProgress: 100,
            buildSteps: ['Setup', 'Backend', 'Frontend', 'Testing', 'Deployment'],
            currentStep: 'Completed'
          }
        ];

        setUser(mockUser);
        setOrders(mockOrders);
        setNotifications(mockNotifications);
        
        // Calculate stats
        const activeCount = mockOrders.filter(o => ['pending', 'paid', 'in_progress'].includes(o.status)).length;
        const completedCount = mockOrders.filter(o => o.status === 'delivered').length;
        const reviewCount = mockOrders.filter(o => o.status === 'review').length;
        const totalSpent = mockOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.price, 0);
        
        setStats({
          activeOrders: activeCount,
          completedOrders: completedCount,
          inReview: reviewCount,
          totalSpent,
          avgDeliveryTime: 3.2, // Mock average delivery time in days
          successRate: 98.5 // Mock success rate percentage
        });
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'paid': return 'text-blue-400 bg-blue-400/10';
      case 'in_progress': return 'text-purple-400 bg-purple-400/10';
      case 'review': return 'text-orange-400 bg-orange-400/10';
      case 'delivered': return 'text-green-400 bg-green-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTimelineText = (timeline: string) => {
    switch (timeline) {
      case '24h': return '24 Hours';
      case '3d': return '3 Days';
      case '1w': return '1 Week';
      case '2w': return '2 Weeks';
      default: return timeline;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/5 border-b border-white/10 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">ECE-CLI Dashboard</h1>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
              {user?.plan?.toUpperCase()}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white/60 hover:text-white/80 transition-colors"
              >
                🔔
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4 z-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-white/60 hover:text-white/80"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-white/60 text-sm text-center py-4">No notifications</p>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-3 rounded-lg ${
                            notification.read ? 'bg-white/5' : 'bg-blue-500/10 border border-blue-400/20'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <span className="text-lg">
                              {notification.type === 'success' ? '✅' : 
                               notification.type === 'warning' ? '⚠️' : 
                               notification.type === 'error' ? '❌' : 'ℹ️'}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-white text-sm font-medium">{notification.title}</h4>
                                {!notification.read && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
                              </div>
                              <p className="text-white/70 text-xs mt-1">{notification.message}</p>
                              <p className="text-white/50 text-xs mt-1">
                                {new Date(notification.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => window.location.href = '/order'}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              + New Project
            </button>
            <div className="text-white/80">
              Welcome, {user?.name}
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('sessionId');
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
              className="px-4 py-2 text-white/60 hover:text-white/80 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          {(['overview', 'orders', 'projects', 'billing', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Active Projects</p>
                    <p className="text-3xl font-bold text-white">{stats.activeOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    🚀
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Completed</p>
                    <p className="text-3xl font-bold text-white">{stats.completedOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    ✅
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">In Review</p>
                    <p className="text-3xl font-bold text-white">{stats.inReview}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                    📋
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Invested</p>
                    <p className="text-3xl font-bold text-white">${stats.totalSpent}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    💰
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Avg Delivery</p>
                    <p className="text-3xl font-bold text-white">{stats.avgDeliveryTime}d</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    ⚡
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Success Rate</p>
                    <p className="text-3xl font-bold text-white">{stats.successRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    🎯
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View All →
                </button>
              </div>
              
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{order.appName}</h3>
                        <p className="text-white/60 text-sm mb-2">{order.appDescription}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-white/60">Framework: {order.framework}</span>
                          <span className="text-white/60">Timeline: {getTimelineText(order.timeline)}</span>
                          <span className="text-white/60">${order.price}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {order.status === 'in_progress' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-white/10 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${order.buildProgress}%` }}
                              />
                            </div>
                            <span className="text-white/60 text-xs">{order.buildProgress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">All Orders</h2>
              <button 
                onClick={() => window.location.href = '/order'}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
              >
                + New Order
              </button>
            </div>

            <div className="grid gap-6">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{order.appName}</h3>
                      <p className="text-white/70 mb-3">{order.appDescription}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Framework:</span>
                          <p className="text-white">{order.framework}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Timeline:</span>
                          <p className="text-white">{getTimelineText(order.timeline)}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Complexity:</span>
                          <p className="text-white capitalize">{order.complexity}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Price:</span>
                          <p className="text-white">${order.price}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-white/60 text-sm">Features: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {order.features.map((feature, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/80"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      {order.status === 'in_progress' && (
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-white/60 text-xs">Progress:</span>
                            <span className="text-white text-xs">{order.buildProgress}%</span>
                          </div>
                          <div className="w-32 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${order.buildProgress}%` }}
                            />
                          </div>
                          <p className="text-white/60 text-xs mt-1">Current: {order.currentStep}</p>
                        </div>
                      )}
                      
                      {order.status === 'delivered' && order.repositoryUrl && (
                        <a 
                          href={order.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        >
                          View Repository →
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-white/60 pt-3 border-t border-white/10">
                    Created: {new Date(order.createdAt).toLocaleDateString()} | 
                    Order ID: {order.id}
                    {order.deliveredAt && (
                      <> | Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Project Portfolio</h2>
              <button 
                onClick={() => window.location.href = '/order'}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
              >
                + Start New Project
              </button>
            </div>

            {/* Project Categories */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                    🌐
                  </div>
                  <h3 className="text-white font-semibold mb-2">Web Applications</h3>
                  <p className="text-white/60 text-sm mb-4">Full-stack web applications with modern frameworks</p>
                  <div className="text-white text-2xl font-bold">{orders.filter(o => o.framework.includes('Next') || o.framework.includes('React')).length}</div>
                  <p className="text-white/60 text-xs">Projects delivered</p>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                    📱
                  </div>
                  <h3 className="text-white font-semibold mb-2">Mobile Apps</h3>
                  <p className="text-white/60 text-sm mb-4">Native and cross-platform mobile applications</p>
                  <div className="text-white text-2xl font-bold">{orders.filter(o => o.features.some(f => f.toLowerCase().includes('mobile'))).length}</div>
                  <p className="text-white/60 text-xs">Projects delivered</p>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                    🤖
                  </div>
                  <h3 className="text-white font-semibold mb-2">AI Integration</h3>
                  <p className="text-white/60 text-sm mb-4">AI-powered applications and automation</p>
                  <div className="text-white text-2xl font-bold">{orders.filter(o => o.features.some(f => f.toLowerCase().includes('ai'))).length}</div>
                  <p className="text-white/60 text-xs">Projects delivered</p>
                </div>
              </div>
            </div>

            {/* Recent Deliveries */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Recent Deliveries</h3>
              <div className="space-y-4">
                {orders.filter(o => o.status === 'delivered').slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                        ✅
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{order.appName}</h4>
                        <p className="text-white/60 text-sm">Delivered via {order.deliveryMethod}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${order.price}</p>
                      <p className="text-white/60 text-sm">{new Date(order.deliveredAt || order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Billing & Payments</h2>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
                Manage Subscription
              </button>
            </div>

            {/* Subscription Status */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Current Plan</h3>
                  <p className="text-white/60">Manage your subscription and billing</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  user?.subscriptionStatus === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {user?.subscriptionStatus?.toUpperCase()}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{user?.plan?.toUpperCase()}</div>
                  <p className="text-white/60 text-sm">Current Plan</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">${stats.totalSpent}</div>
                  <p className="text-white/60 text-sm">Total Spent</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {user?.nextBillingDate ? new Date(user.nextBillingDate).toLocaleDateString() : '—'}
                  </div>
                  <p className="text-white/60 text-sm">Next Billing</p>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Payment History</h3>
              <div className="space-y-4">
                {orders.filter(o => o.paymentStatus === 'paid').map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{order.appName}</h4>
                        <p className="text-white/60 text-sm">
                          {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'Payment pending'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${order.price} {order.currency}</p>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                        {order.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <p className="text-white font-medium">•••• •••• •••• 4242</p>
                        <p className="text-white/60 text-sm">Expires 12/26</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Primary</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 text-purple-400 hover:text-purple-300 transition-colors">
                  + Add Payment Method
                </button>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Billing Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Email Receipts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Auto-pay</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Account Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Name</label>
                    <input 
                      type="text" 
                      value={user?.name || ''} 
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Email</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Preferred Delivery Method</label>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400">
                      <option value="github">GitHub Repository</option>
                      <option value="zip">ZIP Download</option>
                      <option value="deployed">Live Deployment</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Plan:</span>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                        {user?.plan?.toUpperCase()}
                      </span>
                      <button className="text-purple-400 hover:text-purple-300 text-sm">
                        Upgrade →
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Projects:</span>
                    <span className="text-white">{user?.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Active Projects:</span>
                    <span className="text-white">{user?.activeOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Completed Projects:</span>
                    <span className="text-white">{user?.completedOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Investment:</span>
                    <span className="text-white">${user?.totalSpent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Member Since:</span>
                    <span className="text-white">{new Date(user?.joinedAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences & Notifications */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Preferences & Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Email Notifications</p>
                    <p className="text-white/60 text-sm">Receive updates about your projects</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Build Progress Updates</p>
                    <p className="text-white/60 text-sm">Get notified about build milestones</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Marketing Updates</p>
                    <p className="text-white/60 text-sm">Occasional updates about new features</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
