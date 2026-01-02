import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Add user-agent to avoid being blocked by some sites
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Try to find the main image
        let image = $('meta[property="og:image"]').attr('content');
        if (!image) {
            image = $('meta[name="twitter:image"]').attr('content');
        }
        if (!image) {
            // Fallback: finding the first large image
            $('img').each((i, el) => {
                const src = $(el).attr('src');
                // rudimentary check for "large" or "main" images can be complex, sticking to metatags is safer for now
                // or maybe looking for common classes like 'featured-image', 'post-thumbnail'
                if (src && !image && (src.includes('http') || src.startsWith('/'))) {
                    // naive fallback
                }
            });
        }

        // Try to get title
        let title = $('meta[property="og:title"]').attr('content');
        if (!title) {
            title = $('title').text();
        }

        // Reconstruct valid URL if relative
        if (image && !image.startsWith('http')) {
            const urlObj = new URL(url);
            image = `${urlObj.protocol}//${urlObj.host}${image.startsWith('/') ? '' : '/'}${image}`;
        }

        return NextResponse.json({
            title: title || 'No Title Found',
            image: image || null
        });

    } catch (error: any) {
        console.error('Scrape error:', error);
        return NextResponse.json({ error: 'Failed to scrape the URL' }, { status: 500 });
    }
}
