// @ts-nocheck
/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { findOrderByStripeSession, updateOrder } from '@/lib/data-store';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handlePaymentSuccess(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  try {
    const orderId = session.metadata?.orderId;
    
    if (!orderId || !orders.has(orderId)) {
      console.error('Order not found for session:', session.id);
      return;
    }

    const order = orders.get(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }
    
    // Update order status
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    order.stripePaymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : undefined;
    orders.set(orderId, order);

    console.log(`Payment successful for order ${orderId}`);
    
    // Trigger CLI build process
    setTimeout(async () => {
      await triggerAppBuild(order);
    }, 1000);

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find order by payment intent
    for (const [orderId, order] of orders.entries()) {
      if (order.stripePaymentIntentId === paymentIntent.id) {
        order.status = 'payment_failed';
        order.paymentFailedAt = new Date().toISOString();
        order.updatedAt = new Date().toISOString();
        orders.set(orderId, order);
        
        console.log(`Payment failed for order ${orderId}`);
        break;
      }
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function triggerAppBuild(order: any) {
  try {
    // Update order status to building
    order.status = 'building';
    order.buildStartedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    order.progress = 0;
    orders.set(order.id, order);

    console.log(`Starting build for order ${order.id}: ${order.appName}`);

    // Call the existing build API with order parameters
    const buildResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: order.appName,
        description: order.appDescription,
        framework: order.framework,
        features: order.features,
        complexity: order.complexity,
        database: order.database,
        authentication: order.authentication,
        userId: `customer_${order.id}`,
        orderId: order.id,
        // Additional context for custom build
        isCustomOrder: true,
        deliveryMethod: order.deliveryMethod,
        timeline: order.timeline,
        specialRequirements: order.specialRequirements
      }),
    });

    if (buildResponse.ok) {
      const buildData = await buildResponse.json();
      
      // Update order with build information
      order.buildId = buildData.appId || `build_${Date.now()}`;
      order.buildLogs = ['✓ Build process initiated'];
      orders.set(order.id, order);
      
      // Simulate build progress
      simulateBuildProgress(order);
    } else {
      throw new Error('Build API call failed');
    }

  } catch (error) {
    console.error('Error triggering app build:', error);
    
    // Update order status to build_failed
    order.status = 'build_failed';
    order.buildFailedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    order.buildError = error instanceof Error ? error.message : 'Unknown build error';
    orders.set(order.id, order);
  }
}

function simulateBuildProgress(order: any) {
  const buildSteps = [
    'Analyzing requirements...',
    'Setting up project structure...',
    'Installing dependencies...',
    'Generating components...',
    'Configuring database...',
    'Setting up authentication...',
    'Running tests...',
    'Building for production...',
    'Preparing deployment...',
    'Finalizing delivery...'
  ];

  let currentStep = 0;
  const totalSteps = buildSteps.length;

  const progressInterval = setInterval(() => {
    if (currentStep < totalSteps && orders.has(order.id)) {
      const updatedOrder = orders.get(order.id);
      
      updatedOrder.progress = Math.round((currentStep / totalSteps) * 100);
      updatedOrder.currentBuildStep = buildSteps[currentStep];
      updatedOrder.buildLogs = updatedOrder.buildLogs || [];
      updatedOrder.buildLogs.push(`✓ ${buildSteps[currentStep]}`);
      updatedOrder.updatedAt = new Date().toISOString();
      
      if (currentStep === totalSteps - 1) {
        // Build completed
        updatedOrder.status = 'completed';
        updatedOrder.progress = 100;
        updatedOrder.completedAt = new Date().toISOString();
        updatedOrder.buildLogs.push('🎉 Build completed successfully!');
        
        // Add delivery information based on delivery method
        switch (order.deliveryMethod) {
          case 'github':
            updatedOrder.deliveryUrl = `https://github.com/ece-cli-generated/${order.appName.toLowerCase().replace(/\s+/g, '-')}`;
            break;
          case 'zip':
            updatedOrder.deliveryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/download?orderId=${order.id}`;
            break;
          case 'deployed':
            updatedOrder.deliveryUrl = `https://${order.appName.toLowerCase().replace(/\s+/g, '-')}-${order.id.slice(-8)}.vercel.app`;
            updatedOrder.adminUrl = `${updatedOrder.deliveryUrl}/admin`;
            break;
        }
        
        clearInterval(progressInterval);
      }
      
      orders.set(order.id, updatedOrder);
      currentStep++;
    } else {
      clearInterval(progressInterval);
    }
  }, 3000 + Math.random() * 2000); // Random build time simulation
}
