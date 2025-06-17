'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { PRICING_TIERS, FEATURE_ADDONS, calculateOrderPrice, TIMELINE_NAMES } from '@/types/business';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface OrderForm {
  // Customer Info
  customerName: string;
  customerEmail: string;
  company?: string;
  phone?: string;
  businessType: string;
  industry: string;
  
  // App Details
  appName: string;
  appDescription: string;
  framework: string;
  complexity: 'simple' | 'medium' | 'complex';
  features: string[];
  database: string;
  authentication: string[];
  
  // Project Scope
  projectType: 'web-app' | 'mobile-app' | 'api' | 'full-stack' | 'mvp' | 'enterprise';
  targetUsers: string;
  expectedTraffic: 'low' | 'medium' | 'high' | 'enterprise';
  platformRequirements: string[];
  
  // Technical Requirements
  thirdPartyIntegrations: string[];
  designPreferences: string;
  brandingRequirements: string;
  performanceRequirements: string;
  
  // Modern App Requirements
  pwaRequirements: boolean;
  offlineCapabilities: boolean;
  realtimeFeatures: string[];
  analyticsTracking: string[];
  seoRequirements: boolean;
  
  // Mobile & Cross-Platform
  mobileFirst: boolean;
  nativeAppRequired: boolean;
  crossPlatformNeeded: boolean;
  
  // Advanced Features
  aiIntegration: string[];
  blockchainFeatures: string[];
  webRTCFeatures: string[];
  
  // Development Preferences
  testingRequirements: string[];
  documentationLevel: 'basic' | 'comprehensive' | 'enterprise';
  codeQualityLevel: 'standard' | 'premium' | 'enterprise';
  
  // Collaboration & Communication
  clientCollaboration: 'minimal' | 'regular' | 'intensive';
  feedbackMechanism: string[];
  projectManagementTool: string;
  
  // Hosting & Deployment
  hostingPreference: 'vercel' | 'netlify' | 'aws' | 'heroku' | 'custom' | 'client-managed';
  domainRequired: boolean;
  sslRequired: boolean;
  
  // GitHub & Version Control
  githubUsername?: string;
  repositoryName?: string;
  repositoryAccess: 'public' | 'private' | 'organization';
  
  // Business Options
  timeline: '24h' | '3d' | '1w' | '2w';
  deliveryMethod: 'github' | 'zip' | 'deployed';
  
  // Legal & Compliance
  dataRegion: 'us' | 'eu' | 'asia' | 'global';
  complianceRequirements: string[];
  
  // Special Requirements
  specialRequirements?: string;
  meetingPreference: 'none' | 'kickoff' | 'weekly' | 'milestone-based';
  revisionRounds: number;
}

