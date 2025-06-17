import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FinancialAnalytics, RefundRequest } from '@/types/admin';

// Validation schemas
const analyticsQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).default('monthly'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includeForecasts: z.boolean().default(false)
});

const refundRequestSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  reason: z.string().min(10).max(500),
  adminNotes: z.string().optional()
});

// Mock financial data
const mockFinancialData: FinancialAnalytics = {
  revenue: {
    total: 245830,
    thisMonth: 42150,
    lastMonth: 38920,
    thisYear: 245830,
    lastYear: 187240,
    growth: {
      monthly: 8.3,
      yearly: 31.3
    },
    forecast: {
      nextMonth: 45200,
      nextQuarter: 135600
    }
  },
  orders: {
    total: 247,
    completed: 231,
    refunded: 8,
    cancelled: 8,
    completionRate: 93.5,
    avgOrderValue: 996,
    avgProcessingTime: 3.2 // days
  },
  customers: {
    total: 156,
    new: 23,
    returning: 45,
    churnRate: 12.5,
    lifetimeValue: 1576,
    acquisitionCost: 125
  },
  expenses: {
    total: 58450,
    hosting: 12500,
    thirdPartyServices: 15200,
    development: 18750,
    marketing: 8500,
    support: 3500
  },
  profitability: {
    grossProfit: 187380,
    netProfit: 128930,
    margin: 52.4
  },
  trends: {
    daily: [
      { date: '2024-01-15', revenue: 2150, orders: 2 },
      { date: '2024-01-16', revenue: 1498, orders: 1 },
      { date: '2024-01-17', revenue: 3497, orders: 3 },
      { date: '2024-01-18', revenue: 999, orders: 1 },
      { date: '2024-01-19', revenue: 1998, orders: 2 },
      { date: '2024-01-20', revenue: 4995, orders: 4 },
      { date: '2024-01-21', revenue: 2997, orders: 3 }
    ],
    monthly: [
      { month: '2023-07', revenue: 18450, orders: 19 },
      { month: '2023-08', revenue: 21230, orders: 22 },
      { month: '2023-09', revenue: 19850, orders: 20 },
      { month: '2023-10', revenue: 24680, orders: 25 },
      { month: '2023-11', revenue: 28340, orders: 29 },
      { month: '2023-12', revenue: 31450, orders: 32 },
      { month: '2024-01', revenue: 42150, orders: 43 }
    ],
    frameworks: [
      { framework: 'nextjs', orders: 98, revenue: 97020 },
      { framework: 'react', orders: 67, revenue: 66730 },
      { framework: 'vue', orders: 45, revenue: 44550 },
      { framework: 'nodejs', orders: 37, revenue: 37530 }
    ],
    complexity: [
      { level: 'simple', orders: 89, revenue: 44450 },
      { level: 'medium', orders: 92, revenue: 91540 },
      { level: 'complex', orders: 66, revenue: 109840 }
    ]
  }
};

const mockRefundRequests: RefundRequest[] = [
  {
    id: 'refund-1',
    orderId: 'order-123',
    customerId: 'customer-456',
    customerEmail: 'john.doe@example.com',
    amount: 999,
    reason: 'Project requirements changed significantly after order placement',
    status: 'pending',
    requestedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 'refund-2',
    orderId: 'order-124',
    customerId: 'customer-457',
    customerEmail: 'sarah.wilson@startup.io',
    amount: 1499,
    reason: 'Build failed to meet specified requirements',
    status: 'approved',
    adminNotes: 'Valid complaint - build did not include requested features',
    processedBy: 'admin-1',
    requestedAt: '2024-01-18T14:15:00Z',
    processedAt: '2024-01-19T09:30:00Z',
    stripeRefundId: 're_1234567890'
  }
];

// Financial analytics functions
async function getFinancialAnalytics(filters: any = {}): Promise<FinancialAnalytics> {
  // In a real implementation, this would calculate analytics based on actual data
  // For now, return mock data with some dynamic elements

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Simulate some real-time updates
  const updatedData = {
    ...mockFinancialData,
    revenue: {
      ...mockFinancialData.revenue,
      thisMonth: mockFinancialData.revenue.thisMonth + Math.floor(Math.random() * 5000)
    },
    orders: {
      ...mockFinancialData.orders,
      total: mockFinancialData.orders.total + Math.floor(Math.random() * 10)
    }
  };

  // Apply date filters if provided
  if (filters.startDate && filters.endDate) {
    // In a real implementation, filter data by date range
    console.log(`Filtering analytics from ${filters.startDate} to ${filters.endDate}`);
  }

  return updatedData;
}

