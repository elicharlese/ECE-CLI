// Enhanced Admin Types with Security and Advanced Features

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'support';
  permissions: AdminPermission[];
  loginTime: string;
  lastLoginTime?: string;
  loginAttempts: number;
  isLocked: boolean;
  twoFactorEnabled: boolean;
  sessionExpiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number; // 1-10, where 10 is highest privilege
  adminCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  category: string;
  level: number; // Required access level
  resource: string;
  actions: string[];
}

export interface AdminSession {
  id: string;
  adminId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  lastActivity: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  database: {
    status: 'connected' | 'disconnected';
    responseTime: number;
    connections: number;
  };
  api: {
    status: 'operational' | 'degraded' | 'down';
    responseTime: number;
    errorRate: number;
  };
  stripe: {
    status: 'operational' | 'issues';
    webhookHealth: 'healthy' | 'failing';
    lastWebhookReceived: string;
  };
  builds: {
    active: number;
    queued: number;
    failed: number;
    successRate: number;
  };
}

export interface CustomerProfile {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive' | 'vip' | 'blocked';
  totalOrders: number;
  totalSpent: number;
  lifetimeValue: number;
  averageOrderValue: number;
  lastOrderDate: string;
  firstOrderDate: string;
  createdAt: string;
  tags: string[];
  notes: CustomerNote[];
}

export interface CustomerNote {
  id: string;
  content: string;
  adminId: string;
  adminName: string;
  createdAt: string;
  isPrivate: boolean;
}

export interface AppManagement {
  id: string;
  orderId: string;
  customerId: string;
  name: string;
  description: string;
  framework: string;
  complexity: string;
  status: 'building' | 'testing' | 'deployed' | 'failed' | 'archived';
  buildProgress: number;
  buildLogs: BuildLog[];
  features: string[];
  repository?: {
    url: string;
    branch: string;
    lastCommit: string;
    isPrivate: boolean;
  };
  deployment?: {
    url: string;
    status: 'active' | 'inactive' | 'failed';
    lastDeployment: string;
    environment: 'development' | 'staging' | 'production';
  };
  monitoring: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    lastCheck: string;
  };
  security: {
    lastSecurityScan: string;
    vulnerabilities: SecurityVulnerability[];
    sslExpiry?: string;
  };
  maintenance: {
    lastUpdate: string;
    nextScheduledMaintenance?: string;
    maintenanceNotes: string[];
  };
  performance: {
    pageSpeed: number;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  analytics: {
    visits: number;
    users: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  backups: AppBackup[];
  createdAt: string;
  updatedAt: string;
}

export interface BuildLog {
  id: string;
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  message: string;
  details?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  affected: string;
  solution: string;
  discoveredAt: string;
  fixedAt?: string;
}

export interface AppBackup {
  id: string;
  type: 'manual' | 'scheduled' | 'pre-deployment';
  size: number;
  status: 'creating' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt: string;
  createdAt: string;
}

export interface FinancialAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    lastYear: number;
    growth: {
      monthly: number;
      yearly: number;
    };
    forecast: {
      nextMonth: number;
      nextQuarter: number;
    };
  };
  orders: {
    total: number;
    completed: number;
    refunded: number;
    cancelled: number;
    completionRate: number;
    avgOrderValue: number;
    avgProcessingTime: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    churnRate: number;
    lifetimeValue: number;
    acquisitionCost: number;
  };
  expenses: {
    total: number;
    hosting: number;
    thirdPartyServices: number;
    development: number;
    marketing: number;
    support: number;
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    margin: number;
  };
  trends: {
    daily: Array<{ date: string; revenue: number; orders: number }>;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
    frameworks: Array<{ framework: string; orders: number; revenue: number }>;
    complexity: Array<{ level: string; orders: number; revenue: number }>;
  };
}

export interface RefundRequest {
  id: string;
  orderId: string;
  customerId: string;
  customerEmail: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'processed';
  adminNotes?: string;
  processedBy?: string;
  requestedAt: string;
  processedAt?: string;
  stripeRefundId?: string;
}

export interface NotificationConfig {
  id: string;
  type: 'order_created' | 'payment_received' | 'build_completed' | 'build_failed' | 'refund_requested';
  channel: 'email' | 'slack' | 'webhook' | 'sms';
  recipients: string[];
  template: string;
  conditions: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardSettings {
  defaultTab: string;
  refreshInterval: number;
  tablePageSize: number;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    browser: boolean;
    slack: boolean;
  };
  shortcuts: AdminShortcut[];
  widgets: DashboardWidget[];
}

export interface AdminShortcut {
  id: string;
  name: string;
  action: string;
  icon: string;
  hotkey?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'stat' | 'chart' | 'table' | 'metric';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  isVisible: boolean;
}