export default function OrderPage() {
  const [orderForm, setOrderForm] = useState<OrderForm>({
    customerName: '',
    customerEmail: '',
    company: '',
    phone: '',
    businessType: 'startup',
    industry: 'technology',
    appName: '',
    appDescription: '',
    framework: 'nextjs',
    complexity: 'medium',
    features: [],
    database: 'postgresql',
    authentication: ['email'],
    projectType: 'web-app',
    targetUsers: '',
    expectedTraffic: 'medium',
    platformRequirements: [],
    thirdPartyIntegrations: [],
    designPreferences: '',
    brandingRequirements: '',
    performanceRequirements: '',
    
    // Modern App Requirements
    pwaRequirements: false,
    offlineCapabilities: false,
    realtimeFeatures: [],
    analyticsTracking: [],
    seoRequirements: true,
    
    // Mobile & Cross-Platform
    mobileFirst: true,
    nativeAppRequired: false,
    crossPlatformNeeded: false,
    
    // Advanced Features
    aiIntegration: [],
    blockchainFeatures: [],
    webRTCFeatures: [],
    
    // Development Preferences
    testingRequirements: [],
    documentationLevel: 'comprehensive',
    codeQualityLevel: 'premium',
    
    // Collaboration & Communication
    clientCollaboration: 'regular',
    feedbackMechanism: [],
    projectManagementTool: 'slack',
    
    hostingPreference: 'vercel',
    domainRequired: false,
    sslRequired: true,
    githubUsername: '',
    repositoryName: '',
    repositoryAccess: 'private',
    timeline: '1w',
    deliveryMethod: 'github',
    dataRegion: 'us',
    complianceRequirements: [],
    specialRequirements: '',
    meetingPreference: 'kickoff',
    revisionRounds: 2,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
    'PWA Support', 'Offline Mode', 'Multi-language', 'Dark Mode', 'Advanced Analytics',
    'Mobile App', 'Custom Branding', 'SEO Optimization', 'Social Media Integration',
    'Advanced Security'
  ];

  // Calculate current price
  const currentPrice = calculateOrderPrice(orderForm.complexity, orderForm.timeline, orderForm.features);
  const currentTier = PRICING_TIERS[orderForm.complexity];

  const toggleFeature = (feature: string) => {
    const tier = PRICING_TIERS[orderForm.complexity];
    const maxFeatures = tier.features.maxFeatures;
    
    setOrderForm(prev => {
      if (prev.features.includes(feature)) {
        return {
          ...prev,
          features: prev.features.filter(f => f !== feature)
        };
      } else if (prev.features.length < maxFeatures) {
        return {
          ...prev,
          features: [...prev.features, feature]
        };
      }
      return prev;
    });
  };

  const handleSubmitOrder = async () => {
    if (!orderForm.customerName || !orderForm.customerEmail || !orderForm.appName || !orderForm.appDescription) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order and payment intent
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderForm,
          price: currentPrice,
          currency: 'usd'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe Checkout
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.checkoutSessionId,
          });

          if (error) {
            console.error('Stripe error:', error);
            alert('Payment setup failed. Please try again.');
          }
        }
      } else {
        alert('Order creation failed: ' + data.error);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Order submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableTimelines = () => {
    const tier = PRICING_TIERS[orderForm.complexity];
    return Object.entries(tier.timeline).filter(([, config]) => config.available);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <nav className="backdrop-blur-sm bg-white/5 border-b border-white/10 p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">ECE-CLI</h1>
            <span className="text-white/60">Custom App Development</span>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/50'
                }`}>
                  {step}
                </div>
                {step < 6 && (
                  <div className={`w-12 h-1 ${
                    currentStep > step ? 'bg-purple-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-white/80">
              {currentStep === 1 && 'Customer & Business Information'}
              {currentStep === 2 && 'Project Scope & Requirements'}
              {currentStep === 3 && 'Technical Configuration'}
              {currentStep === 4 && 'Hosting & Repository Setup'}
              {currentStep === 5 && 'Timeline & Delivery'}
              {currentStep === 6 && 'Review & Payment'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8">
              {/* Step 1: Customer & Business Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Customer & Business Information</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={orderForm.customerName}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={orderForm.customerEmail}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Company/Organization</label>
                      <input
                        type="text"
                        value={orderForm.company}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Phone (Optional)</label>
                      <input
                        type="tel"
                        value={orderForm.phone}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Business Type</label>
                      <select
                        value={orderForm.businessType}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, businessType: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="startup">Startup</option>
                        <option value="small-business">Small Business</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="nonprofit">Non-profit</option>
                        <option value="agency">Agency</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="personal">Personal Project</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Industry</label>
                      <select
                        value={orderForm.industry}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="media">Media & Entertainment</option>
                        <option value="real-estate">Real Estate</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={!orderForm.customerName || !orderForm.customerEmail}
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Project Scope →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Project Scope & Requirements */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Project Scope & Requirements</h2>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">App Name *</label>
                        <input
                          type="text"
                          value={orderForm.appName}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, appName: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="My Awesome App"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Project Type</label>
                        <select
                          value={orderForm.projectType}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, projectType: e.target.value as any }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="web-app">Web Application</option>
                          <option value="mobile-app">Mobile Application</option>
                          <option value="api">API/Backend Service</option>
                          <option value="full-stack">Full Stack Solution</option>
                          <option value="mvp">MVP/Prototype</option>
                          <option value="enterprise">Enterprise Solution</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">App Description & Purpose *</label>
                      <textarea
                        value={orderForm.appDescription}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, appDescription: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Describe your application's main purpose, key features, and what problem it solves..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Target Users/Audience</label>
                        <input
                          type="text"
                          value={orderForm.targetUsers}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, targetUsers: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Small business owners, Students, Enterprise users..."
                        />
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Expected Traffic Volume</label>
                        <select
                          value={orderForm.expectedTraffic}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, expectedTraffic: e.target.value as any }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >                        <option value="low">Low (&lt; 1K users/month)</option>
                        <option value="medium">Medium (1K-10K users/month)</option>
                        <option value="high">High (10K-100K users/month)</option>
                        <option value="enterprise">Enterprise (&gt; 100K users/month)</option>
                        </select>
                      </div>
                    </div>

                    {/* Platform Requirements */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Platform Requirements</label>
                      <div className="grid md:grid-cols-4 gap-2">
                        {['Web Desktop', 'Web Mobile', 'iOS Native', 'Android Native', 'PWA', 'Cross-Platform'].map((platform) => (
                          <button
                            key={platform}
                            onClick={() => {
                              setOrderForm(prev => ({
                                ...prev,
                                platformRequirements: prev.platformRequirements.includes(platform)
                                  ? prev.platformRequirements.filter(p => p !== platform)
                                  : [...prev.platformRequirements, platform]
                              }));
                            }}
                            className={`p-3 rounded-lg text-sm transition-colors ${
                              orderForm.platformRequirements.includes(platform)
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                            }`}
                          >
                            {platform}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Design Preferences */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Design Style Preferences</label>
                      <textarea
                        value={orderForm.designPreferences}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, designPreferences: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Modern, minimalist, corporate, playful, dark theme, specific color scheme..."
                        rows={2}
                      />
                    </div>

                    {/* Modern App Requirements */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Modern App Features</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={orderForm.mobileFirst}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, mobileFirst: e.target.checked }))}
                              className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                            />
                            <span className="text-white">Mobile-First Design</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={orderForm.pwaRequirements}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, pwaRequirements: e.target.checked }))}
                              className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                            />
                            <span className="text-white">Progressive Web App (PWA)</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={orderForm.offlineCapabilities}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, offlineCapabilities: e.target.checked }))}
                              className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                            />
                            <span className="text-white">Offline Capabilities</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={orderForm.seoRequirements}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, seoRequirements: e.target.checked }))}
                              className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                            />
                            <span className="text-white">SEO Optimization</span>
                          </label>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={orderForm.nativeAppRequired}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, nativeAppRequired: e.target.checked }))}
                              className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                            />
                            <span className="text-white">Native Mobile App (+$1000)</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={orderForm.crossPlatformNeeded}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, crossPlatformNeeded: e.target.checked }))}
                              className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                            />
                            <span className="text-white">Cross-Platform Support (+$500)</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Features */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Real-time Features</label>
                      <div className="grid md:grid-cols-3 gap-2">
                        {['Live Chat', 'Real-time Notifications', 'Live Updates', 'Collaborative Editing', 'Video Calling', 'Screen Sharing', 'Live Data Sync', 'WebSockets'].map((feature) => (
                          <button
                            key={feature}
                            onClick={() => {
                              setOrderForm(prev => ({
                                ...prev,
                                realtimeFeatures: prev.realtimeFeatures.includes(feature)
                                  ? prev.realtimeFeatures.filter(f => f !== feature)
                                  : [...prev.realtimeFeatures, feature]
                              }));
                            }}
                            className={`p-3 rounded-lg text-sm transition-colors ${
                              orderForm.realtimeFeatures.includes(feature)
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                            }`}
                          >
                            {feature}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Analytics & Tracking */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Analytics & Tracking</label>
                      <div className="grid md:grid-cols-4 gap-2">
                        {['Google Analytics', 'Mixpanel', 'Hotjar', 'PostHog', 'Custom Analytics', 'A/B Testing', 'User Behavior', 'Performance Monitoring'].map((analytics) => (
                          <button
                            key={analytics}
                            onClick={() => {
                              setOrderForm(prev => ({
                                ...prev,
                                analyticsTracking: prev.analyticsTracking.includes(analytics)
                                  ? prev.analyticsTracking.filter(a => a !== analytics)
                                  : [...prev.analyticsTracking, analytics]
                              }));
                            }}
                            className={`p-3 rounded-lg text-sm transition-colors ${
                              orderForm.analyticsTracking.includes(analytics)
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                            }`}
                          >
                            {analytics}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        disabled={!orderForm.appName || !orderForm.appDescription}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next: Technical Config →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Technical Configuration */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Technical Configuration</h2>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Complexity Level</label>
                        <select
                          value={orderForm.complexity}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, complexity: e.target.value as 'simple' | 'medium' | 'complex' }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="simple">Simple (${PRICING_TIERS.simple.basePrice}+)</option>
                          <option value="medium">Medium (${PRICING_TIERS.medium.basePrice}+)</option>
                          <option value="complex">Complex (${PRICING_TIERS.complex.basePrice}+)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Database Preference</label>
                        <select
                          value={orderForm.database}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, database: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="postgresql">PostgreSQL</option>
                          <option value="mysql">MySQL</option>
                          <option value="mongodb">MongoDB</option>
                          <option value="sqlite">SQLite</option>
                          <option value="firebase">Firebase</option>
                          <option value="supabase">Supabase</option>
                          <option value="none">No Database Required</option>
                        </select>
                      </div>
                    </div>

                    {/* Framework Selection */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Framework/Technology Stack</label>
                      <div className="grid md:grid-cols-3 gap-3">
                        {frameworks.map((framework) => (
                          <div
                            key={framework.id}
                            onClick={() => setOrderForm(prev => ({ ...prev, framework: framework.id }))}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              orderForm.framework === framework.id
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

                    {/* Authentication Methods */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Authentication Methods</label>
                      <div className="grid md:grid-cols-4 gap-2">
                        {['Email/Password', 'Google OAuth', 'GitHub OAuth', 'Apple ID', 'Facebook', 'Two-Factor Auth', 'Magic Links', 'None Required'].map((auth) => (
                          <button
                            key={auth}
                            onClick={() => {
                              setOrderForm(prev => ({
                                ...prev,
                                authentication: prev.authentication.includes(auth)
                                  ? prev.authentication.filter(a => a !== auth)
                                  : [...prev.authentication, auth]
                              }));
                            }}
                            className={`p-3 rounded-lg text-sm transition-colors ${
                              orderForm.authentication.includes(auth)
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                            }`}
                          >
                            {auth}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Features Selection */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Features & Functionality (Max {currentTier.features.maxFeatures} for {orderForm.complexity})
                      </label>
                      <div className="text-sm text-white/60 mb-3">
                        Included: {currentTier.features.includedFeatures.join(', ')}
                      </div>
                      <div className="grid md:grid-cols-4 gap-2">
                        {availableFeatures.map((feature) => {
                          const isIncluded = currentTier.features.includedFeatures.includes(feature);
                          const isSelected = orderForm.features.includes(feature);
                          const isAddon = FEATURE_ADDONS[feature];
                          
                          return (
                            <button
                              key={feature}
                              onClick={() => !isIncluded && toggleFeature(feature)}
                              disabled={isIncluded || (!isSelected && orderForm.features.length >= currentTier.features.maxFeatures)}
                              className={`p-3 rounded-lg text-sm transition-colors relative ${
                                isIncluded 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500 cursor-default'
                                  : isSelected
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                    : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed'
                              }`}
                            >
                              {feature}
                              {isIncluded && <span className="text-xs block">✓ Included</span>}
                              {isAddon && !isIncluded && (
                                <span className="text-xs block">+${isAddon.price}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Third Party Integrations */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Third-Party Integrations</label>
                      <div className="grid md:grid-cols-4 gap-2">
                        {['Stripe Payments', 'PayPal', 'Twilio SMS', 'SendGrid Email', 'AWS S3', 'Cloudinary', 'Google Analytics', 'Intercom', 'Slack', 'Discord', 'Mailchimp', 'Zapier'].map((integration) => (
                          <button
                            key={integration}
                            onClick={() => {
                              setOrderForm(prev => ({
                                ...prev,
                                thirdPartyIntegrations: prev.thirdPartyIntegrations.includes(integration)
                                  ? prev.thirdPartyIntegrations.filter(i => i !== integration)
                                  : [...prev.thirdPartyIntegrations, integration]
                              }));
                            }}
                            className={`p-3 rounded-lg text-sm transition-colors ${
                              orderForm.thirdPartyIntegrations.includes(integration)
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                            }`}
                          >
                            {integration}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Features */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Advanced Technologies</h3>
                      
                      <div className="space-y-4">
                        {/* AI Integration */}
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">AI Integration</label>
                          <div className="grid md:grid-cols-3 gap-2">
                            {['ChatGPT API', 'OpenAI Integration', 'Custom AI Models', 'Machine Learning', 'Natural Language Processing', 'Computer Vision', 'Recommendation Engine', 'Predictive Analytics', 'AI Chatbot'].map((ai) => (
                              <button
                                key={ai}
                                onClick={() => {
                                  setOrderForm(prev => ({
                                    ...prev,
                                    aiIntegration: prev.aiIntegration.includes(ai)
                                      ? prev.aiIntegration.filter(a => a !== ai)
                                      : [...prev.aiIntegration, ai]
                                  }));
                                }}
                                className={`p-3 rounded-lg text-sm transition-colors ${
                                  orderForm.aiIntegration.includes(ai)
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                    : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                                }`}
                              >
                                {ai}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Web3 & Blockchain */}
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Web3 & Blockchain Features (+$500 each)</label>
                          <div className="grid md:grid-cols-4 gap-2">
                            {['Wallet Connection', 'Smart Contracts', 'NFT Integration', 'Cryptocurrency Payments', 'DeFi Features', 'DAO Governance', 'Token Creation', 'Blockchain Analytics'].map((blockchain) => (
                              <button
                                key={blockchain}
                                onClick={() => {
                                  setOrderForm(prev => ({
                                    ...prev,
                                    blockchainFeatures: prev.blockchainFeatures.includes(blockchain)
                                      ? prev.blockchainFeatures.filter(b => b !== blockchain)
                                      : [...prev.blockchainFeatures, blockchain]
                                  }));
                                }}
                                className={`p-3 rounded-lg text-sm transition-colors ${
                                  orderForm.blockchainFeatures.includes(blockchain)
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                    : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                                }`}
                              >
                                {blockchain}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* WebRTC Features */}
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Communication Features</label>
                          <div className="grid md:grid-cols-3 gap-2">
                            {['Video Conferencing', 'Voice Calls', 'Screen Sharing', 'File Transfer', 'Peer-to-Peer Chat', 'Group Video', 'Recording Features', 'Live Streaming'].map((webrtc) => (
                              <button
                                key={webrtc}
                                onClick={() => {
                                  setOrderForm(prev => ({
                                    ...prev,
                                    webRTCFeatures: prev.webRTCFeatures.includes(webrtc)
                                      ? prev.webRTCFeatures.filter(w => w !== webrtc)
                                      : [...prev.webRTCFeatures, webrtc]
                                  }));
                                }}
                                className={`p-3 rounded-lg text-sm transition-colors ${
                                  orderForm.webRTCFeatures.includes(webrtc)
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                    : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                                }`}
                              >
                                {webrtc}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Development Quality & Testing */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Development Standards</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Code Quality Level</label>
                          <select
                            value={orderForm.codeQualityLevel}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, codeQualityLevel: e.target.value as any }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="standard">Standard</option>
                            <option value="premium">Premium (+$200)</option>
                            <option value="enterprise">Enterprise (+$500)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Documentation Level</label>
                          <select
                            value={orderForm.documentationLevel}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, documentationLevel: e.target.value as any }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="basic">Basic</option>
                            <option value="comprehensive">Comprehensive (+$300)</option>
                            <option value="enterprise">Enterprise (+$800)</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-white text-sm font-medium mb-2">Testing Requirements</label>
                        <div className="grid md:grid-cols-4 gap-2">
                          {['Unit Testing', 'Integration Testing', 'E2E Testing', 'Performance Testing', 'Security Testing', 'Accessibility Testing', 'Mobile Testing', 'Cross-browser Testing'].map((test) => (
                            <button
                              key={test}
                              onClick={() => {
                                setOrderForm(prev => ({
                                  ...prev,
                                  testingRequirements: prev.testingRequirements.includes(test)
                                    ? prev.testingRequirements.filter(t => t !== test)
                                    : [...prev.testingRequirements, test]
                                }));
                              }}
                              className={`p-3 rounded-lg text-sm transition-colors ${
                                orderForm.testingRequirements.includes(test)
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                  : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                              }`}
                            >
                              {test}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                      >
                        Next: Hosting Setup →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Hosting & Repository Setup */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Hosting & Repository Setup</h2>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Hosting Preference */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Hosting Platform Preference</label>
                      <div className="grid md:grid-cols-3 gap-3">
                        {[
                          { id: 'vercel', name: 'Vercel', desc: 'Next.js optimized, instant deployments, global CDN' },
                          { id: 'netlify', name: 'Netlify', desc: 'JAMstack focused, excellent for static sites' },
                          { id: 'aws', name: 'AWS', desc: 'Enterprise-grade, highly scalable, full control' },
                          { id: 'heroku', name: 'Heroku', desc: 'Simple deployment, great for APIs and Node.js' },
                          { id: 'custom', name: 'Custom Setup', desc: 'Docker, Kubernetes, or specific requirements' },
                          { id: 'client-managed', name: 'Client Managed', desc: 'You handle hosting and deployment' }
                        ].map((host) => (
                          <div
                            key={host.id}
                            onClick={() => setOrderForm(prev => ({ ...prev, hostingPreference: host.id as any }))}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              orderForm.hostingPreference === host.id
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-white/20 bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            <h3 className="text-white font-medium">{host.name}</h3>
                            <p className="text-white/60 text-sm mt-1">{host.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GitHub Repository Settings */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">🔧 GitHub Repository & Version Control</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Your GitHub Username *</label>
                          <input
                            type="text"
                            value={orderForm.githubUsername}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, githubUsername: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="your-github-username"
                          />
                          <p className="text-white/60 text-xs mt-1">✨ We'll create the repository and transfer ownership to you</p>
                        </div>
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Repository Name (Optional)</label>
                          <input
                            type="text"
                            value={orderForm.repositoryName}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, repositoryName: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder={orderForm.appName ? orderForm.appName.toLowerCase().replace(/\s+/g, '-') : 'my-app'}
                          />
                          <p className="text-white/60 text-xs mt-1">📝 Leave blank to auto-generate from app name</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-2">Repository Access Level</label>
                        <div className="grid md:grid-cols-3 gap-3">
                          {[
                            { id: 'private', name: 'Private', desc: '🔒 Only you can access the code (recommended)' },
                            { id: 'public', name: 'Public', desc: '🌍 Open source, anyone can view and contribute' },
                            { id: 'organization', name: 'Organization', desc: '👥 Under your GitHub organization account' }
                          ].map((access) => (
                            <div
                              key={access.id}
                              onClick={() => setOrderForm(prev => ({ ...prev, repositoryAccess: access.id as any }))}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                orderForm.repositoryAccess === access.id
                                  ? 'border-purple-500 bg-purple-500/20'
                                  : 'border-white/20 bg-white/10 hover:bg-white/20'
                              }`}
                            >
                              <h4 className="text-white font-medium text-sm">{access.name}</h4>
                              <p className="text-white/60 text-xs mt-1">{access.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <h4 className="text-blue-300 font-medium mb-2">🚀 What you'll get:</h4>
                        <ul className="text-blue-200 text-sm space-y-1">
                          <li>• Complete source code with documentation</li>
                          <li>• Automated CI/CD pipeline with GitHub Actions</li>
                          <li>• Vercel deployment configuration</li>
                          <li>• Environment variables template</li>
                          <li>• README with setup instructions</li>
                          <li>• Issue templates and contribution guidelines</li>
                        </ul>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Additional Options</label>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={orderForm.domainRequired}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, domainRequired: e.target.checked }))}
                            className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                          />
                          <span className="text-white">Custom domain setup required (+$50)</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={orderForm.sslRequired}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, sslRequired: e.target.checked }))}
                            className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                          />
                          <span className="text-white">SSL certificate setup (recommended)</span>
                        </label>
                      </div>
                    </div>

                    {/* Data Region */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Data Region & Compliance</label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <select
                            value={orderForm.dataRegion}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, dataRegion: e.target.value as any }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="us">United States</option>
                            <option value="eu">European Union</option>
                            <option value="asia">Asia Pacific</option>
                            <option value="global">Global (Multi-region)</option>
                          </select>
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {['GDPR', 'HIPAA', 'SOC2', 'PCI DSS'].map((compliance) => (
                              <button
                                key={compliance}
                                onClick={() => {
                                  setOrderForm(prev => ({
                                    ...prev,
                                    complianceRequirements: prev.complianceRequirements.includes(compliance)
                                      ? prev.complianceRequirements.filter(c => c !== compliance)
                                      : [...prev.complianceRequirements, compliance]
                                  }));
                                }}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                  orderForm.complianceRequirements.includes(compliance)
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                    : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                                }`}
                              >
                                {compliance}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(5)}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                      >
                        Next: Timeline & Delivery →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Timeline & Delivery */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Timeline & Delivery Options</h2>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Timeline Selection */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Delivery Timeline</label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {getAvailableTimelines().map(([timelineKey, config]) => (
                          <div
                            key={timelineKey}
                            onClick={() => setOrderForm(prev => ({ ...prev, timeline: timelineKey as '24h' | '3d' | '1w' | '2w' }))}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              orderForm.timeline === timelineKey
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-white/20 bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="text-white font-medium">{TIMELINE_NAMES[timelineKey as keyof typeof TIMELINE_NAMES]}</h3>
                              <span className="text-purple-300 font-semibold">
                                {config.multiplier > 1 ? `+${Math.round((config.multiplier - 1) * 100)}%` : 
                                 config.multiplier < 1 ? `-${Math.round((1 - config.multiplier) * 100)}%` : 
                                 'Standard'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Method */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Delivery Method</label>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div
                          onClick={() => setOrderForm(prev => ({ ...prev, deliveryMethod: 'github' }))}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            orderForm.deliveryMethod === 'github'
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          <h3 className="text-white font-medium">GitHub Repository</h3>
                          <p className="text-white/60 text-sm mt-1">Private repo with full source code</p>
                        </div>
                        <div
                          onClick={() => setOrderForm(prev => ({ ...prev, deliveryMethod: 'zip' }))}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            orderForm.deliveryMethod === 'zip'
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          <h3 className="text-white font-medium">ZIP Download</h3>
                          <p className="text-white/60 text-sm mt-1">Downloadable source code package</p>
                        </div>
                        <div
                          onClick={() => setOrderForm(prev => ({ ...prev, deliveryMethod: 'deployed' }))}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            orderForm.deliveryMethod === 'deployed'
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          <h3 className="text-white font-medium">Live Deployment</h3>
                          <p className="text-white/60 text-sm mt-1">Ready-to-use hosted application</p>
                        </div>
                      </div>
                    </div>

                    {/* Project Management & Communication */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Project Management & Communication</label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Meeting Preference</label>
                          <select
                            value={orderForm.meetingPreference}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, meetingPreference: e.target.value as any }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="none">No meetings required</option>
                            <option value="kickoff">Kickoff meeting only</option>
                            <option value="weekly">Weekly check-ins</option>
                            <option value="milestone-based">Milestone-based meetings</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Revision Rounds Included</label>
                          <select
                            value={orderForm.revisionRounds}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, revisionRounds: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value={1}>1 revision round</option>
                            <option value={2}>2 revision rounds</option>
                            <option value={3}>3 revision rounds (+$200)</option>
                            <option value={5}>5 revision rounds (+$500)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Collaboration Options */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Collaboration Preferences</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Client Collaboration Level</label>
                          <select
                            value={orderForm.clientCollaboration}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, clientCollaboration: e.target.value as any }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="minimal">Minimal (Updates only)</option>
                            <option value="regular">Regular (Weekly updates)</option>
                            <option value="intensive">Intensive (Daily collaboration)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Preferred Project Management Tool</label>
                          <select
                            value={orderForm.projectManagementTool}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, projectManagementTool: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="slack">Slack</option>
                            <option value="discord">Discord</option>
                            <option value="trello">Trello</option>
                            <option value="asana">Asana</option>
                            <option value="notion">Notion</option>
                            <option value="linear">Linear</option>
                            <option value="email">Email Only</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-white text-sm font-medium mb-2">Feedback Mechanisms</label>
                        <div className="grid md:grid-cols-3 gap-2">
                          {['Live Demos', 'Video Reviews', 'Screen Recording', 'Written Feedback', 'Voice Notes', 'In-app Comments', 'Version Comparison', 'Interactive Prototypes'].map((feedback) => (
                            <button
                              key={feedback}
                              onClick={() => {
                                setOrderForm(prev => ({
                                  ...prev,
                                  feedbackMechanism: prev.feedbackMechanism.includes(feedback)
                                    ? prev.feedbackMechanism.filter(f => f !== feedback)
                                    : [...prev.feedbackMechanism, feedback]
                                }));
                              }}
                              className={`p-3 rounded-lg text-sm transition-colors ${
                                orderForm.feedbackMechanism.includes(feedback)
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                                  : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                              }`}
                            >
                              {feedback}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Special Requirements */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Special Requirements & Notes</label>
                      <textarea
                        value={orderForm.specialRequirements}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, specialRequirements: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Any specific technical requirements, integrations, customizations, or important details we should know..."
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(6)}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                      >
                        Review Order →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Review & Payment */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Review & Payment</h2>
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Comprehensive Order Summary */}
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Complete Order Summary</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-white font-medium">Customer & Business</h4>
                          <div className="space-y-1 text-sm text-white/80">
                            <div className="flex justify-between">
                              <span>Name:</span>
                              <span className="text-white">{orderForm.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Email:</span>
                              <span className="text-white">{orderForm.customerEmail}</span>
                            </div>
                            {orderForm.company && (
                              <div className="flex justify-between">
                                <span>Company:</span>
                                <span className="text-white">{orderForm.company}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Business Type:</span>
                              <span className="text-white capitalize">{orderForm.businessType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Industry:</span>
                              <span className="text-white capitalize">{orderForm.industry}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-white font-medium">Project Details</h4>
                          <div className="space-y-1 text-sm text-white/80">
                            <div className="flex justify-between">
                              <span>App Name:</span>
                              <span className="text-white">{orderForm.appName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Project Type:</span>
                              <span className="text-white capitalize">{orderForm.projectType.replace('-', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Complexity:</span>
                              <span className="text-white capitalize">{orderForm.complexity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Framework:</span>
                              <span className="text-white">{frameworks.find(f => f.id === orderForm.framework)?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Database:</span>
                              <span className="text-white capitalize">{orderForm.database}</span>
                            </div>
                            {orderForm.mobileFirst && (
                              <div className="flex justify-between">
                                <span>Mobile-First:</span>
                                <span className="text-green-400">✓ Yes</span>
                              </div>
                            )}
                            {orderForm.pwaRequirements && (
                              <div className="flex justify-between">
                                <span>PWA Support:</span>
                                <span className="text-green-400">✓ Yes</span>
                              </div>
                            )}
                            {orderForm.seoRequirements && (
                              <div className="flex justify-between">
                                <span>SEO Optimized:</span>
                                <span className="text-green-400">✓ Yes</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-white font-medium">Features & Technology</h4>
                          <div className="text-sm text-white/80">
                            <div className="mb-2">
                              <span>Total Features: </span>
                              <span className="text-white">{orderForm.features.length + currentTier.features.includedFeatures.length}</span>
                            </div>
                            {orderForm.thirdPartyIntegrations.length > 0 && (
                              <div className="mb-2">
                                <span>Integrations: </span>
                                <span className="text-white">{orderForm.thirdPartyIntegrations.length} selected</span>
                              </div>
                            )}
                            {orderForm.realtimeFeatures.length > 0 && (
                              <div className="mb-2">
                                <span>Real-time Features: </span>
                                <span className="text-white">{orderForm.realtimeFeatures.length} selected</span>
                              </div>
                            )}
                            {orderForm.aiIntegration.length > 0 && (
                              <div className="mb-2">
                                <span>AI Features: </span>
                                <span className="text-purple-400">{orderForm.aiIntegration.length} selected</span>
                              </div>
                            )}
                            {orderForm.blockchainFeatures.length > 0 && (
                              <div className="mb-2">
                                <span>Web3 Features: </span>
                                <span className="text-blue-400">{orderForm.blockchainFeatures.length} selected</span>
                              </div>
                            )}
                            {orderForm.webRTCFeatures.length > 0 && (
                              <div className="mb-2">
                                <span>Communication: </span>
                                <span className="text-green-400">{orderForm.webRTCFeatures.length} selected</span>
                              </div>
                            )}
                            <div className="mb-2">
                              <span>Code Quality: </span>
                              <span className="text-white capitalize">{orderForm.codeQualityLevel}</span>
                            </div>
                            <div>
                              <span>Documentation: </span>
                              <span className="text-white capitalize">{orderForm.documentationLevel}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-white font-medium">Delivery & Collaboration</h4>
                          <div className="space-y-1 text-sm text-white/80">
                            <div className="flex justify-between">
                              <span>Timeline:</span>
                              <span className="text-white">{TIMELINE_NAMES[orderForm.timeline]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Method:</span>
                              <span className="text-white capitalize">{orderForm.deliveryMethod.replace('-', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Hosting:</span>
                              <span className="text-white capitalize">{orderForm.hostingPreference.replace('-', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revision Rounds:</span>
                              <span className="text-white">{orderForm.revisionRounds}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Collaboration:</span>
                              <span className="text-white capitalize">{orderForm.clientCollaboration.replace('-', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Project Tool:</span>
                              <span className="text-white capitalize">{orderForm.projectManagementTool}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {orderForm.specialRequirements && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <h4 className="text-white font-medium mb-2">Special Requirements</h4>
                          <p className="text-white/80 text-sm">{orderForm.specialRequirements}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep(5)}
                        className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Processing...' : `Pay $${currentPrice} & Place Order`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Price Summary</h3>
              
              <div className="space-y-3 text-white/80">
                <div className="flex justify-between">
                  <span>Base Price ({orderForm.complexity}):</span>
                  <span className="text-white">${currentTier.basePrice}</span>
                </div>
                
                {orderForm.features.length > 0 && (
                  <div>
                    <div className="text-sm text-white/60 mb-1">Add-on Features:</div>
                    {orderForm.features.map(feature => {
                      const addon = FEATURE_ADDONS[feature];
                      if (addon && !currentTier.features.includedFeatures.includes(feature)) {
                        return (
                          <div key={feature} className="flex justify-between text-sm ml-2">
                            <span>{feature}:</span>
                            <span className="text-white">+${addon.price}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Timeline Modifier:</span>
                  <span className="text-white">
                    {currentTier.timeline[orderForm.timeline].multiplier > 1 ? '+' : ''}
                    {Math.round((currentTier.timeline[orderForm.timeline].multiplier - 1) * 100)}%
                  </span>
                </div>
                
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Total:</span>
                    <span className="text-purple-300">${currentPrice}</span>
                  </div>
                </div>
              </div>

              {/* Tier Benefits */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <h4 className="text-white font-semibold mb-3">Included with {orderForm.complexity}:</h4>
                <ul className="space-y-1 text-sm text-white/80">
                  {currentTier.deliverables.map((deliverable) => (
                    <li key={deliverable} className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
