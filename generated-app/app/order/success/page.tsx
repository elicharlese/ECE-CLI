'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface OrderStatus {
  id: string;
  status: string;
  progress: number;
  currentBuildStep?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  buildStartedAt?: string;
  completedAt?: string;
  buildLogs: string[];
  deliveryUrl?: string;
  adminUrl?: string;
  appName: string;
  framework: string;
  complexity: string;
  timeline: string;
  deliveryMethod: string;
  estimatedCompletion?: string;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get URL parameters using window.location
  const getUrlParams = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return {
        sessionId: urlParams.get('session_id'),
        orderId: urlParams.get('order_id')
      };
    }
    return { sessionId: null, orderId: null };
  };

  const fetchOrderStatus = useCallback(async () => {
    try {
      const { sessionId, orderId } = getUrlParams();
      if (!sessionId && !orderId) {
        setError('Missing order information');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (orderId) params.append('orderId', orderId);

      const response = await fetch(`/api/orders/create?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch order status');
      }
    } catch (err) {
      setError('Failed to fetch order status');
      console.error('Order fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderStatus();
    
    // Set up polling for order updates
    const interval = setInterval(fetchOrderStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchOrderStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'text-yellow-400';
      case 'paid': return 'text-blue-400';
      case 'building': return 'text-purple-400';
      case 'completed': return 'text-green-400';
      case 'payment_failed': 
      case 'build_failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Payment is being processed...';
      case 'paid': return 'Payment confirmed! Build will start shortly.';
      case 'building': return 'Your app is being built...';
      case 'completed': return 'Your app is ready!';
      case 'payment_failed': return 'Payment failed. Please contact support.';
      case 'build_failed': return 'Build failed. Please contact support.';
      default: return 'Processing your order...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
            <p className="text-white/80 mb-6">{error || 'Unable to find your order information.'}</p>
            <Link
              href="/order"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              Place New Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <nav className="backdrop-blur-sm bg-white/5 border-b border-white/10 p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">ECE-CLI</h1>
            <span className="text-white/60">Order Status</span>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 mt-8">
        {/* Order Header */}
        <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {order.status === 'completed' ? '🎉' : 
               order.status === 'building' ? '🔨' :
               order.status === 'paid' ? '✅' : '⏳'}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {order.status === 'completed' ? 'Order Complete!' : 'Order in Progress'}
            </h1>
            <p className={`text-lg ${getStatusColor(order.status)} mb-4`}>
              {getStatusMessage(order.status)}
            </p>
            <div className="text-white/60">
              <p>Order ID: <span className="font-mono">{order.id}</span></p>
              <p>App Name: <span className="text-white">{order.appName}</span></p>
            </div>
          </div>

          {/* Progress Bar */}
          {(order.status === 'building' || order.status === 'completed') && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80">Build Progress</span>
                <span className="text-white font-semibold">{order.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${order.progress}%` }}
                ></div>
              </div>
              {order.currentBuildStep && (
                <p className="text-white/60 text-sm mt-2">{order.currentBuildStep}</p>
              )}
            </div>
          )}

          {/* Completion Actions */}
          {order.status === 'completed' && order.deliveryUrl && (
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={order.deliveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                >
                  {order.deliveryMethod === 'github' ? '📁 View Repository' :
                   order.deliveryMethod === 'zip' ? '⬇️ Download ZIP' :
                   '🚀 View Live App'}
                </a>
                
                {order.adminUrl && (
                  <a
                    href={order.adminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
                  >
                    🛠️ Admin Panel
                  </a>
                )}
              </div>
              
              <div className="text-white/60 text-sm">
                <p>Your app has been delivered via {order.deliveryMethod}.</p>
                {order.deliveryMethod === 'deployed' && (
                  <p>Login credentials will be sent to your email.</p>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="border-t border-white/20 pt-6 mt-6">
            <h3 className="text-white font-semibold mb-4">Order Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white/80">Order placed: {new Date(order.createdAt).toLocaleString()}</span>
              </div>
              {order.paidAt && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white/80">Payment confirmed: {new Date(order.paidAt).toLocaleString()}</span>
                </div>
              )}
              {order.buildStartedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white/80">Build started: {new Date(order.buildStartedAt).toLocaleString()}</span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white/80">Completed: {new Date(order.completedAt).toLocaleString()}</span>
                </div>
              )}
              {order.estimatedCompletion && !order.completedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-white/80">
                    Estimated completion: {new Date(order.estimatedCompletion).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Build Logs */}
        {order.buildLogs.length > 0 && (
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Build Logs</h3>
            <div className="bg-black/20 rounded-lg p-4 font-mono text-sm max-h-60 overflow-y-auto">
              {order.buildLogs.map((log, index) => (
                <div key={index} className="text-green-300 mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
