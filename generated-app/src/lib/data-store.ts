// In-memory data store for orders
// In production, this would be replaced with a database

export interface OrderData {
  id: string;
  
  // Customer Info
  customerName: string;
  customerEmail: string;
  company?: string;
  phone?: string;
  businessType?: string;
  industry?: string;
  
  // App Details
  appName: string;
  appDescription: string;
  framework: string;
  complexity: 'simple' | 'medium' | 'complex';
  features?: string[];
  database?: string;
  authentication?: string[];
  
  // Project Scope
  projectType?: string;
  targetUsers?: string;
  expectedTraffic?: string;
  platformRequirements?: string[];
  
  // Technical Requirements
  thirdPartyIntegrations?: string[];
  designPreferences?: string;
  brandingRequirements?: string;
  performanceRequirements?: string;
  
  // Hosting & Deployment
  hostingPreference?: string;
  hosting?: string; // Keep for backward compatibility
  domainRequired?: boolean;
  sslRequired?: boolean;
  
  // GitHub & Version Control
  githubUsername?: string;
  repositoryName?: string;
  repositoryAccess?: string;
  
  // Business Options
  timeline?: string;
  deliveryMethod?: string;
  
  // Legal & Compliance
  dataRegion?: string;
  complianceRequirements?: string[];
  
  // Special Requirements
  specialRequirements?: string;
  meetingPreference?: string;
  revisionRounds?: number;
  
  // Pricing & Payment
  price?: number;
  currency?: string;
  totalAmount: number;
  
  // Order Management
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'pending_payment' | 'paid' | 'building' | 'payment_failed' | 'build_failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: string;
  
  // Build & Delivery
  buildProgress?: number;
  buildLogs?: string[];
  buildStartedAt?: string;
  completedAt?: string;
  progress?: number;
  deliveryUrl?: string;
  currentBuildStep?: string;
  
  // Admin Management
  adminNotes?: Array<{ note: string; timestamp: string; admin: string }>;
  adminUrl?: string;
  
  // Deprecated fields (keep for backward compatibility)
  addons?: string[];
}

// In-memory orders storage
export const orders: OrderData[] = [];

// Helper functions
export function addOrder(order: OrderData) {
  orders.push(order);
}

export function findOrderById(id: string): OrderData | undefined {
  return orders.find(order => order.id === id);
}

export function findOrderByStripeSession(sessionId: string): OrderData | undefined {
  return orders.find(order => order.stripeSessionId === sessionId);
}

export function updateOrder(id: string, updates: Partial<OrderData>): OrderData | null {
  const orderIndex = orders.findIndex(order => order.id === id);
  if (orderIndex === -1) return null;
  
  orders[orderIndex] = { ...orders[orderIndex], ...updates, updatedAt: new Date().toISOString() };
  return orders[orderIndex];
}

export function getAllOrders(): OrderData[] {
  return [...orders];
}
