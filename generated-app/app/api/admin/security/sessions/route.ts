import { NextRequest, NextResponse } from 'next/server';

// Mock active sessions data
let mockActiveSessions = [
  {
    id: 'session_1',
    adminId: 'admin_1',
    adminEmail: 'admin@ece-cli.com',
    role: 'Super Admin',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    loginTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    lastActivity: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    location: 'San Francisco, CA',
    isCurrentSession: true
  },
  {
    id: 'session_2',
    adminId: 'admin_2',
    adminEmail: 'support@ece-cli.com',
    role: 'Support',
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    loginTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    lastActivity: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    location: 'New York, NY',
    isCurrentSession: false
  },
  {
    id: 'session_3',
    adminId: 'admin_3',
    adminEmail: 'finance@ece-cli.com',
    role: 'Finance',
    ipAddress: '172.16.0.25',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    loginTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    lastActivity: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    location: 'Chicago, IL',
    isCurrentSession: false
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real app, verify admin authentication and high-level permissions
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'list':
      default:
        return NextResponse.json({
          success: true,
          sessions: mockActiveSessions,
          total: mockActiveSessions.length
        });
    }
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, params } = body;

    switch (action) {
      case 'revoke':
        const sessionIndex = mockActiveSessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Session not found' },
            { status: 404 }
          );
        }

        const session = mockActiveSessions[sessionIndex];
        
        // Prevent revoking current session (would logout the admin making the request)
        if (session.isCurrentSession) {
          return NextResponse.json(
            { success: false, error: 'Cannot revoke your current session' },
            { status: 400 }
          );
        }

        // Remove the session
        mockActiveSessions.splice(sessionIndex, 1);

        // In a real app, you would:
        // 1. Remove the session from your session store (Redis, database, etc.)
        // 2. Add the session ID to a blacklist
        // 3. Optionally send a notification to the affected admin

        return NextResponse.json({
          success: true,
          message: 'Session revoked successfully'
        });

      case 'revoke_all':
        // Revoke all sessions except the current one
        const currentSessionCount = mockActiveSessions.length;
        mockActiveSessions = mockActiveSessions.filter(s => s.isCurrentSession);

        return NextResponse.json({
          success: true,
          message: `Revoked ${currentSessionCount - mockActiveSessions.length} sessions`,
          revokedCount: currentSessionCount - mockActiveSessions.length
        });

      case 'extend':
        // Extend session expiration time
        const extendIndex = mockActiveSessions.findIndex(s => s.id === sessionId);
        if (extendIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Session not found' },
            { status: 404 }
          );
        }

        // Update last activity to extend the session
        mockActiveSessions[extendIndex].lastActivity = new Date().toISOString();

        return NextResponse.json({
          success: true,
          message: 'Session extended successfully'
        });

      case 'update_activity':
        // Update the last activity timestamp for a session
        const updateIndex = mockActiveSessions.findIndex(s => s.id === sessionId);
        if (updateIndex !== -1) {
          mockActiveSessions[updateIndex].lastActivity = new Date().toISOString();
        }

        return NextResponse.json({
          success: true,
          message: 'Activity updated'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Emergency endpoint to revoke all sessions (Super Admin only)
    const { searchParams } = new URL(request.url);
    const emergency = searchParams.get('emergency');

    if (emergency === 'true') {
      // Keep only current session for emergency situations
      const currentSessionCount = mockActiveSessions.length;
      mockActiveSessions = mockActiveSessions.filter(s => s.isCurrentSession);

      return NextResponse.json({
        success: true,
        message: 'Emergency session revocation completed',
        revokedCount: currentSessionCount - mockActiveSessions.length
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
