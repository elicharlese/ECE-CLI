import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateAdminSession,
  hasPermission,
  logAdminAction,
  getClientIP,
  ADMIN_PERMISSIONS
} from '@/utils/admin-security';

// Get orders from the global orders store
import { getAllOrders, findOrderById, updateOrder } from '@/lib/data-store';

// Order update schema
const orderUpdateSchema = z.object({
  orderId: z.string(),
  status: z.enum(['pending_payment', 'paid', 'building', 'completed', 'payment_failed', 'build_failed', 'refunded', 'cancelled']).optional(),
  progress: z.number().min(0).max(100).optional(),
  deliveryUrl: z.string().url().optional(),
  adminNotes: z.string().optional()
});

function calculateOrderStats(allOrders: any[]) {
  const stats = {
    total: allOrders.length,
    pending_payment: 0,
    paid: 0,
    building: 0,
    completed: 0,
    payment_failed: 0,
    build_failed: 0,
    refunded: 0,
    cancelled: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    completionRate: 0,
    monthlyRevenue: 0,
    weeklyOrders: 0
  };

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  allOrders.forEach(order => {
    // Status counts
    stats[order.status as keyof typeof stats] = (stats[order.status as keyof typeof stats] as number) + 1;
    
    // Revenue calculations
    if (['paid', 'building', 'completed'].includes(order.status)) {
      stats.totalRevenue += order.price;
    }

    // Monthly revenue
    if (new Date(order.createdAt) >= thisMonth && ['paid', 'building', 'completed'].includes(order.status)) {
      stats.monthlyRevenue += order.price;
    }

    // Weekly orders
    if (new Date(order.createdAt) >= thisWeek) {
      stats.weeklyOrders++;
    }
  });

  // Calculate averages and rates
  if (stats.total > 0) {
    stats.avgOrderValue = stats.totalRevenue / Math.max(stats.paid + stats.building + stats.completed, 1);
    stats.completionRate = (stats.completed / stats.total) * 100;
  }

  return stats;
}

// Get all orders for admin
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

    if (!hasPermission(session, ADMIN_PERMISSIONS.VIEW_ORDERS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all orders
    const allOrders = getAllOrders();

    // Filter orders
    let filteredOrders = allOrders;

    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerEmail.toLowerCase().includes(searchLower) ||
        order.appName.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower)
      );
    }

    // Sort orders
    filteredOrders.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];

      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginate
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    // Calculate statistics
    const stats = calculateOrderStats(allOrders);

    // Log admin action
    logAdminAction(
      session.email,
      'VIEW_ORDERS',
      `Viewed orders (${filteredOrders.length} results)`,
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      orders: paginatedOrders,
      stats,
      pagination: {
        total: filteredOrders.length,
        limit,
        offset,
        hasMore: filteredOrders.length > offset + limit
      }
    });

  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update order status (admin action)
export async function PUT(request: NextRequest) {
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

    if (!hasPermission(session, ADMIN_PERMISSIONS.UPDATE_ORDERS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status, progress, deliveryUrl, adminNotes } = orderUpdateSchema.parse(body);

    const order = findOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Track changes for audit log
    const changes: string[] = [];

    if (status && status !== order.status) {
      changes.push(`Status: ${order.status} → ${status}`);
      order.status = status;
      
      // Handle specific status changes
      switch (status) {
        case 'building':
          if (!order.buildStartedAt) {
            order.buildStartedAt = new Date().toISOString();
            order.progress = 0;
          }
          break;
        case 'completed':
          order.completedAt = new Date().toISOString();
          order.progress = 100;
          break;
        case 'cancelled':
        case 'refunded':
          (order as any).cancelledAt = new Date().toISOString();
          break;
      }
    }

    if (progress !== undefined && progress !== order.progress) {
      changes.push(`Progress: ${order.progress || 0}% → ${progress}%`);
      order.progress = progress;
    }

    if (deliveryUrl && deliveryUrl !== order.deliveryUrl) {
      changes.push(`Delivery URL updated`);
      order.deliveryUrl = deliveryUrl;
    }

    if (adminNotes) {
      if (!order.adminNotes) {
        order.adminNotes = [];
      }
      order.adminNotes.push({
        note: adminNotes,
        timestamp: new Date().toISOString(),
        admin: session.email
      });
      changes.push(`Added admin note`);
    }

    if (changes.length > 0) {
      order.updatedAt = new Date().toISOString();

      // Log admin action
      logAdminAction(
        session.email,
        'UPDATE_ORDER',
        `Updated order ${orderId}: ${changes.join(', ')}`,
        ipAddress,
        userAgent
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order
    });

  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete/Cancel order (admin action)
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

    if (!hasPermission(session, ADMIN_PERMISSIONS.UPDATE_ORDERS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = findOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Instead of deleting, mark as cancelled for audit purposes
    order.status = 'cancelled';
    (order as any).cancelledAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    // Log admin action
    logAdminAction(
      session.email,
      'CANCEL_ORDER',
      `Cancelled order ${orderId}`,
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    console.error('Admin order cancel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
