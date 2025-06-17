import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Simple auth check (in production, use proper authentication)
    if (email === 'admin@example.com' && password === 'admin123') {
      return NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        user: { email, role: 'admin' }
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Invalid credentials' 
    }, { status: 401 });

  } catch (error: unknown) {
    console.error('Auth error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication failed' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: false, 
    message: 'Method not allowed' 
  }, { status: 405 });
}