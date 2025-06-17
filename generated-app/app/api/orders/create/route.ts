import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { calculateOrderPrice } from '@/types/business';
import { addOrder, findOrderById, getAllOrders, updateOrder } from '@/lib/data-store';
import type { OrderData } from '@/lib/data-store';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Order validation schema
const orderSchema = z.object({
  // Customer Info
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  company: z.string().optional(),
  phone: z.string().optional(),
  businessType: z.string().default('startup'),
  industry: z.string().default('technology'),
  
  // App Details
  appName: z.string().min(1, 'App name is required'),
  appDescription: z.string().min(10, 'App description must be at least 10 characters'),
  framework: z.string().min(1),
  complexity: z.enum(['simple', 'medium', 'complex']),
  features: z.array(z.string()),
  database: z.string().min(1),
  authentication: z.array(z.string()),
  
  // Project Scope
  projectType: z.enum(['web-app', 'mobile-app', 'api', 'full-stack', 'mvp', 'enterprise']).default('web-app'),
  targetUsers: z.string().optional(),
  expectedTraffic: z.enum(['low', 'medium', 'high', 'enterprise']).default('medium'),
  platformRequirements: z.array(z.string()).default([]),
  
  // Technical Requirements
  thirdPartyIntegrations: z.array(z.string()).default([]),
  designPreferences: z.string().optional(),
  brandingRequirements: z.string().optional(),
  performanceRequirements: z.string().optional(),
  
  // Modern App Requirements
  pwaRequirements: z.boolean().default(false),
  offlineCapabilities: z.boolean().default(false),
  realtimeFeatures: z.array(z.string()).default([]),
  analyticsTracking: z.array(z.string()).default([]),
  seoRequirements: z.boolean().default(true),
  
  // Mobile & Cross-Platform
  mobileFirst: z.boolean().default(true),
  nativeAppRequired: z.boolean().default(false),
  crossPlatformNeeded: z.boolean().default(false),
  
  // Advanced Features
  aiIntegration: z.array(z.string()).default([]),
  blockchainFeatures: z.array(z.string()).default([]),
  webRTCFeatures: z.array(z.string()).default([]),
  
  // Development Preferences
  testingRequirements: z.array(z.string()).default([]),
  documentationLevel: z.enum(['basic', 'comprehensive', 'enterprise']).default('comprehensive'),
  codeQualityLevel: z.enum(['standard', 'premium', 'enterprise']).default('premium'),
  
  // Collaboration & Communication
  clientCollaboration: z.enum(['minimal', 'regular', 'intensive']).default('regular'),
  feedbackMechanism: z.array(z.string()).default([]),
  projectManagementTool: z.string().default('slack'),
  
  // Hosting & Deployment
  hostingPreference: z.enum(['vercel', 'netlify', 'aws', 'heroku', 'custom', 'client-managed']).default('vercel'),
  domainRequired: z.boolean().default(false),
  sslRequired: z.boolean().default(true),
  
  // GitHub & Version Control
  githubUsername: z.string().optional(),
  repositoryName: z.string().optional(),
  repositoryAccess: z.enum(['public', 'private', 'organization']).default('private'),
  
  // Business Options
  timeline: z.enum(['24h', '3d', '1w', '2w']),
  deliveryMethod: z.enum(['github', 'zip', 'deployed']),
  
  // Legal & Compliance
  dataRegion: z.enum(['us', 'eu', 'asia', 'global']).default('us'),
  complianceRequirements: z.array(z.string()).default([]),
  
  // Special Requirements
  specialRequirements: z.string().optional(),
  meetingPreference: z.enum(['none', 'kickoff', 'weekly', 'milestone-based']).default('kickoff'),
  revisionRounds: z.number().int().min(1).max(10).default(2),
  
  // Pricing
  price: z.number().positive(),
  currency: z.string().default('usd')
});

// Mock order storage (replace with database in production)
// Removed - using data store instead

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedOrder = orderSchema.parse(body);
    
    // Verify price calculation
    const calculatedPrice = calculateOrderPrice(
      validatedOrder.complexity,
      validatedOrder.timeline,
      validatedOrder.features
    );
    
    if (Math.abs(calculatedPrice - validatedOrder.price) > 0.01) {
      return NextResponse.json(
        { error: 'Price mismatch. Please refresh and try again.' },
        { status: 400 }
      );
    }

    // Create order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: validatedOrder.currency,
            product_data: {
              name: `Custom App Development: ${validatedOrder.appName}`,
              description: `${validatedOrder.complexity} complexity app with ${validatedOrder.features.length} features, delivered via ${validatedOrder.deliveryMethod} in ${validatedOrder.timeline}`,
              images: [`${process.env.NEXT_PUBLIC_APP_URL}/api/og-image?type=order`],
            },
            unit_amount: Math.round(validatedOrder.price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/order?cancelled=true`,
      metadata: {
        orderId,
        customerEmail: validatedOrder.customerEmail,
        appName: validatedOrder.appName,
      }
    });

    // Store order in memory (replace with database)
    const orderData: OrderData = {
      id: orderId,
      ...validatedOrder,
      hosting: 'cloud', // Default hosting
      addons: [], // Default no addons
      totalAmount: validatedOrder.price,
      status: 'pending',
      stripeSessionId: checkoutSession.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addOrder(orderData);

    return NextResponse.json({
      success: true,
      orderId,
      checkoutSessionId: checkoutSession.id,
      message: 'Order created successfully. Redirecting to payment...'
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

    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}

// Get order details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('sessionId');

    if (!orderId && !sessionId) {
      return NextResponse.json(
        { error: 'Order ID or Session ID is required' },
        { status: 400 }
      );
    }

    let order;
    
    if (orderId) {
      order = findOrderById(orderId);
    } else if (sessionId) {
      // Find order by Stripe session ID
      for (const orderData of getAllOrders()) {
        if (orderData.stripeSessionId === sessionId) {
          order = orderData;
          break;
        }
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If we have a session ID, check payment status with Stripe
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid' && order.status === 'pending') {
          // Update order status to processing
          updateOrder(order.id, {
            status: 'processing',
            updatedAt: new Date().toISOString()
          });
             
          // TODO: Trigger CLI build process here
          setTimeout(() => {
            // Simulate build completion
            updateOrder(order.id, {
              status: 'completed',
              updatedAt: new Date().toISOString()
            });
          }, 2000);
        }
      } catch (stripeError) {
        console.error('Stripe session check error:', stripeError);
      }
    }

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}
