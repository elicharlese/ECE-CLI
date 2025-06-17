import { NextRequest, NextResponse } from 'next/server';

// Mock user data
const mockUserData = {
  'demo': {
    id: 'demo',
    email: 'demo@ece-cli.com',
    name: 'Demo User',
    apps: [
      {
        id: 'app1',
        name: 'E-commerce Platform',
        status: 'deployed',
        url: 'https://demo-ecommerce.vercel.app',
        createdAt: '2024-12-15T10:00:00Z'
      },
      {
        id: 'app2',
        name: 'Task Management App',
        status: 'building',
        progress: 75,
        createdAt: '2024-12-15T14:30:00Z'
      }
    ],
    settings: {
      theme: 'dark',
      notifications: true,
      autoDeployment: true
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock user lookup
    const userData = mockUserData['demo']; // In real app, would lookup by session

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionId = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    // Mock user update
    const updatedUser = {
      ...mockUserData['demo'],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
