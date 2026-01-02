import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // In a real application, you would save this data to a database (MongoDB, PostgreSQL, etc.)
        // For now, we will just log it to the console to simulate receiving data.
        console.log('[Analytics Received]', {
            ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
            ...data
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Analytics Endpoint Active. Send POST requests here."
    });
}
