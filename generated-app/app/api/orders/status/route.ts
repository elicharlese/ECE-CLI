// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { findOrderById } from '@/lib/data-store';

// Import OrderData type from create route
type OrderData = {
  id: string;
  customerName: string;
  customerEmail: string;
  company?: string;
  phone?: string;
  appName: string;
  appDescription: string;
  framework: string;
  complexity: 'simple' | 'medium' | 'complex';
  features: string[];
  database: string;
  authentication: string[];
  timeline: '24h' | '3d' | '1w' | '2w';
  deliveryMethod: 'github' | 'zip' | 'deployed';
  specialRequirements?: string;
  price: number;
  currency: string;
  status: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  buildStartedAt?: string;
  completedAt?: string;
  progress?: number;
  buildId?: string;
  buildLogs?: string[];
  currentBuildStep?: string;
  deliveryUrl?: string;
  adminUrl?: string;
  buildError?: string;
  adminNotes?: Array<{ note: string; timestamp: string; admin: string }>;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = findOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Return order status with progress information
    const statusResponse = {
      id: order.id,
      status: order.status,
      progress: order.progress || 0,
      currentBuildStep: order.currentBuildStep,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      buildStartedAt: order.buildStartedAt,
      completedAt: order.completedAt,
      buildLogs: order.buildLogs || [],
      deliveryUrl: order.deliveryUrl,
      adminUrl: order.adminUrl,
      appName: order.appName,
      framework: order.framework,
      complexity: order.complexity,
      timeline: order.timeline,
      deliveryMethod: order.deliveryMethod,
      estimatedCompletion: calculateEstimatedCompletion(order)
    };

    return NextResponse.json({
      success: true,
      order: statusResponse
    });

  } catch (error) {
    console.error('Order status error:', error);
    return NextResponse.json(
      { error: 'Failed to get order status' },
      { status: 500 }
    );
  }
}

function calculateEstimatedCompletion(order: OrderData) {
  if (order.status === 'completed') {
    return order.completedAt;
  }

  if (order.status === 'building' && order.buildStartedAt) {
    // Calculate estimated completion based on timeline
    const timelineHours = {
      '24h': 24,
      '3d': 72,
      '1w': 168,
      '2w': 336
    };

    const startTime = new Date(order.buildStartedAt);
    const estimatedDuration = timelineHours[order.timeline] || 168;
    const estimatedCompletion = new Date(startTime.getTime() + estimatedDuration * 60 * 60 * 1000);
    
    return estimatedCompletion.toISOString();
  }

  return null;
}
