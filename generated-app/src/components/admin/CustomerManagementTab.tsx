'use client';

import { useState } from 'react';
import { CustomerProfile } from '@/types/admin';

interface CustomerManagementTabProps {
  customers: CustomerProfile[];
  onCustomerAction: (customerId: string, action: string, params?: any) => Promise<void>;
  darkMode: boolean;
}

export default function CustomerManagementTab({ customers, onCustomerAction, darkMode }: CustomerManagementTabProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddNote = async () => {
    if (!selectedCustomer || !newNote.trim()) return;

    await onCustomerAction(selectedCustomer.id, 'add_note', { note: newNote });
    setNewNote('');
    setShowAddNoteModal(false);
  };

  const handleAddTag = async () => {
    if (!selectedCustomer || !newTag.trim()) return;

    await onCustomerAction(selectedCustomer.id, 'add_tag', { tag: newTag });
    setNewTag('');
  };

  const handleRemoveTag = async (tag: string) => {
    if (!selectedCustomer) return;
    await onCustomerAction(selectedCustomer.id, 'remove_tag', { tag });
  };

  const handleSendEmail = async (template: string) => {
    if (!selectedCustomer) return;
    await onCustomerAction(selectedCustomer.id, 'send_email', { template });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="vip">VIP</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Customers ({filteredCustomers.length})</h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedCustomer?.id === customer.id
                    ? 'bg-purple-500/10 border-l-4 border-purple-500'
                    : darkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {customer.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        customer.status === 'active' ? 'bg-green-100 text-green-800' :
                        customer.status === 'vip' ? 'bg-yellow-100 text-yellow-800' :
                        customer.status === 'blocked' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {customer.email}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{customer.totalOrders} orders</span>
                      <span>${customer.totalSpent}</span>
                      <span>LTV: ${customer.lifetimeValue}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.slice(0, 2).map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {customer.tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{customer.tags.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Details */}
        {selectedCustomer && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Customer Details
                  </h3>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'hover:text-gray-300' : ''}`}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name:</span>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email:</span>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status:</span>
                    <select
                      value={selectedCustomer.status}
                      onChange={(e) => onCustomerAction(selectedCustomer.id, 'update_status', { status: e.target.value })}
                      className={`ml-2 px-2 py-1 rounded border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="vip">VIP</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Joined:</span>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedCustomer.totalOrders}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Orders</div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${selectedCustomer.totalSpent}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Spent</div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tags:</span>
                  <button
                    onClick={() => setNewTag('')}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    + Add Tag
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCustomer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {newTag !== null && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Enter tag name"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className={`flex-1 px-2 py-1 text-sm rounded border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>Quick Actions:</span>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    📝 Add Note
                  </button>
                  <button
                    onClick={() => handleSendEmail('welcome')}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    ✉️ Send Welcome Email
                  </button>
                  <button
                    onClick={() => handleSendEmail('followup')}
                    className="w-full px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                  >
                    📧 Send Follow-up
                  </button>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && selectedCustomer.notes.length > 0 && (
                <div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>Notes:</span>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedCustomer.notes.map((note) => (
                      <div key={note.id} className={`p-2 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{note.content}</p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(note.createdAt).toLocaleDateString()} by {note.adminName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Add Note for {selectedCustomer?.name}
            </h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note..."
              className={`w-full px-3 py-2 rounded border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Add Note
              </button>
              <button
                onClick={() => {
                  setShowAddNoteModal(false);
                  setNewNote('');
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
