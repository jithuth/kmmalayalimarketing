'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Palette, BarChart3, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Studio', icon: Palette },
        { href: '/dashboard', label: 'Live Analytics', icon: BarChart3 },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
            <div className="glass backdrop-blur-xl bg-black/50 border border-white/10 rounded-full p-1.5 pointer-events-auto flex gap-1 shadow-2xl">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "relative px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors",
                                isActive ? "text-black" : "text-gray-400 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="navbar-indicator"
                                    className="absolute inset-0 bg-yellow-500 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
