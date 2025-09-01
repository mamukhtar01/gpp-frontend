// generate api route
import { NextResponse } from 'next/server';
export async function GET() {
    return NextResponse.json({ message: 'Hello, this is your API route!' });
}