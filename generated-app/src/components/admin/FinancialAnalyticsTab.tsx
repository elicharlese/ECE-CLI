'use client';

import { useState } from 'react';
import { FinancialAnalytics } from '@/types/admin';

interface FinancialAnalyticsTabProps {
  analytics: FinancialAnalytics;
  onRefundAction: (orderId: string, amount: number, reason: string) => Promise<void>;
  darkMode: boolean;
}

export default function FinancialAnalyticsTab({ analytics, onRefundAction, darkMode }: FinancialAnalyticsTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({ orderId: '', amount: 0, reason: '' });

  const handleRefund = async () => {
    if (!refundForm.orderId || !refundForm.amount || !refundForm.reason) return;
    
    await onRefundAction(refundForm.orderId, refundForm.amount, refundForm.reason);
    setRefundForm({ orderId: '', amount: 0, reason: '' });
    setShowRefundModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Time Period:</span>
          <div className="flex gap-2">
            {[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: '1y', label: 'Last Year' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-purple-500 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Total Revenue</h3>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${analytics.revenue.total.toLocaleString()}
          </p>
          <p className={`text-sm ${analytics.revenue.growth.monthly >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {analytics.revenue.growth.monthly >= 0 ? '+' : ''}{analytics.revenue.growth.monthly}% vs last month
          </p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Average Order Value</h3>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${analytics.orders.avgOrderValue.toLocaleString()}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            From {analytics.orders.total} orders
          </p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Profit Margin</h3>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {analytics.profitability.margin}%
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            ${analytics.profitability.netProfit.toLocaleString()} net
          </p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Refund Rate</h3>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {((analytics.orders.refunded / analytics.orders.total) * 100).toFixed(1)}%
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {analytics.orders.refunded} refunded orders
          </p>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center">
            <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="text-4xl mb-2">📊</div>
              <p>Revenue chart visualization</p>
              <p className="text-sm">(Chart component would go here)</p>
            </div>
          </div>
        </div>

        {/* Order Distribution */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Order Distribution by Framework</h3>
          <div className="space-y-3">
            {analytics.trends.frameworks.map((framework) => (
              <div key={framework.framework} className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{framework.framework}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(framework.orders / analytics.orders.total) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {framework.orders}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Financial Summary</h3>
          <button
            onClick={() => setShowRefundModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Process Refund
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Revenue Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month:</span>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>${analytics.revenue.thisMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Month:</span>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>${analytics.revenue.lastMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Year:</span>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>${analytics.revenue.thisYear.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Order Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed:</span>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{analytics.orders.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cancelled:</span>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{analytics.orders.cancelled}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completion Rate:</span>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{analytics.orders.completionRate}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Expenses</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hosting:</span>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>${analytics.expenses.hosting.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Development:</span>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>${analytics.expenses.development.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Expenses:</span>
                <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>${analytics.expenses.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Process Refund
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Order ID
                </label>
                <input
                  type="text"
                  value={refundForm.orderId}
                  onChange={(e) => setRefundForm(prev => ({ ...prev, orderId: e.target.value }))}
                  className={`w-full px-3 py-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Enter order ID"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Refund Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reason
                </label>
                <textarea
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                  className={`w-full px-3 py-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Enter refund reason..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleRefund}
                disabled={!refundForm.orderId || !refundForm.amount || !refundForm.reason}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Process Refund
              </button>
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundForm({ orderId: '', amount: 0, reason: '' });
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
