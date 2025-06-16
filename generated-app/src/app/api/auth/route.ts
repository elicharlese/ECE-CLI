import { NextRequest, NextResponse } from 'next/server';

// Mock user database
const mockUsers = [
  { id: '1', email: 'demo@example.com', name: 'Demo User' },
  { id: '2', email: 'admin@ece-cli.com', name: 'ECE Admin' }
];

export async function POST(request: NextRequest) {
  try {
    const { email, provider, walletAddress } = await request.json();

    // Mock authentication logic
    let user;
    
    if (provider === 'demo') {
      user = { id: 'demo', email: 'demo@ece-cli.com', name: 'Demo User', provider: 'demo' };
    } else if (provider === 'google') {
      user = mockUsers.find(u => u.email === email) || {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        provider: 'google'
      };
    } else if (provider === 'phantom' || provider === 'solflare') {
      user = {
        id: Date.now().toString(),
        walletAddress,
        name: `${provider} User`,
        provider
      };
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Mock session creation
    const session = {
      id: Date.now().toString(),
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date()
    };

    return NextResponse.json({
      success: true,
      user,
      session,
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Mock session validation
  const sessionId = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'No session provided' }, { status: 401 });
  }

  // Mock session lookup
  const mockSession = {
    id: sessionId,
    userId: 'demo',
    user: { id: 'demo', email: 'demo@ece-cli.com', name: 'Demo User' },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isValid: true
  };

  return NextResponse.json({
    success: true,
    session: mockSession
  });
}