async function getRefundRequests(filters: any = {}): Promise<{ refunds: RefundRequest[]; total: number }> {
  let filteredRefunds = [...mockRefundRequests];

  if (filters.status) {
    filteredRefunds = filteredRefunds.filter(refund => refund.status === filters.status);
  }

  if (filters.startDate) {
    filteredRefunds = filteredRefunds.filter(refund => 
      new Date(refund.requestedAt) >= new Date(filters.startDate)
    );
  }

  if (filters.endDate) {
    filteredRefunds = filteredRefunds.filter(refund => 
      new Date(refund.requestedAt) <= new Date(filters.endDate)
    );
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const startIndex = (page - 1) * limit;
  const paginatedRefunds = filteredRefunds.slice(startIndex, startIndex + limit);

  return {
    refunds: paginatedRefunds,
    total: filteredRefunds.length
  };
}

async function processRefund(refundId: string, action: 'approve' | 'deny', adminNotes?: string): Promise<boolean> {
  const refund = mockRefundRequests.find(r => r.id === refundId);
  
  if (!refund) return false;

  if (action === 'approve') {
    refund.status = 'approved';
    refund.stripeRefundId = `re_${Date.now()}`;
  } else {
    refund.status = 'denied';
  }

  refund.processedBy = 'admin-1'; // In real app, get from session
  refund.processedAt = new Date().toISOString();
  if (adminNotes) {
    refund.adminNotes = adminNotes;
  }

  return true;
}

async function createRefund(refundData: any): Promise<RefundRequest> {
  const newRefund: RefundRequest = {
    id: `refund-${Date.now()}`,
    orderId: refundData.orderId,
    customerId: 'customer-unknown', // In real app, get from order
    customerEmail: 'customer@example.com', // In real app, get from order
    amount: refundData.amount,
    reason: refundData.reason,
    status: 'pending',
    adminNotes: refundData.adminNotes,
    requestedAt: new Date().toISOString()
  };

  mockRefundRequests.push(newRefund);
  return newRefund;
}

async function getRevenueForecast(months: number = 3): Promise<Array<{ month: string; forecast: number; confidence: number }>> {
  const forecast = [];
  const baseRevenue = mockFinancialData.revenue.thisMonth;
  const growthRate = mockFinancialData.revenue.growth.monthly / 100;

  for (let i = 1; i <= months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    
    const forecastRevenue = baseRevenue * Math.pow(1 + growthRate, i);
    const confidence = Math.max(50, 95 - (i * 10)); // Decreasing confidence over time

    forecast.push({
      month: date.toISOString().substring(0, 7),
      forecast: Math.round(forecastRevenue),
      confidence
    });
  }

  return forecast;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'analytics';

    // Basic authentication check
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    switch (action) {
      case 'analytics':
        const filters = {
          period: searchParams.get('period') || 'monthly',
          startDate: searchParams.get('startDate'),
          endDate: searchParams.get('endDate'),
          includeForecasts: searchParams.get('includeForecasts') === 'true'
        };

        const analytics = await getFinancialAnalytics(filters);
        
        let forecast = undefined;
        if (filters.includeForecasts) {
          forecast = await getRevenueForecast();
        }

        return NextResponse.json({
          success: true,
          analytics,
          forecast
        });

      case 'refunds':
        const refundFilters = {
          status: searchParams.get('status'),
          startDate: searchParams.get('startDate'),
          endDate: searchParams.get('endDate'),
          page: parseInt(searchParams.get('page') || '1'),
          limit: parseInt(searchParams.get('limit') || '20')
        };

        const refundResult = await getRefundRequests(refundFilters);
        return NextResponse.json({
          success: true,
          refunds: refundResult.refunds,
          total: refundResult.total,
          page: refundFilters.page,
          limit: refundFilters.limit
        });

      case 'forecast':
        const months = parseInt(searchParams.get('months') || '3');
        const forecastData = await getRevenueForecast(months);
        return NextResponse.json({
          success: true,
          forecast: forecastData
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Financial analytics GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    // Basic authentication check
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    switch (action) {
      case 'process_refund':
        const { refundId, refundAction, adminNotes } = body;
        if (!refundId || !refundAction) {
          return NextResponse.json(
            { error: 'Refund ID and action required' },
            { status: 400 }
          );
        }

        const processed = await processRefund(refundId, refundAction, adminNotes);
        return NextResponse.json({ success: processed });

      case 'create_refund':
        const refundData = refundRequestSchema.parse(body);
        const newRefund = await createRefund(refundData);
        return NextResponse.json({ success: true, refund: newRefund });

      case 'export_analytics':
        const exportFormat = body.format || 'json';
        const exportData = await getFinancialAnalytics();
        
        return NextResponse.json({
          success: true,
          exportUrl: `/api/admin/analytics/export?format=${exportFormat}`,
          data: exportData
        });

      case 'generate_report':
        const reportType = body.reportType || 'monthly';
        const reportPeriod = body.period || '2024-01';
        
        // Mock report generation
        const reportId = `report-${Date.now()}`;
        console.log(`Generating ${reportType} report for ${reportPeriod}`);
        
        return NextResponse.json({
          success: true,
          reportId,
          downloadUrl: `/api/admin/analytics/reports/${reportId}`,
          estimatedTime: '2-3 minutes'
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

    console.error('Financial analytics action error:', error);
    return NextResponse.json(
      { error: 'Financial action failed' },
      { status: 500 }
    );
  }
}
