import React from "react";
import { BarChart2, TrendingUp, Users, Activity } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="space-y-12 max-w-6xl">
            <div>
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-4">
          // TELEMETRY
                </p>
                <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider uppercase">
                            TOTAL REACH
                        </div>
                        <Users className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="text-4xl font-bold mb-2">2.4M</div>
                    <div className="font-['IBM_Plex_Mono'] text-[10px] text-green-600 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> +14.5% THIS MONTH
                    </div>
                </div>
                <div className="bg-white p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider uppercase">
                            PLATFORM ENGAGEMENT
                        </div>
                        <Activity className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="text-4xl font-bold mb-2">8.2%</div>
                    <div className="font-['IBM_Plex_Mono'] text-[10px] text-green-600 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> +1.2% THIS MONTH
                    </div>
                </div>
                <div className="bg-white p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider uppercase">
                            GENERATIONS
                        </div>
                        <BarChart2 className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="text-4xl font-bold mb-2">1,248</div>
                    <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 uppercase tracking-wider">
                        30 DAY VOLUME
                    </div>
                </div>
                <div className="bg-white p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider uppercase">
                            AVG LATENCY
                        </div>
                        <Activity className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="text-4xl font-bold mb-2">1.2s</div>
                    <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 uppercase tracking-wider">
                        SYSTEM RESPONSE
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm p-6 min-h-[400px] flex items-center justify-center relative">
                <div className="absolute top-6 left-6 font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider uppercase">
                    ENGAGEMENT MATRIX
                </div>
                <div className="text-center">
                    <div className="text-gray-300 mb-2">[ DATA VISUALIZATION MODULE ]</div>
                    <p className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-widest uppercase">Awaiting sufficiently dense telemetry for quantum mapping.</p>
                </div>
            </div>
        </div>
    );
}
