import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock customer data
    const customers = [
      {
        id: '1',
        email: 'customer1@example.com',
        name: 'John Doe',
        orders: 3,
        totalSpent: 299.99,
        status: 'active'
      },
      {
        id: '2',
        email: 'customer2@example.com',
        name: 'Jane Smith',
        orders: 1,
        totalSpent: 99.99,
        status: 'active'
      }
    ];

    return NextResponse.json({ 
      success: true, 
      customers 
    });

  } catch (error: unknown) {
    console.error('Customers fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch customers' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();
    
    // Mock customer creation
    const newCustomer = {
      id: Date.now().toString(),
      ...customerData,
      orders: 0,
      totalSpent: 0,
      status: 'active'
    };

    return NextResponse.json({ 
      success: true, 
      customer: newCustomer 
    });

  } catch (error: unknown) {
    console.error('Customer creation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create customer' 
    }, { status: 500 });
  }
}