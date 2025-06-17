// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CustomerProfile, CustomerNote } from '@/types/admin';

// Validation schemas
const customerActionSchema = z.object({
  action: z.enum([
    'get_customers',
    'get_customer_details',
    'update_customer_status',
    'add_customer_note',
    'update_customer_tier',
    'merge_customers',
    'export_customer_data',
    'send_communication',
    'add_customer_tag',
    'remove_customer_tag'
  ]),
  customerId: z.string().optional(),
  params: z.record(z.any()).optional()
});

const customerNoteSchema = z.object({
  note: z.string().min(1).max(1000),
  type: z.enum(['general', 'support', 'billing', 'technical', 'complaint']),
  priority: z.enum(['low', 'medium', 'high']),
  isInternal: z.boolean().default(false),
  followUpDate: z.string().optional()
});

// Mock customer data
const mockCustomers: CustomerProfile[] = [
  {
    id: 'customer-1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    phone: '+1-555-0123',
    company: 'Tech Innovations Inc.',
    status: 'active',
    tier: 'premium',
    totalOrders: 5,
    totalSpent: 4997,
    avgOrderValue: 999.4,
    lifetimeValue: 4997,
    completedOrders: 4,
    cancelledOrders: 1,
    refundedOrders: 0,
    satisfactionScore: 4.6,
    firstOrderDate: '2023-06-15T10:00:00Z',
    lastOrderDate: '2024-01-15T14:30:00Z',
    lastContactDate: '2024-01-20T09:15:00Z',
    preferredContactMethod: 'email',
    notes: [
      {
        id: 'note-1',
        adminId: 'admin-1',
        adminName: 'ECE Admin',
        content: 'Customer requested complex e-commerce solution with payment integration',
        createdAt: '2024-01-15T14:35:00Z',
        isPrivate: false
      },
      {
        id: 'note-2',
        adminId: 'admin-1',
        adminName: 'ECE Admin',
        content: 'Follow up on deployment status - customer very responsive',
        createdAt: '2024-01-16T09:20:00Z',
        isPrivate: true
      }
    ],
    tags: ['enterprise', 'high-value', 'tech-savvy'],
    riskScore: 2, // Low risk (0-10 scale)
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: 'customer-2',
    email: 'sarah.wilson@startup.io',
    name: 'Sarah Wilson',
    phone: '+1-555-0456',
    company: 'StartupFlow',
    status: 'active',
    tier: 'basic',
    totalOrders: 2,
    totalSpent: 1498,
    avgOrderValue: 749,
    lifetimeValue: 1498,
    completedOrders: 2,
    cancelledOrders: 0,
    refundedOrders: 0,
    satisfactionScore: 4.8,
    firstOrderDate: '2023-11-20T16:00:00Z',
    lastOrderDate: '2024-01-10T11:20:00Z',
    preferredContactMethod: 'email',
    notes: [
      {
        id: 'note-3',
        adminId: 'admin-1',
        adminName: 'ECE Admin',
        note: 'Startup founder, very budget-conscious but professional',
        type: 'general',
        priority: 'low',
        isInternal: true,
        timestamp: '2023-11-20T16:05:00Z'
      }
    ],
    tags: ['startup', 'budget-conscious', 'quick-decision'],
    riskScore: 1,
    createdAt: '2023-11-20T16:00:00Z',
    updatedAt: '2024-01-10T11:20:00Z'
  },
  {
    id: 'customer-3',
    email: 'michael.chen@enterprise.com',
    name: 'Michael Chen',
    phone: '+1-555-0789',
    company: 'Enterprise Solutions Corp',
    status: 'vip',
    tier: 'enterprise',
    totalOrders: 12,
    totalSpent: 18540,
    avgOrderValue: 1545,
    lifetimeValue: 25000, // Projected
    completedOrders: 11,
    cancelledOrders: 0,
    refundedOrders: 1,
    satisfactionScore: 4.9,
    firstOrderDate: '2023-03-10T09:00:00Z',
    lastOrderDate: '2024-01-18T13:45:00Z',
    lastContactDate: '2024-01-19T10:30:00Z',
    preferredContactMethod: 'phone',
    notes: [
      {
        id: 'note-4',
        adminId: 'admin-1',
        adminName: 'ECE Admin',
        note: 'VIP customer - always pays on time, requests complex solutions',
        type: 'general',
        priority: 'high',
        isInternal: false,
        timestamp: '2023-03-10T09:15:00Z'
      },
      {
        id: 'note-5',
        adminId: 'admin-1',
        adminName: 'ECE Admin',
        note: 'Discussed potential bulk discount for future orders',
        type: 'billing',
        priority: 'medium',
        isInternal: true,
        timestamp: '2024-01-19T10:30:00Z'
      }
    ],
    tags: ['vip', 'enterprise', 'bulk-orders', 'high-value'],
    riskScore: 0, // No risk
    createdAt: '2023-03-10T09:00:00Z',
    updatedAt: '2024-01-19T10:30:00Z'
  }
];

