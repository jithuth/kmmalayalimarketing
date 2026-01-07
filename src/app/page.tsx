'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Download, Type, LayoutTemplate, ArrowRight, RefreshCw, Share2, Facebook, Instagram, MessageCircle, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Comfortaa } from 'next/font/google';

// Use a nice font for the overlay
const overlayFont = Comfortaa({ subsets: ['latin'], weight: ['700'] });

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'editor'>('input');
  const [newsData, setNewsData] = useState<{ title: string; image: string | null } | null>(null);

  // Editor state
  // Editor state
  const [customTitle, setCustomTitle] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper to generate hashtags
  // Helper to generate hashtags using Gemini
  const fetchHashtags = async (title: string, articleUrl: string, description: string = '') => {
    setIsGeneratingTags(true);
    setHashtags('Generating tags...');
    try {
      const res = await fetch('/api/generate-hashtags', {
        method: 'POST',
        body: JSON.stringify({ title, url: articleUrl, description }),
      });
      const data = await res.json();
      if (data.tags && data.tags.length > 0) {
        setHashtags(data.tags);
      } else {
        setHashtags(generateLocalHashtags(title));
      }
    } catch (e) {
      console.error("Hashtag generation error:", e);
      setHashtags(generateLocalHashtags(title));
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const generateLocalHashtags = (text: string) => {
    const stopWords = ['the', 'is', 'in', 'at', 'of', 'on', 'and', 'to', 'for', 'with', 'a', 'an', 'by', 'from', 'news', 'update'];
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
    const unique = Array.from(new Set(words));
    const tags = unique.slice(0, 8).map(w => `#${w}`);
    if (!tags.includes('#Kuwait')) tags.push('#Kuwait');
    if (!tags.includes('#Kerala')) tags.push('#Kerala');
    if (!tags.includes('#KuwaitMalayali')) tags.push('#KuwaitMalayali');
    return tags.join(' ');
  };

  const handleScrape = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.image) {
        const title = data.title || '';
        const description = data.description || '';
        setNewsData(data);
        setCustomTitle(title);

        // Trigger AI Tag Generation
        fetchHashtags(title, url, description);
        setStep('editor');
      } else {
        alert('Could not find a suitable image in this article.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to scrape URL.');
    } finally {
      setLoading(false);
    }
  };

  const generateCard = async () => {
    if (!newsData?.image || !canvasRef.current) return;
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    // Use proxy to avoid CORS
    img.crossOrigin = 'anonymous';
    img.src = `/api/proxy-image?url=${encodeURIComponent(newsData.image)}`;

    img.onload = () => {
      // Set canvas to high res square or keep aspect ratio? 
      // Let's keep aspect ratio but ensure it's at least 1080px wide for quality
      const targetWidth = 1080;
      const scale = targetWidth / img.width;
      const targetHeight = img.height * scale;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw Image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Add Gradient Overlay at the bottom for text readability
      const gradient = ctx.createLinearGradient(0, targetHeight * 0.5, 0, targetHeight);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.7, 'rgba(0,0,0,0.8)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw Text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';

      // Font setup
      const fontSize = Math.floor(targetWidth * 0.05); // 5% of width
      ctx.font = `700 ${fontSize}px sans-serif`;
      ctx.font = `bold ${fontSize}px "Inter", "Segoe UI", sans-serif`;

      const text = customTitle;
      const margin = targetWidth * 0.05;
      const x = margin;
      let y = targetHeight - margin * 1.5;
      const maxWidth = targetWidth - (margin * 2);
      const lineHeight = fontSize * 1.3;

      // Word Wrap
      const words = text.split(' ');
      let line = '';
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      lines.reverse().forEach((l, i) => {
        ctx.fillText(l.trim(), x, targetHeight - margin - (i * lineHeight));
      });

      // Add a "Branding" or "News" tag
      ctx.font = `bold ${fontSize * 0.6}px sans-serif`;
      ctx.fillStyle = '#facc15'; // Yellow
      ctx.fillText('BREAKING NEWS', x, targetHeight - margin - (lines.length * lineHeight) - 20);

      // Watermark Logo
      const logo = new Image();
      logo.src = '/logo.png'; // Expects a file in /public/logo.png
      logo.onload = () => {
        const logoWidth = targetWidth * 0.15; // 15% width
        const logoHeight = logo.height * (logoWidth / logo.width);
        const logoX = targetWidth - logoWidth - margin;
        const logoY = margin;

        // Add a subtle drop shadow to logo
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
        ctx.shadowBlur = 0; // reset

        setProcessedImage(canvas.toDataURL('image/png'));
        setIsProcessing(false);
      };
      logo.onerror = () => {
        // Fallback: Text Watermark
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.font = `bold ${fontSize * 0.5}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'right';
        ctx.fillText('kuwaitmalayali.com', targetWidth - margin, margin + fontSize);
        ctx.shadowBlur = 0;

        setProcessedImage(canvas.toDataURL('image/png'));
        setIsProcessing(false);
      };
    };
    img.onerror = () => {
      setIsProcessing(false);
      alert('Failed to load image for processing');
    };
  };

  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const generateVideo = async () => {
    if (!processedImage) return;
    setIsGeneratingVideo(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = processedImage;
      await new Promise(r => img.onload = r);

      const stream = canvas.captureStream(30);

      // Select best MIME type (prioritize MP4 for TikTok)
      const mimeTypes = [
        'video/mp4',
        'video/mp4;codecs=h264',
        'video/mp4;codecs=avc1',
        'video/webm;codecs=h264',
        'video/webm'
      ];
      const selectedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
      console.log(`Using MIME type: ${selectedMime}`);

      const recorder = new MediaRecorder(stream, { mimeType: selectedMime });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {

        const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `news-story-${Date.now()}.${ext}`;
        a.click();

        // Warning if MP4 wasn't supported
        if (ext !== 'mp4') {
          alert('Note: Your browser does not support direct MP4 recording. A WebM file was generated instead. You may need to convert it for TikTok.');
        }

        // Automate: Copy Caption to Clipboard
        const caption = `${customTitle}\n\n${hashtags}`;
        try {
          // Note: navigator.clipboard usually requires focus or user interaction, which is present here
          if (navigator.clipboard) {
            navigator.clipboard.writeText(caption).catch(err => console.error('Copy failed', err));
          }
        } catch (err) {
          console.error('Failed to copy caption', err);
        }

        // Open TikTok Upload page
        setTimeout(() => {
          if (confirm('Video downloaded & Caption copied!\n\nOpen TikTok to upload now? (Just paste the caption there)')) {
            window.open('https://www.tiktok.com/upload?lang=en', '_blank');
          }
        }, 500);

        setIsGeneratingVideo(false);
      };

      recorder.start();

      let startTime = Date.now();
      const duration = 10000; // 10s

      const draw = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);

        if (progress >= 1) {
          recorder.stop();
          return;
        }

        // Draw Background (Blurred & Zooming)
        ctx!.fillStyle = '#000';
        ctx!.fillRect(0, 0, 1080, 1920);

        ctx!.save();
        const scale = 1 + (progress * 0.1); // Slight zoom (1.0 to 1.1)

        // Draw blurred BG
        ctx!.filter = 'blur(40px)';
        // Center the image as background, heavily scaled to fill
        const bgScale = Math.max(1080 / img.width, 1920 / img.height) * scale;
        const bgW = img.width * bgScale;
        const bgH = img.height * bgScale;
        ctx!.drawImage(img, (1080 - bgW) / 2, (1920 - bgH) / 2, bgW, bgH);

        ctx!.restore();

        // Draw Foreground (Sharp Card)
        // Center it
        const cardScale = Math.min(1080 / img.width, 1080 / img.height); // Fit width
        const cardW = img.width * cardScale;
        const cardH = img.height * cardScale;
        const cardY = (1920 - cardH) / 2;

        ctx!.drawImage(img, 0, cardY, cardW, cardH);

        requestAnimationFrame(draw);
      };

      draw();
    } catch (e) {
      console.error(e);
      alert('Video generation failed');
      setIsGeneratingVideo(false);
    }
  };

  // Generate initial preview on mount/change
  useEffect(() => {
    if (step === 'editor') {
      generateCard();
    }
  }, [step, newsData]);

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-hidden selection:bg-yellow-500/30 ${overlayFont.className}`}>
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col min-h-screen">

        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold text-xl">N</div>
            <h1 className="text-2xl font-bold tracking-tight">NewsCard<span className="text-yellow-500">.ai</span></h1>
          </div>
          {step === 'editor' && (
            <button onClick={() => setStep('input')} className="text-sm text-gray-400 hover:text-white transition">
              Start New
            </button>
          )}
        </header>

        {/* Input Step */}
        {step === 'input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Turn Articles into Social Cards
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Paste a news link below. We'll grab the image and title, ready for you to share.
            </p>

            <div className="glass-card p-2 rounded-2xl flex items-center gap-2 shadow-2xl w-full">
              <div className="p-3 bg-white/5 rounded-xl">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <input
                type="url"
                placeholder="https://example.com/news/article..."
                className="flex-1 bg-transparent border-none outline-none text-lg px-2 text-white placeholder:text-gray-600 h-12"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
              />
              <button
                onClick={handleScrape}
                disabled={loading || !url}
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        )}

        {/* Editor Step */}
        {step === 'editor' && newsData && (
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <Type className="w-4 h-4 text-yellow-500" />
                    Headline
                  </label>
                  <textarea
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-lg text-white focus:border-yellow-500/50 outline-none resize-none h-32 leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <span className="text-yellow-500">#</span>
                    Hashtags
                  </label>
                  <textarea
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#news #update..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:border-yellow-500/50 outline-none resize-none h-24 font-mono"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={generateCard}
                    disabled={isProcessing}
                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={cn("w-4 h-4", isProcessing && "animate-spin")} />
                    Update Preview
                  </button>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/10 rounded-xl text-yellow-500 text-sm">
                ✨ Pro Tip: Shorten the headline for better visual impact on social media.
              </div>
            </motion.div>

            {/* Right: Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="glass-card p-2 rounded-2xl shadow-2xl relative overflow-hidden group">

                {/* The Canvas (Hidden, used for processing) */}
                <canvas ref={canvasRef} className="hidden" />

                {/* The Result Image */}
                {processedImage ? (
                  <img src={processedImage} alt="Social Card" className="w-full rounded-xl shadow-lg" />
                ) : (
                  // Loading State Placeholder
                  <div className="w-full aspect-square bg-white/5 rounded-xl flex flex-col items-center justify-center gap-4 animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    <p className="text-gray-500 font-mono text-sm">Rendering Compositor...</p>
                  </div>
                )}

              </div>

              {processedImage && (
                <div className="mt-6 flex flex-col items-center gap-4">

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {/* Native Share (Mobile/Supported) */}
                    <button
                      onClick={async () => {
                        if (!processedImage) return;
                        try {
                          const blob = await (await fetch(processedImage)).blob();
                          const file = new File([blob], 'news-card.png', { type: 'image/png' });

                          if (navigator.share) {
                            await navigator.share({
                              title: customTitle,
                              text: customTitle,
                              files: [file],
                            });
                          } else {
                            alert('Web Share not supported. Use the buttons below.');
                          }
                        } catch (err) {
                          console.error('Error sharing:', err);
                        }
                      }}
                      className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-400 transition transform hover:scale-105 flex items-center gap-2 shadow-xl"
                    >
                      <Share2 className="w-4 h-4" />
                      Share App
                    </button>

                    <a
                      href={processedImage}
                      download={`news-card-${Date.now()}.png`}
                      className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-2 rounded-full font-semibold hover:bg-white/20 transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Save
                    </a>
                  </div>

                  <div className="flex gap-2">
                    {/* Add WhatsApp Channel URL */}
                    <a
                      href="https://whatsapp.com/channel/0029VbCcGt08fewpHoZYm91M"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-[#075E54] text-white hover:scale-110 transition shadow-lg"
                      title="View WhatsApp Channel"
                    >
                      <div className="relative">
                        <MessageCircle className="w-5 h-5 fill-current" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      </div>
                    </a>

                    {/* WhatsApp Share (Text Only) */}
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(`*${customTitle}*\n\n${hashtags}\n\nRead more: ${url}`);
                        window.open(`https://wa.me/?text=${text}`, '_blank');
                      }}
                      className="p-3 rounded-full bg-[#25D366] text-white hover:scale-110 transition shadow-lg"
                      title="Share to WhatsApp"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>

                    {/* Facebook (Link Only) */}
                    <button
                      onClick={() => {
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                      }}
                      className="p-3 rounded-full bg-[#1877F2] text-white hover:scale-110 transition shadow-lg"
                      title="Share Link to Facebook"
                    >
                      <Facebook className="w-5 h-5 fill-current" />
                    </button>

                    {/* Instagram (Manual Copy Hint) */}
                    <button
                      onClick={async () => {
                        // Copy image to clipboard for manual pasting
                        try {
                          const blob = await (await fetch(processedImage)).blob();
                          await navigator.clipboard.write([
                            new ClipboardItem({
                              [blob.type]: blob
                            })
                          ]);
                          alert('Image copied to clipboard! Open Instagram and paste it (or create new post).');
                        } catch (err) {
                          alert('Could not copy image automatically. Please download it first.');
                        }
                      }}
                      className="p-3 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:scale-110 transition shadow-lg"
                      title="Copy Image for Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </button>

                    {/* TikTok Video Generator */}
                    <button
                      onClick={generateVideo}
                      disabled={isGeneratingVideo}
                      className="p-3 rounded-full bg-black border border-gray-700 text-white hover:scale-110 transition shadow-lg relative overflow-hidden"
                      title="Generate TikTok Video"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea] to-[#ff0050] opacity-20" />
                      {isGeneratingVideo ? (
                        <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                      ) : (
                        <Video className="w-5 h-5 relative z-10" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

      </main>
    </div>
  );
}
