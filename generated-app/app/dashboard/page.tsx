// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface App {
  id: string;
  name: string;
  description?: string;
  status: 'building' | 'deployed' | 'failed' | 'pending';
  url?: string;
  progress?: number;
  createdAt: string;
  framework?: string;
  features?: string[];
  complexity?: 'simple' | 'medium' | 'complex';
  environment?: 'development' | 'staging' | 'production';
}

interface BuildRequest {
  name: string;
  description: string;
  framework: string;
  features: string[];
  complexity: 'simple' | 'medium' | 'complex';
  database: string;
  authentication: string[];
  deployment: string;
  cicd: boolean;
  monitoring: boolean;
  testing: boolean;
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
    dockerMode: boolean;
  };
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showAdvancedBuilder, setShowAdvancedBuilder] = useState(false);
  const [buildRequest, setBuildRequest] = useState<BuildRequest>({
    name: '',
    description: '',
    framework: 'nextjs',
    features: [],
    complexity: 'medium',
    database: 'postgresql',
    authentication: ['email'],
    deployment: 'vercel',
    cicd: true,
    monitoring: true,
    testing: true
  });
  const router = useRouter();

  const frameworks = [
    { id: 'nextjs', name: 'Next.js', description: 'Full-stack React framework' },
    { id: 'react', name: 'React SPA', description: 'Single page application' },
    { id: 'vue', name: 'Vue.js', description: 'Progressive web framework' },
    { id: 'nodejs', name: 'Node.js API', description: 'Backend API only' },
    { id: 'fastapi', name: 'FastAPI', description: 'Python web framework' },
    { id: 'django', name: 'Django', description: 'Python full-stack framework' }
  ];

  const availableFeatures = [
    'Real-time Chat', 'File Upload', 'Payment Integration', 'Email Notifications',
    'PDF Generation', 'Image Processing', 'Search Functionality', 'Analytics Dashboard',
    'User Profiles', 'Admin Panel', 'API Integration', 'Mobile Responsive',
    'PWA Support', 'Offline Mode', 'Multi-language', 'Dark Mode'
  ];

  const databases = [
    { id: 'postgresql', name: 'PostgreSQL' },
    { id: 'mysql', name: 'MySQL' },
    { id: 'mongodb', name: 'MongoDB' },
    { id: 'supabase', name: 'Supabase' },
    { id: 'firebase', name: 'Firebase' }
  ];

  const authProviders = [
    { id: 'email', name: 'Email/Password' },
    { id: 'google', name: 'Google OAuth' },
    { id: 'github', name: 'GitHub OAuth' },
    { id: 'microsoft', name: 'Microsoft OAuth' },
    { id: 'apple', name: 'Apple Sign In' },
    { id: 'phantom', name: 'Phantom Wallet' },
    { id: 'metamask', name: 'MetaMask' }
  ];

  useEffect(() => {
    // Mock authentication check
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      router.push('/');
      return;
    }

    // Mock user data fetch with more robust settings
    setTimeout(() => {
      setUser({
        id: 'demo',
        email: 'demo@ece-cli.com',
        name: 'Demo User',
        apps: [
          {
            id: 'app1',
            name: 'E-commerce Platform',
            description: 'Full-featured online store with payment integration',
            status: 'deployed',
            url: 'https://demo-ecommerce.vercel.app',
            createdAt: '2024-12-15T10:00:00Z',
            framework: 'nextjs',
            features: ['Payment Integration', 'User Profiles', 'Admin Panel'],
            complexity: 'complex',
            environment: 'production'
          },
          {
            id: 'app2',
            name: 'Task Management App',
            description: 'Collaborative task management with real-time updates',
            status: 'building',
            progress: 75,
            createdAt: '2024-12-15T14:30:00Z',
            framework: 'react',
            features: ['Real-time Chat', 'File Upload'],
            complexity: 'medium',
            environment: 'development'
          }
        ],
        settings: {
          theme: 'dark',
          notifications: true,
          autoDeployment: true,
          dockerMode: false
        }
      });
      setLoading(false);
    }, 1000);
  }, [router]);

  const handleAdvancedBuild = async () => {
    if (!buildRequest.name.trim() || !buildRequest.description.trim()) {
      alert('Please fill in app name and description');
      return;
    }
    
    setIsBuilding(true);
    
    try {
      // Enhanced app building with detailed configuration
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify({
          ...buildRequest,
          userId: user?.id,
          dockerMode: user?.settings.dockerMode
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const newApp: App = {
          id: data.app.id,
          name: buildRequest.name,
          description: buildRequest.description,
          status: 'building',
          progress: 0,
          createdAt: new Date().toISOString(),
          framework: buildRequest.framework,
          features: buildRequest.features,
          complexity: buildRequest.complexity,
          environment: 'development'
        };

        setUser(prev => prev ? {
          ...prev,
          apps: [newApp, ...prev.apps]
        } : null);

        // Simulate enhanced building progress with detailed steps
        let progress = 0;
        const buildSteps = data.buildSteps || [
          'Analyzing requirements...',
          'Setting up project structure...',
          'Installing dependencies...',
          'Generating components...',
          'Setting up database...',
          'Configuring authentication...',
          'Setting up CI/CD pipeline...',
          'Running tests...',
          'Building for production...',
          'Deploying application...'
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 10;
          
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Update app status to deployed
            setUser(prev => prev ? {
              ...prev,
              apps: prev.apps.map(app => 
                app.id === newApp.id 
                  ? { 
                      ...app, 
                      status: 'deployed', 
                      url: `https://${buildRequest.name.toLowerCase().replace(/\s+/g, '-')}.vercel.app`,
                      environment: 'production'
                    }
                  : app
              )
            } : null);
            
            setIsBuilding(false);
            setShowAdvancedBuilder(false);
            setBuildRequest({
              name: '',
              description: '',
              framework: 'nextjs',
              features: [],
              complexity: 'medium',
              database: 'postgresql',
              authentication: ['email'],
              deployment: 'vercel',
              cicd: true,
              monitoring: true,
              testing: true
            });
          } else {
            if (progress > (currentStep + 1) * 10 && currentStep < buildSteps.length - 1) {
              currentStep++;
            }
            
            setUser(prev => prev ? {
              ...prev,
              apps: prev.apps.map(app => 
                app.id === newApp.id 
                  ? { ...app, progress }
                  : app
              )
            } : null);
          }
        }, 800);
      }
    } catch (error) {
      console.error('Build error:', error);
      alert('Failed to start building. Please try again.');
      setIsBuilding(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setBuildRequest(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const toggleAuthProvider = (provider: string) => {
    setBuildRequest(prev => ({
      ...prev,
      authentication: prev.authentication.includes(provider)
        ? prev.authentication.filter(p => p !== provider)
        : [...prev.authentication, provider]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/5 border-b border-white/10 p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">ECE-CLI Dashboard</h1>
            <span className="text-white/60">Welcome, {user.name}</span>
            {user.settings.dockerMode && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                🐳 Docker Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setUser(prev => prev ? {
                ...prev,
                settings: { ...prev.settings, dockerMode: !prev.settings.dockerMode }
              } : null)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              {user.settings.dockerMode ? '🐳 Docker' : '💻 CLI'}
            </button>
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
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Build Section */}
        <div className="mb-8">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Build New Application</h2>
            
            {!showAdvancedBuilder ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Quick build: Enter app name (e.g., 'Social Media Platform')"
                    value={buildRequest.name}
                    onChange={(e) => setBuildRequest(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isBuilding}
                  />
                  <button
                    onClick={() => {
                      if (buildRequest.name.trim()) {
                        setBuildRequest(prev => ({ ...prev, description: `A ${prev.name} application` }));
                        handleAdvancedBuild();
                      }
                    }}
                    disabled={isBuilding || !buildRequest.name.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuilding ? 'Building...' : 'Quick Build'}
                  </button>
                </div>
                <button
                  onClick={() => setShowAdvancedBuilder(true)}
                  className="w-full py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  🔧 Advanced Configuration
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">App Name</label>
                    <input
                      type="text"
                      value={buildRequest.name}
                      onChange={(e) => setBuildRequest(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="My Awesome App"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Complexity</label>
                    <select
                      value={buildRequest.complexity}
                      onChange={(e) => setBuildRequest(prev => ({ ...prev, complexity: e.target.value as 'simple' | 'medium' | 'complex' }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="simple">Simple (Basic CRUD)</option>
                      <option value="medium">Medium (Multi-feature)</option>
                      <option value="complex">Complex (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={buildRequest.description}
                    onChange={(e) => setBuildRequest(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe your application features and requirements..."
                    rows={3}
                  />
                </div>

                {/* Framework Selection */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Framework</label>
                  <div className="grid md:grid-cols-3 gap-3">
                    {frameworks.map((framework) => (
                      <div
                        key={framework.id}
                        onClick={() => setBuildRequest(prev => ({ ...prev, framework: framework.id }))}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          buildRequest.framework === framework.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/20 bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <h3 className="text-white font-medium">{framework.name}</h3>
                        <p className="text-white/60 text-sm mt-1">{framework.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Features</label>
                  <div className="grid md:grid-cols-4 gap-2">
                    {availableFeatures.map((feature) => (
                      <button
                        key={feature}
                        onClick={() => toggleFeature(feature)}
                        className={`p-3 rounded-lg text-sm transition-colors ${
                          buildRequest.features.includes(feature)
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                            : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Database and Auth */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Database</label>
                    <select
                      value={buildRequest.database}
                      onChange={(e) => setBuildRequest(prev => ({ ...prev, database: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {databases.map((db) => (
                        <option key={db.id} value={db.id}>{db.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Authentication</label>
                    <div className="space-y-2">
                      {authProviders.slice(0, 4).map((provider) => (
                        <label key={provider.id} className="flex items-center gap-2 text-white/80">
                          <input
                            type="checkbox"
                            checked={buildRequest.authentication.includes(provider.id)}
                            onChange={() => toggleAuthProvider(provider.id)}
                            className="rounded"
                          />
                          {provider.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DevOps Options */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">DevOps & Production</label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 text-white/80">
                      <input
                        type="checkbox"
                        checked={buildRequest.cicd}
                        onChange={(e) => setBuildRequest(prev => ({ ...prev, cicd: e.target.checked }))}
                        className="rounded"
                      />
                      CI/CD Pipeline
                    </label>
                    <label className="flex items-center gap-2 text-white/80">
                      <input
                        type="checkbox"
                        checked={buildRequest.monitoring}
                        onChange={(e) => setBuildRequest(prev => ({ ...prev, monitoring: e.target.checked }))}
                        className="rounded"
                      />
                      Monitoring & Alerts
                    </label>
                    <label className="flex items-center gap-2 text-white/80">
                      <input
                        type="checkbox"
                        checked={buildRequest.testing}
                        onChange={(e) => setBuildRequest(prev => ({ ...prev, testing: e.target.checked }))}
                        className="rounded"
                      />
                      Test Suite
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleAdvancedBuild}
                    disabled={isBuilding || !buildRequest.name.trim() || !buildRequest.description.trim()}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuilding ? 'Building Application...' : '🚀 Build Application'}
                  </button>
                  <button
                    onClick={() => setShowAdvancedBuilder(false)}
                    className="px-8 py-4 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    Simple Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.apps.map((app) => (
            <div key={app.id} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{app.name}</h3>
                  {app.description && (
                    <p className="text-white/60 text-sm mt-1">{app.description}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  app.status === 'deployed' ? 'bg-green-500/20 text-green-400' :
                  app.status === 'building' ? 'bg-yellow-500/20 text-yellow-400' :
                  app.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {app.status}
                </span>
              </div>

              {/* App Details */}
              {(app.framework || app.features || app.complexity) && (
                <div className="mb-4 space-y-2">
                  {app.framework && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-xs">Framework:</span>
                      <span className="text-white/80 text-sm">{app.framework}</span>
                    </div>
                  )}
                  {app.complexity && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-xs">Complexity:</span>
                      <span className="text-white/80 text-sm capitalize">{app.complexity}</span>
                    </div>
                  )}
                  {app.features && app.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {app.features.slice(0, 3).map((feature) => (
                        <span key={feature} className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                      {app.features.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded">
                          +{app.features.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              
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
              
              <div className="flex justify-between items-center text-sm text-white/60 mb-4">
                <span>Created {new Date(app.createdAt).toLocaleDateString()}</span>
                {app.environment && (
                  <span className={`px-2 py-1 rounded text-xs ${
                    app.environment === 'production' ? 'bg-green-500/20 text-green-400' :
                    app.environment === 'staging' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {app.environment}
                  </span>
                )}
              </div>
              
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

        {/* Enhanced Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
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
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-blue-400">
              {user.apps.length > 0 ? Math.round((user.apps.filter(app => app.status === 'deployed').length / user.apps.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
