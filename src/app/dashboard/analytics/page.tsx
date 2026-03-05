"use client";

import React, { useEffect, useState } from "react";
import { BarChart2, TrendingUp, Users, Activity, Zap, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface AnalyticsData {
    totalGenerated: number;
    totalScheduled: number;
    totalPosted: number;
    totalFailed: number;
    connectedPlatforms: string[];
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const metrics = data ? [
        {
            label: "Pieces Generated",
            value: data.totalGenerated,
            icon: <BarChart2 className="h-4 w-4 text-gray-300" />,
            sub: "Total content created",
            trend: null,
        },
        {
            label: "Posts Queued",
            value: data.totalScheduled,
            icon: <Clock className="h-4 w-4 text-gray-300" />,
            sub: "Pending publication",
            trend: null,
        },
        {
            label: "Posts Published",
            value: data.totalPosted,
            icon: <CheckCircle className="h-4 w-4 text-gray-300" />,
            sub: "Successfully posted",
            trend: null,
        },
        {
            label: "Platforms Live",
            value: data.connectedPlatforms.length,
            icon: <Zap className="h-4 w-4 text-gray-300" />,
            sub: data.connectedPlatforms.length > 0 ? data.connectedPlatforms.join(", ") : "None connected",
            trend: null,
        },
    ] : [];

    return (
        <div className="space-y-12 max-w-6xl">
            <div>
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-4">
                    // TELEMETRY
                </p>
                <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-6 border border-gray-200 shadow-sm animate-pulse h-32" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((m, i) => (
                        <div key={i} className="bg-white p-6 border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider uppercase">
                                    {m.label}
                                </div>
                                {m.icon}
                            </div>
                            <div className="text-4xl font-bold mb-2">{m.value}</div>
                            <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 uppercase tracking-wider">
                                {m.sub}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Platform breakdown */}
            {!loading && data && (
                <div className="bg-white border border-gray-200 shadow-sm p-8">
                    <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider uppercase mb-8">
                        PLATFORM PERFORMANCE
                    </div>
                    {data.connectedPlatforms.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Users className="h-8 w-8 mx-auto mb-4 text-gray-200" />
                            <p className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider mb-2 text-gray-500">No platforms connected</p>
                            <p className="text-sm">Connect LinkedIn or Twitter from <a href="/dashboard/setup" className="underline hover:text-black">Setup → Platforms</a></p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.connectedPlatforms.map(platform => (
                                <div key={platform} className="flex items-center justify-between py-3 border-b border-gray-50">
                                    <span className="font-['Space_Grotesk'] font-semibold text-sm">{platform}</span>
                                    <span className="font-['IBM_Plex_Mono'] text-[10px] text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5">
                                        CONNECTED
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {data.totalGenerated === 0 && (
                        <div className="mt-8 border border-dashed border-gray-200 p-8 text-center">
                            <Activity className="h-6 w-6 mx-auto mb-3 text-gray-300" />
                            <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider text-gray-400">
                                Generate your first content to see activity here
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
