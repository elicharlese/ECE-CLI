import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminSession,
  hasPermission,
  logAdminAction,
  getClientIP,
  getActiveSessions,
  revokeAdminSession,
  getAuditLogs,
  ADMIN_PERMISSIONS
} from '@/utils/admin-security';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const sessionId = request.cookies.get('admin_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const session = validateAdminSession(sessionId, ipAddress, userAgent);

    if (!session) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }

    if (!hasPermission(session, ADMIN_PERMISSIONS.SYSTEM_ADMIN)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'sessions') {
      // Get active sessions
      const activeSessions = getActiveSessions().map(s => ({
        id: s.id,
        email: s.email,
        loginTime: s.loginTime.toISOString(),
        lastActivity: s.lastActivity.toISOString(),
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        isCurrentSession: s.id === sessionId
      }));

      return NextResponse.json({
        sessions: activeSessions,
        total: activeSessions.length
      });
    }

    if (action === 'audit') {
      // Get audit logs
      const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
      const offset = parseInt(searchParams.get('offset') || '0');
      const auditLogs = getAuditLogs(limit, offset);

      return NextResponse.json({
        logs: auditLogs,
        pagination: {
          limit,
          offset,
          hasMore: auditLogs.length === limit
        }
      });
    }

    // Default: return system info
    const systemInfo = {
      currentSession: {
        id: session.id,
        email: session.email,
        loginTime: session.loginTime.toISOString(),
        lastActivity: session.lastActivity.toISOString(),
        permissions: session.permissions
      },
      activeSessions: getActiveSessions().length,
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Log admin action
    logAdminAction(
      session.email,
      'VIEW_SYSTEM_INFO',
      'Viewed system information',
      ipAddress,
      userAgent
    );

    return NextResponse.json(systemInfo);

  } catch (error) {
    console.error('Admin system fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const sessionId = request.cookies.get('admin_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const session = validateAdminSession(sessionId, ipAddress, userAgent);

    if (!session) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }

    if (!hasPermission(session, ADMIN_PERMISSIONS.SYSTEM_ADMIN)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetSessionId = searchParams.get('sessionId');

    if (!targetSessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (targetSessionId === sessionId) {
      return NextResponse.json({ error: 'Cannot revoke your own session' }, { status: 400 });
    }

    // Revoke the target session
    revokeAdminSession(targetSessionId);

    // Log admin action
    logAdminAction(
      session.email,
      'REVOKE_SESSION',
      `Revoked admin session ${targetSessionId}`,
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully'
    });

  } catch (error) {
    console.error('Admin session revoke error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
