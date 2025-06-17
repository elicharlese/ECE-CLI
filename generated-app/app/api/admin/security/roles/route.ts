import { NextRequest, NextResponse } from 'next/server';
import { AdminRole } from '@/types/admin';

// Mock data for demonstration
const mockRoles: AdminRole[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: ['*'],
    level: 10,
    adminCount: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Standard admin access for day-to-day operations',
    permissions: ['orders.manage', 'customers.view', 'customers.edit', 'analytics.view', 'apps.manage'],
    level: 7,
    adminCount: 3,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Support',
    description: 'Customer support with limited access',
    permissions: ['orders.view', 'customers.view', 'customers.edit_notes'],
    level: 3,
    adminCount: 2,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Finance',
    description: 'Financial operations and analytics access',
    permissions: ['analytics.view', 'financial.manage', 'orders.refund'],
    level: 5,
    adminCount: 1,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real app, verify admin authentication and permissions
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'list':
      default:
        return NextResponse.json({
          success: true,
          roles: mockRoles
        });
    }
  } catch (error) {
    console.error('Roles API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    switch (action) {
      case 'create':
        const newRole: AdminRole = {
          id: Date.now().toString(),
          name: params.name,
          description: params.description,
          permissions: params.permissions,
          level: params.level,
          adminCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        mockRoles.push(newRole);

        return NextResponse.json({
          success: true,
          role: newRole,
          message: 'Role created successfully'
        });

      case 'update':
        const roleIndex = mockRoles.findIndex(r => r.id === params.id);
        if (roleIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Role not found' },
            { status: 404 }
          );
        }

        mockRoles[roleIndex] = {
          ...mockRoles[roleIndex],
          name: params.name,
          description: params.description,
          permissions: params.permissions,
          level: params.level,
          updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          role: mockRoles[roleIndex],
          message: 'Role updated successfully'
        });

      case 'delete':
        const deleteIndex = mockRoles.findIndex(r => r.id === params.id);
        if (deleteIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Role not found' },
            { status: 404 }
          );
        }

        // Prevent deletion of Super Admin role
        if (mockRoles[deleteIndex].name === 'Super Admin') {
          return NextResponse.json(
            { success: false, error: 'Cannot delete Super Admin role' },
            { status: 400 }
          );
        }

        mockRoles.splice(deleteIndex, 1);

        return NextResponse.json({
          success: true,
          message: 'Role deleted successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Roles API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
