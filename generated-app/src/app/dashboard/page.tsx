'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface App {
  id: string;
  name: string;
  status: 'building' | 'deployed' | 'failed';
  url?: string;
  progress?: number;
  createdAt: string;
}

interface User {
  id: string;
  email?: string;
  name: string;
  apps: App[];
  settings: {
    theme: string;
    notifications: boolean;
    autoDeployment: boolean;
  };
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAppName, setNewAppName] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Mock authentication check
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      router.push('/');
      return;
    }

    // Mock user data fetch
    setTimeout(() => {
      setUser({
        id: 'demo',
        email: 'demo@ece-cli.com',
        name: 'Demo User',
        apps: [
          {
            id: 'app1',
            name: 'E-commerce Platform',
            status: 'deployed',
            url: 'https://demo-ecommerce.vercel.app',
            createdAt: '2024-12-15T10:00:00Z'
          },
          {
            id: 'app2',
            name: 'Task Management App',
            status: 'building',
            progress: 75,
            createdAt: '2024-12-15T14:30:00Z'
          }
        ],
        settings: {
          theme: 'dark',
          notifications: true,
          autoDeployment: true
        }
      });
      setLoading(false);
    }, 1000);
  }, [router]);

  const handleBuildApp = async () => {
    if (!newAppName.trim()) return;
    
    setIsBuilding(true);
    
    // Mock app building process
    const newApp: App = {
      id: Date.now().toString(),
      name: newAppName,
      status: 'building',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setUser(prev => prev ? {
      ...prev,
      apps: [newApp, ...prev.apps]
    } : null);

    // Simulate building progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Update app status to deployed
        setUser(prev => prev ? {
          ...prev,
          apps: prev.apps.map(app => 
            app.id === newApp.id 
              ? { ...app, status: 'deployed', url: `https://${newAppName.toLowerCase().replace(/\s+/g, '-')}.vercel.app` }
              : app
          )
        } : null);
        
        setIsBuilding(false);
        setNewAppName('');
      } else {
        setUser(prev => prev ? {
          ...prev,
          apps: prev.apps.map(app => 
            app.id === newApp.id 
              ? { ...app, progress }
              : app
          )
        } : null);
      }
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/5 border-b border-white/10 p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">ECE-CLI Dashboard</h1>
            <span className="text-white/60">Welcome, {user.name}</span>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('sessionId');
              router.push('/');
            }}
            className="text-white/80 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Build New App Section */}
        <div className="mb-8">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Build New App</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter app name (e.g., 'Social Media Platform')"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isBuilding}
              />
              <button
                onClick={handleBuildApp}
                disabled={isBuilding || !newAppName.trim()}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuilding ? 'Building...' : 'Build App'}
              </button>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.apps.map((app) => (
            <div key={app.id} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{app.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  app.status === 'deployed' ? 'bg-green-500/20 text-green-400' :
                  app.status === 'building' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {app.status}
                </span>
              </div>
              
              {app.status === 'building' && app.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-white/60 mb-2">
                    <span>Building...</span>
                    <span>{Math.round(app.progress)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${app.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <p className="text-white/60 text-sm mb-4">
                Created {new Date(app.createdAt).toLocaleDateString()}
              </p>
              
              {app.status === 'deployed' && app.url && (
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  View App ↗
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Apps</h3>
            <p className="text-3xl font-bold text-purple-400">{user.apps.length}</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Deployed</h3>
            <p className="text-3xl font-bold text-green-400">
              {user.apps.filter(app => app.status === 'deployed').length}
            </p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Building</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {user.apps.filter(app => app.status === 'building').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
