import { NextRequest, NextResponse } from 'next/server';
import { AdminPermission } from '@/types/admin';

// Mock permissions data
const mockPermissions: AdminPermission[] = [
  // Order Management
  {
    id: 'orders.view',
    name: 'View Orders',
    description: 'View all orders and their details',
    category: 'Order Management',
    level: 1,
    resource: 'orders',
    actions: ['read']
  },
  {
    id: 'orders.manage',
    name: 'Manage Orders',
    description: 'Create, update, and manage order status',
    category: 'Order Management',
    level: 5,
    resource: 'orders',
    actions: ['read', 'update', 'delete']
  },
  {
    id: 'orders.refund',
    name: 'Process Refunds',
    description: 'Process refunds and handle payment disputes',
    category: 'Order Management',
    level: 7,
    resource: 'orders',
    actions: ['refund']
  },

  // Customer Management
  {
    id: 'customers.view',
    name: 'View Customers',
    description: 'View customer profiles and basic information',
    category: 'Customer Management',
    level: 1,
    resource: 'customers',
    actions: ['read']
  },
  {
    id: 'customers.edit',
    name: 'Edit Customers',
    description: 'Edit customer profiles and manage customer data',
    category: 'Customer Management',
    level: 3,
    resource: 'customers',
    actions: ['read', 'update']
  },
  {
    id: 'customers.edit_notes',
    name: 'Edit Customer Notes',
    description: 'Add and edit notes on customer profiles',
    category: 'Customer Management',
    level: 2,
    resource: 'customers',
    actions: ['update_notes']
  },
  {
    id: 'customers.delete',
    name: 'Delete Customers',
    description: 'Delete customer accounts and associated data',
    category: 'Customer Management',
    level: 8,
    resource: 'customers',
    actions: ['delete']
  },

  // Application Management
  {
    id: 'apps.view',
    name: 'View Applications',
    description: 'View application builds and deployment status',
    category: 'Application Management',
    level: 1,
    resource: 'apps',
    actions: ['read']
  },
  {
    id: 'apps.manage',
    name: 'Manage Applications',
    description: 'Control application builds, deployments, and lifecycle',
    category: 'Application Management',
    level: 6,
    resource: 'apps',
    actions: ['read', 'update', 'deploy', 'stop']
  },
  {
    id: 'apps.delete',
    name: 'Delete Applications',
    description: 'Delete applications and associated resources',
    category: 'Application Management',
    level: 8,
    resource: 'apps',
    actions: ['delete']
  },

  // Analytics & Financial
  {
    id: 'analytics.view',
    name: 'View Analytics',
    description: 'Access analytics dashboards and reports',
    category: 'Analytics & Financial',
    level: 3,
    resource: 'analytics',
    actions: ['read']
  },
  {
    id: 'financial.manage',
    name: 'Manage Finances',
    description: 'Access financial data, process refunds, manage billing',
    category: 'Analytics & Financial',
    level: 7,
    resource: 'financial',
    actions: ['read', 'update', 'refund']
  },

  // System Administration
  {
    id: 'system.view',
    name: 'View System Health',
    description: 'View system health metrics and status',
    category: 'System Administration',
    level: 3,
    resource: 'system',
    actions: ['read']
  },
  {
    id: 'system.manage',
    name: 'Manage System',
    description: 'Manage system settings, health checks, and configurations',
    category: 'System Administration',
    level: 8,
    resource: 'system',
    actions: ['read', 'update', 'restart']
  },

  // Security & Access Control
  {
    id: 'security.view',
    name: 'View Security',
    description: 'View security logs, audit trails, and access records',
    category: 'Security & Access Control',
    level: 5,
    resource: 'security',
    actions: ['read']
  },
  {
    id: 'security.manage',
    name: 'Manage Security',
    description: 'Manage user roles, permissions, and security settings',
    category: 'Security & Access Control',
    level: 9,
    resource: 'security',
    actions: ['read', 'update', 'create', 'delete']
  },
  {
    id: 'sessions.manage',
    name: 'Manage Sessions',
    description: 'View and revoke active admin sessions',
    category: 'Security & Access Control',
    level: 7,
    resource: 'sessions',
    actions: ['read', 'revoke']
  },

  // Communication
  {
    id: 'communications.send',
    name: 'Send Communications',
    description: 'Send emails and notifications to customers',
    category: 'Communication',
    level: 4,
    resource: 'communications',
    actions: ['create', 'send']
  },
  {
    id: 'communications.manage',
    name: 'Manage Communications',
    description: 'Manage email templates and communication settings',
    category: 'Communication',
    level: 6,
    resource: 'communications',
    actions: ['read', 'update', 'create', 'delete']
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real app, verify admin authentication and permissions
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let filteredPermissions = mockPermissions;
    
    if (category) {
      filteredPermissions = mockPermissions.filter(p => p.category === category);
    }

    return NextResponse.json({
      success: true,
      permissions: filteredPermissions,
      categories: [...new Set(mockPermissions.map(p => p.category))]
    });
  } catch (error) {
    console.error('Permissions API error:', error);
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
        const newPermission: AdminPermission = {
          id: params.id || `${params.resource}.${params.actions[0]}`,
          name: params.name,
          description: params.description,
          category: params.category,
          level: params.level,
          resource: params.resource,
          actions: params.actions
        };

        // Check if permission already exists
        if (mockPermissions.find(p => p.id === newPermission.id)) {
          return NextResponse.json(
            { success: false, error: 'Permission already exists' },
            { status: 400 }
          );
        }

        mockPermissions.push(newPermission);

        return NextResponse.json({
          success: true,
          permission: newPermission,
          message: 'Permission created successfully'
        });

      case 'update':
        const permissionIndex = mockPermissions.findIndex(p => p.id === params.id);
        if (permissionIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Permission not found' },
            { status: 404 }
          );
        }

        mockPermissions[permissionIndex] = {
          ...mockPermissions[permissionIndex],
          name: params.name,
          description: params.description,
          category: params.category,
          level: params.level,
          resource: params.resource,
          actions: params.actions
        };

        return NextResponse.json({
          success: true,
          permission: mockPermissions[permissionIndex],
          message: 'Permission updated successfully'
        });

      case 'delete':
        const deleteIndex = mockPermissions.findIndex(p => p.id === params.id);
        if (deleteIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Permission not found' },
            { status: 404 }
          );
        }

        mockPermissions.splice(deleteIndex, 1);

        return NextResponse.json({
          success: true,
          message: 'Permission deleted successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Permissions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
