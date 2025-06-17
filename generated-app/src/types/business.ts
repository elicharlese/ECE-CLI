// Order Management Types and Pricing Configuration

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  
  // App Configuration
  appName: string;
  appDescription: string;
  framework: string;
  features: string[];
  complexity: 'simple' | 'medium' | 'complex';
  database: string;
  authentication: string[];
  
  // Business Details
  timeline: '24h' | '3d' | '1w' | '2w';
  rushOrder: boolean;
  price: number;
  currency: string;
  
  // Order Status
  status: 'pending' | 'paid' | 'in_progress' | 'review' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  
  // Delivery
  deliveryMethod: 'github' | 'zip' | 'deployed';
  deliveryUrl?: string;
  repositoryUrl?: string;
  
  // Timestamps
  createdAt: string;
  paidAt?: string;
  startedAt?: string;
  deliveredAt?: string;
  
  // Build Progress
  buildProgress: number;
  buildSteps: string[];
  currentStep?: string;
  
  // Admin Notes
  adminNotes?: string;
  assignedTo?: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  
  // Order History
  totalOrders: number;
  totalSpent: number;
  
  // Timestamps
  createdAt: string;
  lastOrderAt?: string;
  
  // Stripe
  stripeCustomerId?: string;
}

export interface PricingTier {
  complexity: 'simple' | 'medium' | 'complex';
  basePrice: number;
  timeline: {
    '24h': { multiplier: number; available: boolean };
    '3d': { multiplier: number; available: boolean };
    '1w': { multiplier: number; available: boolean };
    '2w': { multiplier: number; available: boolean };
  };
  features: {
    maxFeatures: number;
    includedFeatures: string[];
  };
  deliverables: string[];
}

// Pricing Configuration
export const PRICING_TIERS: Record<string, PricingTier> = {
  simple: {
    complexity: 'simple',
    basePrice: 299,
    timeline: {
      '24h': { multiplier: 2.5, available: true },
      '3d': { multiplier: 1.5, available: true },
      '1w': { multiplier: 1.0, available: true },
      '2w': { multiplier: 0.8, available: true },
    },
    features: {
      maxFeatures: 3,
      includedFeatures: ['User Authentication', 'Basic CRUD', 'Responsive Design'],
    },
    deliverables: ['Source Code', 'Basic Documentation', 'Deployment Guide'],
  },
  medium: {
    complexity: 'medium',
    basePrice: 799,
    timeline: {
      '24h': { multiplier: 2.0, available: false },
      '3d': { multiplier: 1.8, available: true },
      '1w': { multiplier: 1.0, available: true },
      '2w': { multiplier: 0.9, available: true },
    },
    features: {
      maxFeatures: 8,
      includedFeatures: [
        'Advanced Authentication',
        'Database Integration',
        'API Development',
        'Admin Panel',
        'Real-time Features',
      ],
    },
    deliverables: [
      'Source Code',
      'API Documentation',
      'Database Schema',
      'Deployment Guide',
      'Testing Suite',
    ],
  },
  complex: {
    complexity: 'complex',
    basePrice: 1999,
    timeline: {
      '24h': { multiplier: 3.0, available: false },
      '3d': { multiplier: 2.5, available: false },
      '1w': { multiplier: 1.2, available: true },
      '2w': { multiplier: 1.0, available: true },
    },
    features: {
      maxFeatures: 15,
      includedFeatures: [
        'Enterprise Authentication',
        'Multi-database Support',
        'Microservices Architecture',
        'Advanced Admin Panel',
        'Real-time Analytics',
        'Payment Integration',
        'Email System',
        'File Management',
      ],
    },
    deliverables: [
      'Source Code',
      'Complete Documentation',
      'API Documentation',
      'Database Schema',
      'Deployment Guide',
      'Testing Suite',
      'Performance Report',
      'Security Audit',
    ],
  },
};

// Feature Add-ons (additional cost)
export const FEATURE_ADDONS: Record<string, { price: number; timeline: string }> = {
  'Payment Integration': { price: 199, timeline: '+1-2 days' },
  'Advanced Analytics': { price: 149, timeline: '+1 day' },
  'Multi-language Support': { price: 99, timeline: '+1 day' },
  'Mobile App': { price: 499, timeline: '+3-5 days' },
  'Custom Branding': { price: 79, timeline: '+0.5 days' },
  'SEO Optimization': { price: 129, timeline: '+1 day' },
  'Social Media Integration': { price: 89, timeline: '+0.5 days' },
  'Advanced Security': { price: 199, timeline: '+1 day' },
};

// Calculate order price
export function calculateOrderPrice(
  complexity: 'simple' | 'medium' | 'complex',
  timeline: '24h' | '3d' | '1w' | '2w',
  features: string[]
): number {
  const tier = PRICING_TIERS[complexity];
  const basePrice = tier.basePrice;
  const timelineMultiplier = tier.timeline[timeline].multiplier;
  
  // Calculate feature add-ons
  const featurePrice = features.reduce((total, feature) => {
    if (FEATURE_ADDONS[feature] && !tier.features.includedFeatures.includes(feature)) {
      return total + FEATURE_ADDONS[feature].price;
    }
    return total;
  }, 0);
  
  return Math.round((basePrice + featurePrice) * timelineMultiplier);
}

// Timeline display names
export const TIMELINE_NAMES = {
  '24h': '24 Hours (Rush)',
  '3d': '3 Days',
  '1w': '1 Week',
  '2w': '2 Weeks',
};
