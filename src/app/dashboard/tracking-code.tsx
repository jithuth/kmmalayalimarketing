'use client';

export default function TrackingScript() {
    const scriptCode = `
<script>
  (function() {
    // Kuwait Malayali Analytics
    const ENDPOINT = 'https://your-studio-app.vercel.app/api/track'; // Replace with your deployed URL
    
    function track() {
      try {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
          })
        });
      } catch(e) {}
    }
    
    // Track page view
    track();
    
    // Listen for history changes (SPA support)
    const pushState = history.pushState;
    history.pushState = function() {
      pushState.apply(history, arguments);
      track();
    };
  })();
</script>
  `;

    return (
        <div className="bg-[#1e1e24] p-4 rounded-xl border border-white/10 overflow-hidden">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Installation Code</span>
                <button
                    onClick={() => navigator.clipboard.writeText(scriptCode)}
                    className="text-xs text-yellow-500 hover:text-yellow-400"
                >
                    Copy Code
                </button>
            </div>
            <pre className="font-mono text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap p-2 bg-black/30 rounded-lg">
                {scriptCode}
            </pre>
        </div>
    );
}
