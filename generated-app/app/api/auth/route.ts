import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const authRequestSchema = z.object({
  provider: z.enum(['demo', 'google', 'phantom', 'solflare']),
  email: z.string().email().optional(),
  walletAddress: z.string().min(10).optional(),
}).refine(
  (data) => {
    // Email required for google provider
    if (data.provider === 'google' && !data.email) return false;
    // Wallet address required for wallet providers
    if (['phantom', 'solflare'].includes(data.provider) && !data.walletAddress) return false;
    return true;
  },
  {
    message: "Email required for Google provider, wallet address required for wallet providers",
  }
);

const sessionValidationSchema = z.object({
  authorization: z.string().min(1),
});

// Mock user database
const mockUsers = [
  { id: '1', email: 'demo@example.com', name: 'Demo User' },
  { id: '2', email: 'admin@ece-cli.com', name: 'ECE Admin' }
];

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validatedData = authRequestSchema.parse(rawBody);
    
    const { provider, email, walletAddress } = validatedData;

    // Mock authentication logic
    let user;
    
    if (provider === 'demo') {
      user = { 
        id: 'demo', 
        email: 'demo@ece-cli.com', 
        name: 'Demo User', 
        provider: 'demo' 
      };
    } else if (provider === 'google') {
      user = mockUsers.find(u => u.email === email) || {
        id: Date.now().toString(),
        email: email!,
        name: email!.split('@')[0],
        provider: 'google'
      };
    } else if (provider === 'phantom' || provider === 'solflare') {
      user = {
        id: Date.now().toString(),
        walletAddress,
        name: `${provider} User`,
        provider
      };
    }

    // Mock session creation
    const session = {
      id: Date.now().toString(),
      userId: user!.id,
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

    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const validatedHeaders = sessionValidationSchema.parse({
      authorization: authHeader
    });

    const sessionId = validatedHeaders.authorization.replace('Bearer ', '');
    
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

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request headers' },
        { status: 400 }
      );
    }

    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
