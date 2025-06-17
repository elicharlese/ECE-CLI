import { NextRequest } from 'next/server';

// Rate limiting for admin login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

// Session management with enhanced security
interface AdminSession {
  id: string;
  email: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  permissions: string[];
}

const adminSessions: Map<string, AdminSession> = new Map();

// Audit log for admin actions
interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

const auditLogs: AuditLog[] = [];

export const ADMIN_PERMISSIONS = {
  VIEW_ORDERS: 'view_orders',
  UPDATE_ORDERS: 'update_orders',
  VIEW_CUSTOMERS: 'view_customers',
  MANAGE_REFUNDS: 'manage_refunds',
  VIEW_ANALYTICS: 'view_analytics',
  SYSTEM_ADMIN: 'system_admin'
} as const;

export const DEFAULT_ADMIN_PERMISSIONS = [
  ADMIN_PERMISSIONS.VIEW_ORDERS,
  ADMIN_PERMISSIONS.UPDATE_ORDERS,
  ADMIN_PERMISSIONS.VIEW_CUSTOMERS,
  ADMIN_PERMISSIONS.MANAGE_REFUNDS,
  ADMIN_PERMISSIONS.VIEW_ANALYTICS,
  ADMIN_PERMISSIONS.SYSTEM_ADMIN
];

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const key = `login_${ip}`;
  const now = new Date();
  const attempt = loginAttempts.get(key);

  if (!attempt) {
    loginAttempts.set(key, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Reset counter if more than 15 minutes have passed
  if (now.getTime() - attempt.lastAttempt.getTime() > 15 * 60 * 1000) {
    loginAttempts.set(key, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Allow max 5 attempts per 15 minutes
  if (attempt.count >= 5) {
    const retryAfter = Math.ceil((15 * 60 * 1000 - (now.getTime() - attempt.lastAttempt.getTime())) / 1000);
    return { allowed: false, retryAfter };
  }

  attempt.count++;
  attempt.lastAttempt = now;
  return { allowed: true };
}

export function createAdminSession(
  email: string,
  ipAddress: string,
  userAgent: string,
  permissions: string[] = DEFAULT_ADMIN_PERMISSIONS
): string {
  const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const now = new Date();

  adminSessions.set(sessionId, {
    id: sessionId,
    email,
    loginTime: now,
    lastActivity: now,
    ipAddress,
    userAgent,
    permissions
  });

  // Log admin login
  logAdminAction(email, 'LOGIN', 'Admin logged in successfully', ipAddress, userAgent);

  return sessionId;
}

export function validateAdminSession(sessionId: string, ipAddress: string, userAgent: string): AdminSession | null {
  const session = adminSessions.get(sessionId);
  if (!session) return null;

  const now = new Date();
  const sessionAge = now.getTime() - session.loginTime.getTime();
  const inactivityTime = now.getTime() - session.lastActivity.getTime();

  // Session expires after 24 hours or 2 hours of inactivity
  if (sessionAge > 24 * 60 * 60 * 1000 || inactivityTime > 2 * 60 * 60 * 1000) {
    adminSessions.delete(sessionId);
    return null;
  }

  // Additional security: check IP and user agent consistency
  if (session.ipAddress !== ipAddress || session.userAgent !== userAgent) {
    adminSessions.delete(sessionId);
    logAdminAction(session.email, 'SECURITY_VIOLATION', 'Session hijacking attempt detected', ipAddress, userAgent);
    return null;
  }

  // Update last activity
  session.lastActivity = now;
  return session;
}

export function hasPermission(session: AdminSession, permission: string): boolean {
  return session.permissions.includes(permission) || session.permissions.includes(ADMIN_PERMISSIONS.SYSTEM_ADMIN);
}

export function logAdminAction(
  adminEmail: string,
  action: string,
  details: string,
  ipAddress: string,
  userAgent: string
): void {
  const logEntry: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    adminEmail,
    action,
    details,
    timestamp: new Date(),
    ipAddress,
    userAgent
  };

  auditLogs.push(logEntry);

  // Keep only last 1000 log entries to prevent memory issues
  if (auditLogs.length > 1000) {
    auditLogs.shift();
  }
}

export function getAuditLogs(limit = 100, offset = 0): AuditLog[] {
  return auditLogs
    .slice()
    .reverse()
    .slice(offset, offset + limit);
}

export function revokeAdminSession(sessionId: string): void {
  const session = adminSessions.get(sessionId);
  if (session) {
    logAdminAction(session.email, 'LOGOUT', 'Admin session revoked', session.ipAddress, session.userAgent);
    adminSessions.delete(sessionId);
  }
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

export function getActiveSessions(): AdminSession[] {
  return Array.from(adminSessions.values());
}

export function cleanupExpiredSessions(): void {
  const now = new Date();
  for (const [sessionId, session] of adminSessions.entries()) {
    const sessionAge = now.getTime() - session.loginTime.getTime();
    const inactivityTime = now.getTime() - session.lastActivity.getTime();
    
    if (sessionAge > 24 * 60 * 60 * 1000 || inactivityTime > 2 * 60 * 60 * 1000) {
      adminSessions.delete(sessionId);
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupExpiredSessions, 30 * 60 * 1000);
