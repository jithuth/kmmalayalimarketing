'use client';

import { motion } from 'framer-motion';
import { Users, Eye, TrendingUp, Globe, Clock, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import TrackingScript from './tracking-code';

// Mock Data
const viewsData = [
    { time: '00:00', views: 120 }, { time: '04:00', views: 80 },
    { time: '08:00', views: 450 }, { time: '12:00', views: 980 },
    { time: '16:00', views: 850 }, { time: '20:00', views: 600 },
    { time: '23:59', views: 320 },
];

const liveVisitors = [
    { ip: '188.23.45.xx', location: 'Kuwait City, KW', page: '/news/kerala-latest', time: 'Just now' },
    { ip: '92.11.34.xx', location: 'Salmiya, KW', page: '/images/gallery', time: '1m ago' },
    { ip: '104.22.xx.xx', location: 'Dubai, UAE', page: '/news/uae-visa', time: '2m ago' },
    { ip: '45.33.22.xx', location: 'Kochi, IN', page: '/', time: '5m ago' },
];

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 pt-24 selection:bg-yellow-500/30">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                        <p className="text-gray-400">Live tracker for kuwaitmalayali.com</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full text-sm animate-pulse">
                        <Activity className="w-4 h-4" />
                        <span>System Operational</span>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Active Readers', value: '1,234', sub: '+12% from yesterday', icon: Users, color: 'text-blue-400' },
                        { label: 'Page Views (Today)', value: '45.2K', sub: 'Daily Peak: 12 PM', icon: Eye, color: 'text-yellow-400' },
                        { label: 'Avg. Session', value: '4m 32s', sub: '+30s increase', icon: Clock, color: 'text-purple-400' },
                        { label: 'Top Country', value: 'Kuwait', sub: '85% of traffic', icon: Globe, color: 'text-green-400' },
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
                                <AreaChart data={viewsData}>
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
                        <div className="space-y-4 flex-1 overflow-auto">
                            {liveVisitors.map((visit, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <div className="text-sm font-medium">{visit.location}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{visit.page}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-yellow-500">{visit.ip}</div>
                                        <div className="text-[10px] text-gray-600">{visit.time}</div>
                                    </div>
                                </div>
                            ))}
                            <div className="text-center text-xs text-gray-500 pt-4">Updating in real-time...</div>
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
