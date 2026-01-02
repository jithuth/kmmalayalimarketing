# News to Art Generator (Nano Banana Edition)

This application transforms news articles into artistic images using the "Nano Banana" (Google Gemini Image) workflow.

## Features
- **Auto-Scraping**: Paste a news URL, and the app automatically extracts the headline and the main banner image (reference picture).
- **Prompt Engineering**: Automatically generates a prompt based on the title.
- **Modern UI**: sleek, dark-themed interface with glassmorphism effects.

## Setup

1. **Navigate to the app directory**:
   ```bash
   cd app
   ```

2. **Install Dependencies** (if not done):
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Configuring the Generator

Currently, the generation is **simulated** for demonstration purposes. To connect to the real Nano Banana / Google Gemini API:

1. Open `src/app/page.tsx`.
2. Locate the `handleGenerate` function.
3. Replace the simulated `setTimeout` and `setGeneratedImage` with your actual API call.

```typescript
// Example using Google Generative AI (pseudocode)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
// ... implementation ...
```

## Tech Stack
- Next.js 14
- Tailwind CSS
- Cheerio (Scraping)
- Framer Motion (Animations)
