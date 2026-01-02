import { NextRequest, NextResponse } from 'next/server';
import { addPageView } from '@/lib/analytics';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const headers = req.headers;

        // Attempt to get IP
        let ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || '127.0.0.1';
        if (ip.includes(',')) ip = ip.split(',')[0];

        // Simulate Geo-location (since we don't have a real GeoIP DB here)
        // In production, use Vercel's `req.geo` or a service like MaxMind
        const city = headers.get('x-vercel-ip-city') || 'Unknown City';
        const country = headers.get('x-vercel-ip-country') || 'Unknown';
        const location = city !== 'Unknown City' ? `${city}, ${country}` : 'Kuwait City, KW'; // Fallback for demo

        addPageView({
            path: data.path || '/',
            referrer: data.referrer || '',
            timestamp: new Date().toISOString(),
            ip,
            location
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Tracking Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Analytics Endpoint Active. Send POST requests here."
    });
}
