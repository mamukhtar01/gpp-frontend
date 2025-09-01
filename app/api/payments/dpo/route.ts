import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Process the payment data here
        console.log('Payment data received:', body);

        // Example response
        return NextResponse.json({ message: 'Payment processed successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }
}