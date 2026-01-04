
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Expects GEMINI_API_KEY to be set in .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { title, url } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY Not Found");
            // Fallback or error
            return NextResponse.json({ tags: [] });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Using current available Pro model as proxy for '3.0' or updated via config

        // Prompt including the request for specific behavior
        const prompt = `
    You are a social media expert for 'Kuwait Malayali', a news portal.
    Generate 10 trending, relevant, and high-reach hashtags for this news article.
    
    Title: "${title}"
    URL: "${url}"
    
    Rules:
    1. Always include #Kuwait #Kerala #KuwaitMalayali
    2. Tags should be relevant to the content (mix of English and Malayalam transliterated if popular).
    3. Return ONLY the hashtags separated by spaces. No introduction, no bullets.
    4. Example output: #Kuwait #Kerala #KuwaitMalayali #BreakingNews #ExpatLife #KeralaPolitics
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up response
        const tags = text.trim();

        return NextResponse.json({ tags });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json({ error: 'Failed to generate hashtags' }, { status: 500 });
    }
}