// Customer management functions
async function getCustomers(filters: any = {}): Promise<{ customers: CustomerProfile[]; total: number }> {
  let filteredCustomers = [...mockCustomers];

  // Apply filters
  if (filters.status) {
    filteredCustomers = filteredCustomers.filter(customer => customer.status === filters.status);
  }
  if (filters.tier) {
    filteredCustomers = filteredCustomers.filter(customer => customer.tier === filters.tier);
  }
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredCustomers = filteredCustomers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm) ||
      (customer.company && customer.company.toLowerCase().includes(searchTerm))
    );
  }
  if (filters.minSpent) {
    filteredCustomers = filteredCustomers.filter(customer => customer.totalSpent >= filters.minSpent);
  }
  if (filters.tag) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.tags.includes(filters.tag)
    );
  }

  // Sorting
  if (filters.sortBy) {
    filteredCustomers.sort((a, b) => {
      const aValue = (a as any)[filters.sortBy];
      const bValue = (b as any)[filters.sortBy];
      
      if (filters.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const startIndex = (page - 1) * limit;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + limit);

  return {
    customers: paginatedCustomers,
    total: filteredCustomers.length
  };
}

async function getCustomerDetails(customerId: string): Promise<CustomerProfile | null> {
  return mockCustomers.find(customer => customer.id === customerId) || null;
}

async function updateCustomerStatus(customerId: string, status: string): Promise<boolean> {
  const customer = mockCustomers.find(customer => customer.id === customerId);
  if (customer) {
    customer.status = status as any;
    customer.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

async function addCustomerNote(customerId: string, noteData: any): Promise<CustomerNote | null> {
  const customer = mockCustomers.find(customer => customer.id === customerId);
  if (customer) {
    const newNote: CustomerNote = {
      id: `note-${Date.now()}`,
      adminId: 'admin-1', // In real app, get from session
      adminName: 'ECE Admin', // In real app, get from session
      note: noteData.note,
      type: noteData.type,
      priority: noteData.priority,
      isInternal: noteData.isInternal,
      timestamp: new Date().toISOString(),
      followUpDate: noteData.followUpDate
    };

    customer.notes.push(newNote);
    customer.updatedAt = new Date().toISOString();
    
    return newNote;
  }
  return null;
}

async function updateCustomerTier(customerId: string, tier: string): Promise<boolean> {
  const customer = mockCustomers.find(customer => customer.id === customerId);
  if (customer) {
    customer.tier = tier as any;
    customer.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

async function addCustomerTag(customerId: string, tag: string): Promise<boolean> {
  const customer = mockCustomers.find(customer => customer.id === customerId);
  if (customer && !customer.tags.includes(tag)) {
    customer.tags.push(tag);
    customer.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

async function removeCustomerTag(customerId: string, tag: string): Promise<boolean> {
  const customer = mockCustomers.find(customer => customer.id === customerId);
  if (customer) {
    const index = customer.tags.indexOf(tag);
    if (index !== -1) {
      customer.tags.splice(index, 1);
      customer.updatedAt = new Date().toISOString();
      return true;
    }
  }
  return false;
}

async function getCustomerStats(): Promise<any> {
  const totalCustomers = mockCustomers.length;
  const activeCustomers = mockCustomers.filter(c => c.status === 'active').length;
  const vipCustomers = mockCustomers.filter(c => c.status === 'vip').length;
  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = mockCustomers.reduce((sum, c) => sum + c.avgOrderValue, 0) / totalCustomers;
  const avgSatisfaction = mockCustomers
    .filter(c => c.satisfactionScore)
    .reduce((sum, c) => sum + (c.satisfactionScore || 0), 0) / 
    mockCustomers.filter(c => c.satisfactionScore).length;

  return {
    total: totalCustomers,
    active: activeCustomers,
    vip: vipCustomers,
    inactive: mockCustomers.filter(c => c.status === 'inactive').length,
    suspended: mockCustomers.filter(c => c.status === 'suspended').length,
    totalRevenue,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
    tiers: {
      basic: mockCustomers.filter(c => c.tier === 'basic').length,
      premium: mockCustomers.filter(c => c.tier === 'premium').length,
      enterprise: mockCustomers.filter(c => c.tier === 'enterprise').length
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    // Basic authentication check
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (customerId) {
      // Get specific customer details
      const customer = await getCustomerDetails(customerId);
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, customer });
    } else {
      // Get customers list with filters
      const filters = {
        status: searchParams.get('status'),
        tier: searchParams.get('tier'),
        search: searchParams.get('search'),
        minSpent: searchParams.get('minSpent') ? parseFloat(searchParams.get('minSpent')!) : undefined,
        tag: searchParams.get('tag'),
        sortBy: searchParams.get('sortBy') || 'updatedAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20')
      };

      const result = await getCustomers(filters);
      const stats = await getCustomerStats();

      return NextResponse.json({
        success: true,
        customers: result.customers,
        total: result.total,
        stats,
        page: filters.page,
        limit: filters.limit
      });
    }

  } catch (error) {
    console.error('Customer management GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, customerId, params } = customerActionSchema.parse(body);

    // Basic authentication check
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    switch (action) {
      case 'update_customer_status':
        if (!customerId || !params?.status) {
          return NextResponse.json(
            { error: 'Customer ID and status required' },
            { status: 400 }
          );
        }
        const statusUpdated = await updateCustomerStatus(customerId, params.status);
        return NextResponse.json({ success: statusUpdated });

      case 'add_customer_note':
        if (!customerId || !params) {
          return NextResponse.json(
            { error: 'Customer ID and note data required' },
            { status: 400 }
          );
        }
        const validatedNote = customerNoteSchema.parse(params);
        const newNote = await addCustomerNote(customerId, validatedNote);
        return NextResponse.json({ success: !!newNote, note: newNote });

      case 'update_customer_tier':
        if (!customerId || !params?.tier) {
          return NextResponse.json(
            { error: 'Customer ID and tier required' },
            { status: 400 }
          );
        }
        const tierUpdated = await updateCustomerTier(customerId, params.tier);
        return NextResponse.json({ success: tierUpdated });

      case 'add_customer_tag':
        if (!customerId || !params?.tag) {
          return NextResponse.json(
            { error: 'Customer ID and tag required' },
            { status: 400 }
          );
        }
        const tagAdded = await addCustomerTag(customerId, params.tag);
        return NextResponse.json({ success: tagAdded });

      case 'remove_customer_tag':
        if (!customerId || !params?.tag) {
          return NextResponse.json(
            { error: 'Customer ID and tag required' },
            { status: 400 }
          );
        }
        const tagRemoved = await removeCustomerTag(customerId, params.tag);
        return NextResponse.json({ success: tagRemoved });

      case 'send_communication':
        if (!customerId || !params?.message) {
          return NextResponse.json(
            { error: 'Customer ID and message required' },
            { status: 400 }
          );
        }
        // Mock communication sending
        console.log(`Sending communication to customer ${customerId}:`, params.message);
        return NextResponse.json({ success: true, message: 'Communication sent' });

      case 'export_customer_data':
        if (!customerId) {
          return NextResponse.json(
            { error: 'Customer ID required' },
            { status: 400 }
          );
        }
        const customer = await getCustomerDetails(customerId);
        if (!customer) {
          return NextResponse.json(
            { error: 'Customer not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ 
          success: true, 
          exportUrl: `/api/admin/customers/export/${customerId}`,
          customer: customer 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

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

    console.error('Customer management action error:', error);
    return NextResponse.json(
      { error: 'Customer management action failed' },
      { status: 500 }
    );
  }
}
