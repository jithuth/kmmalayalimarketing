'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, TrendingUp, Globe, Clock, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import TrackingScript from './tracking-code';

export default function Dashboard() {
    const [data, setData] = useState<{
        totalViews: number;
        activeNow: number;
        chartData: any[];
        recent: any[];
    } | null>(null);

    // Poll for updates every 5 seconds
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (e) {
                console.error('Failed to fetch stats');
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const chartData = data?.chartData || [];
    const liveVisitors = data?.recent || [];

    // Quick calculations or fallbacks
    const totalViews = data?.totalViews || 0;
    const activeNow = data?.activeNow || 0;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 pt-24 selection:bg-yellow-500/30">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                        <p className="text-gray-400">Live tracker for kuwaitmalayali.com</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={async () => {
                                const locations = ['Kuwait City, KW', 'Dubai, AE', 'Kochi, IN', 'London, UK', 'New York, US'];
                                const pages = ['/news/breaking', '/gallery', '/about', '/', '/contact'];
                                await fetch('/api/track', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        path: pages[Math.floor(Math.random() * pages.length)],
                                        referrer: 'https://google.com',
                                        location: locations[Math.floor(Math.random() * locations.length)] // Client-side simulation hint
                                    })
                                });
                                // trigger immediate refresh if in same cycle (optional, dashboard polls anyway)
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-full transition flex items-center gap-2"
                        >
                            <Activity className="w-4 h-4" />
                            Simulate Visitor
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full text-sm animate-pulse">
                            <Activity className="w-4 h-4" />
                            <span>System Operational</span>
                        </div>
                    </div>        </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Active Sessions', value: activeNow, sub: 'Right Now', icon: Users, color: 'text-blue-400' },
                        { label: 'Total Page Views', value: totalViews, sub: 'All Time (In-Memory)', icon: Eye, color: 'text-yellow-400' },
                        { label: 'Avg. Session', value: 'Live', sub: 'Calculating...', icon: Clock, color: 'text-purple-400' },
                        { label: 'Top Country', value: 'Kuwait', sub: 'Mostly detected', icon: Globe, color: 'text-green-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 rounded-2xl border border-white/5 bg-[#121215] hover:bg-[#18181b] transition"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                {i === 1 && <TrendingUp className="w-4 h-4 text-green-500" />}
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                            <div className="text-xs text-gray-600 mt-2">{stat.sub}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Chart */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 p-6 rounded-2xl border border-white/5 bg-[#121215]">
                        <h3 className="text-lg font-semibold mb-6">Traffic Overview (24h)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="views" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Live Feed */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-[#121215] flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Live Visitors
                        </h3>
                        <div className="space-y-4 flex-1 overflow-auto max-h-[400px]">
                            {liveVisitors.length === 0 && <div className="text-gray-500 text-sm">Waiting for first visitor...</div>}
                            {liveVisitors.map((visit, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 animate-in fade-in slide-in-from-right-4">
                                    <div>
                                        <div className="text-sm font-medium">{visit.location}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{visit.path}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-yellow-500">{visit.ip}</div>
                                        <div className="text-[10px] text-gray-600">
                                            {new Date(visit.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Integration Instructions */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Setup Tracking</h3>
                    <p className="text-gray-400 text-sm">To see real data here, you must add the tracking script to your main website.</p>
                    <TrackingScript />
                </div>

            </div>
        </div>
    );
}
