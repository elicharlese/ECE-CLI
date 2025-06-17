import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminUser, AdminSession, AuditLog } from '@/types/admin';

// Enhanced validation schemas
const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  twoFactorCode: z.string().optional(),
  rememberMe: z.boolean().optional()
});

const adminRoleSchema = z.object({
  adminId: z.string(),
  role: z.enum(['super_admin', 'admin', 'manager', 'support']),
  permissions: z.array(z.object({
    resource: z.string(),
    actions: z.array(z.enum(['create', 'read', 'update', 'delete', 'manage']))
  }))
});

// Mock admin database with enhanced security
const mockAdmins: AdminUser[] = [
  {
    id: 'admin-1',
    email: process.env.ADMIN_EMAIL || 'admin@ece-cli.com',
    name: 'ECE Admin',
    role: 'super_admin',
    permissions: [
      { 
        id: 'super-admin-all',
        name: 'Super Admin All Access',
        description: 'Full access to all resources',
        category: 'system',
        level: 100,
        resource: '*', 
        actions: ['create', 'read', 'update', 'delete', 'manage'] 
      }
    ],
    loginTime: new Date().toISOString(),
    lastLoginTime: undefined,
    loginAttempts: 0,
    isLocked: false,
    twoFactorEnabled: false,
    sessionExpiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  }
];

// Mock session storage
const mockSessions: AdminSession[] = [];
const mockAuditLogs: AuditLog[] = [];

// Security utilities
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

function generateSecureToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function getClientInfo(request: NextRequest) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  };
}

function createAuditLog(
  adminId: string,
  adminEmail: string,
  action: string,
  resource: string,
  details: Record<string, any>,
  request: NextRequest,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): AuditLog {
  const { ipAddress, userAgent } = getClientInfo(request);
  
  const auditLog: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    adminId,
    adminEmail,
    action,
    resource,
    details,
    ipAddress,
    userAgent,
    timestamp: new Date().toISOString(),
    severity
  };

  mockAuditLogs.unshift(auditLog);
  
  // Keep only last 1000 audit logs in memory
  if (mockAuditLogs.length > 1000) {
    mockAuditLogs.splice(1000);
  }

  return auditLog;
}

function validateSession(sessionToken: string): AdminSession | null {
  const session = mockSessions.find(s => s.token === sessionToken && s.isActive);
  
  if (!session) return null;
  
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  const lastActivity = new Date(session.lastActivity);
  
  // Check if session is expired
  if (now > expiresAt) {
    session.isActive = false;
    return null;
  }
  
  // Check for inactivity timeout
  if (now.getTime() - lastActivity.getTime() > INACTIVITY_TIMEOUT) {
    session.isActive = false;
    return null;
  }
  
  // Update last activity
  session.lastActivity = now.toISOString();
  
  return session;
}

function hasPermission(admin: AdminUser, resource: string, action: string): boolean {
  // Super admin has all permissions
  if (admin.role === 'super_admin') return true;
  
  // Check specific permissions
  return admin.permissions.some(permission => 
    (permission.resource === '*' || permission.resource === resource) &&
    permission.actions.includes(action as any)
  );
}

// Admin Authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, twoFactorCode, rememberMe } = adminLoginSchema.parse(body);
    const { ipAddress, userAgent } = getClientInfo(request);

    // Find admin
    const admin = mockAdmins.find(a => a.email === email);
    
    if (!admin) {
      // Create audit log for failed login attempt
      createAuditLog(
        'unknown',
        email,
        'login_failed',
        'admin_auth',
        { reason: 'user_not_found', email },
        request,
        'high'
      );
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (admin.isLocked) {
      createAuditLog(
        admin.id,
        admin.email,
        'login_blocked',
        'admin_auth',
        { reason: 'account_locked' },
        request,
        'high'
      );
      
      return NextResponse.json(
        { error: 'Account is locked. Please contact system administrator.' },
        { status: 423 }
      );
    }

    // Simple password check (in production, use proper hashing)
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      admin.loginAttempts += 1;
      
      // Lock account after max attempts
      if (admin.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        admin.isLocked = true;
        
        createAuditLog(
          admin.id,
          admin.email,
          'account_locked',
          'admin_auth',
          { loginAttempts: admin.loginAttempts },
          request,
          'critical'
        );
      }
      
      createAuditLog(
        admin.id,
        admin.email,
        'login_failed',
        'admin_auth',
        { reason: 'invalid_password', attempts: admin.loginAttempts },
        request,
        'high'
      );
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Two-factor authentication check (if enabled)
    if (admin.twoFactorEnabled && !twoFactorCode) {
      return NextResponse.json(
        { requiresTwoFactor: true },
        { status: 200 }
      );
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lastLoginTime = admin.loginTime;
    admin.loginTime = new Date().toISOString();

    // Create session
    const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : SESSION_DURATION; // 30 days if remember me
    const sessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + sessionDuration);

    const session: AdminSession = {
      id: `session-${Date.now()}`,
      adminId: admin.id,
      token: sessionToken,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      lastActivity: new Date().toISOString()
    };

    mockSessions.push(session);

    // Create audit log for successful login
    createAuditLog(
      admin.id,
      admin.email,
      'login_success',
      'admin_auth',
      { sessionId: session.id, rememberMe },
      request,
      'low'
    );

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        twoFactorEnabled: admin.twoFactorEnabled
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt
      }
    });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: sessionDuration / 1000,
      path: '/'
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(e => ({ 
            field: e.path.join('.'), 
            message: e.message 
          }))
        },
        { status: 400 }
      );
    }

    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Session Validation
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value ||
                        request.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      );
    }

    const session = validateSession(sessionToken);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const admin = mockAdmins.find(a => a.id === session.adminId);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        twoFactorEnabled: admin.twoFactorEnabled
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
        lastActivity: session.lastActivity
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 500 }
    );
  }
}

// Admin Logout
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value ||
                        request.headers.get('authorization')?.replace('Bearer ', '');

    if (sessionToken) {
      const session = mockSessions.find(s => s.token === sessionToken);
      
      if (session) {
        session.isActive = false;
        
        const admin = mockAdmins.find(a => a.id === session.adminId);
        
        if (admin) {
          createAuditLog(
            admin.id,
            admin.email,
            'logout',
            'admin_auth',
            { sessionId: session.id },
            request,
            'low'
          );
        }
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');
    
    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
