
// Simple in-memory storage for demonstration purposes.
// In a production environment, this should be replaced with a real database (Redis, Postgres, etc.)

type PageView = {
    path: string;
    referrer: string;
    timestamp: string;
    ip: string;
    location: string;
};

// Global container to persist across hot-reloads in dev
const globalForAnalytics = global as unknown as { analyticsStore: PageView[] };

export const analyticsStore = globalForAnalytics.analyticsStore || [];

if (process.env.NODE_ENV !== 'production') globalForAnalytics.analyticsStore = analyticsStore;

export function addPageView(view: PageView) {
    // Keep only last 1000 views to prevent memory overflow
    if (analyticsStore.length > 1000) {
        analyticsStore.shift();
    }
    analyticsStore.push(view);
}

export function getRecentViews(limit = 20) {
    return analyticsStore.slice(-limit).reverse();
}

export function getStats() {
    // Group by hour for the chart
    const hours: Record<string, number> = {};

    // Initialize last 24 hours with 0
    for (let i = 0; i < 24; i++) {
        const d = new Date();
        d.setHours(d.getHours() - i);
        const key = d.getHours().toString().padStart(2, '0') + ':00';
        hours[key] = 0;
    }

    // Count actual views
    analyticsStore.forEach(v => {
        const d = new Date(v.timestamp);
        // Only count if within last 24h
        if (Date.now() - d.getTime() < 86400000) {
            const key = d.getHours().toString().padStart(2, '0') + ':00';
            if (hours[key] !== undefined) hours[key]++;
        }
    });

    // Convert to array for Recharts
    const chartData = Object.entries(hours)
        .map(([time, views]) => ({ time, views }))
        .sort((a, b) => {
            // rough sort by hour sequence is tricky with rolling window, 
            // but Recharts handles category axis okay. 
            // Let's just return the raw mapping, or better:
            return 0; // The timestamp based sort is better done by generating keys in order.
        });

    // Actually generate keys in chronological order
    const orderedChartData = [];
    for (let i = 23; i >= 0; i--) {
        const d = new Date();
        d.setHours(d.getHours() - i);
        const key = d.getHours().toString().padStart(2, '0') + ':00';
        orderedChartData.push({
            time: key,
            views: hours[key] || 0
        });
    }

    return {
        totalViews: analyticsStore.length,
        activeNow: analyticsStore.filter(v => Date.now() - new Date(v.timestamp).getTime() < 300000).length, // Last 5 mins
        chartData: orderedChartData,
        recent: getRecentViews(10)
    };
}
