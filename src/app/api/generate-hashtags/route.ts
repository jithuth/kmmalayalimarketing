
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
    The provided news article might be in Malayalam. Analyze the Title and URL to understand the context.
    
    Generate 10 trending, relevant, and high-reach hashtags in **ENGLISH** (Latin script) only.
    
    Title: "${title}"
    URL: "${url}"
    
    Rules:
    1. **Strictly English/Latin Characters Only**. Do not use Malayalam script (e.g., use #Kerala, NOT #കേരളം).
    2. Always include: #Kuwait #Kerala #KuwaitMalayali
    3. Translate the core topic of the news into English hashtags (e.g., if news is about "Rain", add #KuwaitRain).
    4. Return ONLY the hashtags separated by spaces. No introduction, no bullets.
    5. Example output: #Kuwait #Kerala #KuwaitMalayali #BreakingNews #ExpatLife #GulfNews
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
