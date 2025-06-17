import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminSession,
  hasPermission,
  logAdminAction,
  getClientIP,
  getAuditLogs,
  ADMIN_PERMISSIONS
} from '@/utils/admin-security';

// Get orders from the global orders store
import { getAllOrders } from '@/lib/data-store';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    previousMonth: number;
    monthlyGrowth: number;
  };
  orders: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    previousMonth: number;
    monthlyGrowth: number;
    avgOrderValue: number;
    completionRate: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    retention: number;
  };
  timeline: {
    daily: Array<{ date: string; orders: number; revenue: number }>;
    monthly: Array<{ month: string; orders: number; revenue: number }>;
  };
  topProducts: Array<{ framework: string; orders: number; revenue: number }>;
  statusBreakdown: Record<string, number>;
}

function calculateAnalytics(): AnalyticsData {
  const allOrders = getAllOrders();
  const now = new Date();
  
  // Date ranges
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Filter orders by date ranges
  const paidStatuses = ['paid', 'building', 'completed'];
  const paidOrders = allOrders.filter(o => paidStatuses.includes(o.status));
  
  const dailyOrders = paidOrders.filter(o => new Date(o.createdAt) >= today);
  const weeklyOrders = paidOrders.filter(o => new Date(o.createdAt) >= thisWeek);
  const monthlyOrders = paidOrders.filter(o => new Date(o.createdAt) >= thisMonth);
  const previousMonthOrders = paidOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= previousMonth && orderDate <= endPreviousMonth;
  });

  // Revenue calculations
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const dailyRevenue = dailyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const previousMonthRevenue = previousMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Growth calculations
  const monthlyGrowthRevenue = previousMonthRevenue > 0 
    ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0;
  const monthlyGrowthOrders = previousMonthOrders.length > 0 
    ? ((monthlyOrders.length - previousMonthOrders.length) / previousMonthOrders.length) * 100 
    : 0;

  // Customer analytics
  const customerEmails = new Set(allOrders.map(o => o.customerEmail));
  const newCustomers = new Set();
  const returningCustomers = new Set();

  customerEmails.forEach(email => {
    const customerOrders = allOrders.filter(o => o.customerEmail === email);
    const monthlyCustomerOrders = customerOrders.filter(o => 
      new Date(o.createdAt) >= thisMonth
    );
    
    if (monthlyCustomerOrders.length > 0) {
      if (customerOrders.length === monthlyCustomerOrders.length) {
        newCustomers.add(email);
      } else {
        returningCustomers.add(email);
      }
    }
  });

  // Timeline data (last 30 days)
  const dailyData: Array<{ date: string; orders: number; revenue: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const dayOrders = paidOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= dayStart && orderDate < dayEnd;
    });
    
    dailyData.push({
      date: dateStr,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    });
  }

  // Monthly data (last 12 months)
  const monthlyData: Array<{ month: string; orders: number; revenue: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    
    const monthOrders = paidOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= monthStart && orderDate < monthEnd;
    });
    
    monthlyData.push({
      month: date.toISOString().slice(0, 7), // YYYY-MM format
      orders: monthOrders.length,
      revenue: monthOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    });
  }

  // Top frameworks
  const frameworkStats = new Map<string, { orders: number; revenue: number }>();
  paidOrders.forEach(order => {
    const framework = order.framework || 'Unknown';
    const current = frameworkStats.get(framework) || { orders: 0, revenue: 0 };
    current.orders++;
    current.revenue += order.totalAmount;
    frameworkStats.set(framework, current);
  });

  const topProducts = Array.from(frameworkStats.entries())
    .map(([framework, stats]) => ({ framework, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  allOrders.forEach(order => {
    statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
  });

  return {
    revenue: {
      total: totalRevenue,
      monthly: monthlyRevenue,
      weekly: weeklyRevenue,
      daily: dailyRevenue,
      previousMonth: previousMonthRevenue,
      monthlyGrowth: monthlyGrowthRevenue
    },
    orders: {
      total: allOrders.length,
      monthly: monthlyOrders.length,
      weekly: weeklyOrders.length,
      daily: dailyOrders.length,
      previousMonth: previousMonthOrders.length,
      monthlyGrowth: monthlyGrowthOrders,
      avgOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
      completionRate: allOrders.length > 0 ? (allOrders.filter(o => o.status === 'completed').length / allOrders.length) * 100 : 0
    },
    customers: {
      total: customerEmails.size,
      new: newCustomers.size,
      returning: returningCustomers.size,
      retention: customerEmails.size > 0 ? (returningCustomers.size / customerEmails.size) * 100 : 0
    },
    timeline: {
      daily: dailyData,
      monthly: monthlyData
    },
    topProducts,
    statusBreakdown
  };
}

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

    if (!hasPermission(session, ADMIN_PERMISSIONS.VIEW_ANALYTICS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get analytics data
    const analytics = calculateAnalytics();

    // Get recent audit logs
    const auditLogs = getAuditLogs(20, 0);

    // Log admin action
    logAdminAction(
      session.email,
      'VIEW_ANALYTICS',
      'Viewed analytics dashboard',
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      analytics,
      auditLogs,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin analytics fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
