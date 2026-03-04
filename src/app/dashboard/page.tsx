"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        fetch("/api/user/status")
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUserName(data.user.name || data.user.email?.split("@")[0] || "User");
                }
            })
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <p className="font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-400 tracking-[0.2em] mb-2">
            // DASHBOARD
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back, {userName}</h1>
                </div>
                <Link href="/dashboard/create">
                    <button className="bg-black text-white font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.15em] px-4 py-3 hover:bg-black/90 transition flex items-center gap-2">
                        <Plus className="h-3 w-3" /> NEW SYNDICATION
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Metric Cards */}
                <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] flex flex-col justify-between h-32">
                    <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider uppercase mb-2">
                        GENERATIONS
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-1">5</div>
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-500 uppercase tracking-wider">
                            +12% this week
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] flex flex-col justify-between h-32">
                    <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider uppercase mb-2">
                        SOURCE ITEMS
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-1">14</div>
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-500 uppercase tracking-wider">
                            In library
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] flex flex-col justify-between h-32">
                    <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider uppercase mb-2">
                        ACTIVE PLATFORMS
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-1">3</div>
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-500 uppercase tracking-wider">
                            Configured
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] flex flex-col justify-between h-32">
                    <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider uppercase mb-2 flex justify-between items-center">
                        <span>CREDITS</span>
                        <span className="text-black font-semibold">150 / 1000</span>
                    </div>
                    <div>
                        <div className="h-0.5 bg-gray-100 w-full mb-3 mt-4">
                            <div className="h-full bg-black w-[15%]" />
                        </div>
                        <button className="font-['IBM_Plex_Mono'] text-[9px] text-gray-500 uppercase tracking-wider hover:text-black transition-colors text-left w-full">
                            UPGRADE →
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Col: Chart */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] p-6 min-h-[460px] flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-['Space_Grotesk'] font-bold text-sm text-gray-900">Generation Throughput</h2>
                            <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-500 tracking-wider uppercase flex items-center gap-1 cursor-pointer hover:text-black transition-colors">
                                LAST 7 DAYS
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        {/* SVG Chart Mockup */}
                        <div className="flex-1 relative w-full h-[280px] mb-8">
                            <svg width="100%" height="100%" viewBox="0 0 800 240" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="solidArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
                                        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                                    </linearGradient>
                                </defs>

                                {/* Y Axis labels */}
                                <text x="0" y="20" className="font-['IBM_Plex_Mono'] text-[9px] fill-gray-400">16</text>
                                <text x="0" y="100" className="font-['IBM_Plex_Mono'] text-[9px] fill-gray-400">12</text>
                                <text x="0" y="180" className="font-['IBM_Plex_Mono'] text-[9px] fill-gray-400">8</text>
                                <text x="0" y="240" className="font-['IBM_Plex_Mono'] text-[9px] fill-gray-400">4</text>

                                {/* Line 1 Main (Solid, shaded) */}
                                <path d="M 40 220 
                         C 150 250, 200 130, 300 120 
                         C 400 110, 500 170, 600 210 
                         C 700 250, 750 160, 780 140
                        "
                                    fill="none" stroke="#6b7280" strokeWidth="2" />

                                <path d="M 40 220 
                         C 150 250, 200 130, 300 120 
                         C 400 110, 500 170, 600 210 
                         C 700 250, 750 160, 780 140
                         L 780 240 L 40 240 Z"
                                    fill="url(#solidArea)" />

                                {/* Line 2 (Dashed) */}
                                <path d="M 40 140 
                         C 180 100, 280 100, 360 80 
                         C 440 60, 550 190, 650 180 
                         C 700 175, 750 100, 780 70"
                                    fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 4" />

                            </svg>

                            {/* X Axis Labels */}
                            <div className="absolute -bottom-6 left-0 w-full flex justify-between text-gray-400 font-['IBM_Plex_Mono'] text-[9px] uppercase pl-10 pr-2">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-2 font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-500 tracking-wider">
                                <div className="w-4 h-0.5 bg-gray-500"></div> LINKEDIN
                            </div>
                            <div className="flex items-center gap-2 font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-500 tracking-wider">
                                <div className="w-4 h-0 border-t-2 border-gray-400 border-dashed"></div> X / TWITTER
                            </div>
                            <div className="flex items-center gap-2 font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-500 tracking-wider">
                                <div className="w-4 h-0 border-t border-gray-300 border-dotted mt-0.5 text-gray-300">......</div> BLOG
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col */}
                <div className="space-y-4">
                    {/* Upcoming Card */}
                    <div className="bg-white border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] p-6 min-h-[220px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-['Space_Grotesk'] font-bold text-sm flex items-center gap-2 text-gray-900">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                Upcoming
                            </h2>
                            <span className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider uppercase">QUEUE</span>
                        </div>

                        <div className="space-y-5">
                            <div className="flex flex-col border-b border-gray-50 pb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-['IBM_Plex_Mono'] text-[9px] font-semibold tracking-wider text-gray-800">LINKEDIN</span>
                                    <span className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider">Today, 2:00 PM</span>
                                </div>
                                <span className="text-gray-500 text-[13px] font-['Space_Grotesk'] truncate">New feature launch for Q3.</span>
                            </div>

                            <div className="flex flex-col border-b border-gray-50 pb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-['IBM_Plex_Mono'] text-[9px] font-semibold tracking-wider text-gray-800">TWITTER</span>
                                    <span className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider">Tomorrow, 9:00 AM</span>
                                </div>
                                <span className="text-gray-500 text-[13px] font-['Space_Grotesk'] truncate">Hiring a new principal engineer.</span>
                            </div>

                            <div className="flex flex-col border-b border-gray-50 pb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-['IBM_Plex_Mono'] text-[9px] font-semibold tracking-wider text-gray-800">LINKEDIN</span>
                                    <span className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider">Wed, 11:00 AM</span>
                                </div>
                                <span className="text-gray-500 text-[13px] font-['Space_Grotesk'] truncate">Remote work is here to stay.</span>
                            </div>

                            <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-['IBM_Plex_Mono'] text-[9px] font-semibold tracking-wider text-gray-800">BLOG</span>
                                    <span className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider">Thu, 3:00 PM</span>
                                </div>
                                <span className="text-gray-500 text-[13px] font-['Space_Grotesk'] truncate">Why we switched from REST to GraphQL.</span>
                            </div>
                        </div>
                    </div>

                    {/* System Log Card */}
                    <div className="bg-white border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] p-6 min-h-[200px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-['Space_Grotesk'] font-bold text-sm flex items-center gap-2 text-gray-900">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                System Log
                            </h2>
                        </div>

                        <div className="relative border-l border-gray-100 ml-1.5 pl-4 flex flex-col gap-5">

                            <div className="relative">
                                <div className="absolute -left-[21px] top-1.5 w-1.5 h-1.5 bg-black border-[3px] border-white box-content shrink-0" />
                                <div>
                                    <h4 className="font-['Space_Grotesk'] text-[13px] font-semibold text-gray-900 leading-tight">Syndicated Content</h4>
                                    <p className="font-['IBM_Plex_Mono'] text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">Posted to LinkedIn & X</p>
                                    <p className="font-['IBM_Plex_Mono'] text-[8px] text-gray-400 uppercase tracking-wider mt-1.5">2M AGO</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[21px] top-1.5 w-1.5 h-1.5 bg-black border-[3px] border-white box-content shrink-0" />
                                <div>
                                    <h4 className="font-['Space_Grotesk'] text-[13px] font-semibold text-gray-900 leading-tight">Voice Profile Updated</h4>
                                    <p className="font-['IBM_Plex_Mono'] text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">Changed Formality to 70%</p>
                                    <p className="font-['IBM_Plex_Mono'] text-[8px] text-gray-400 uppercase tracking-wider mt-1.5">1H AGO</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[21px] top-1.5 w-1.5 h-1.5 bg-gray-300 border-[3px] border-white box-content shrink-0" />
                                <div>
                                    <h4 className="font-['Space_Grotesk'] text-[13px] font-semibold text-gray-500 leading-tight">Platform Connected</h4>
                                    <p className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">LinkedIn authenticated</p>
                                    <p className="font-['IBM_Plex_Mono'] text-[8px] text-gray-400 uppercase tracking-wider mt-1.5">2D AGO</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-transparent">
                <p className="font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-400 tracking-[0.2em] mb-2">
                    CONNECTED DESTINATIONS
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)]">
                        <div className="font-['Space_Grotesk'] text-sm font-semibold mb-3 text-gray-900">LinkedIn</div>
                        <div className="text-3xl font-bold mb-1">3</div>
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 uppercase tracking-wider">SYNCED</div>
                    </div>
                    <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)]">
                        <div className="font-['Space_Grotesk'] text-sm font-semibold mb-3 text-gray-900">X / Twitter</div>
                        <div className="text-3xl font-bold mb-1">3</div>
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 uppercase tracking-wider">SYNCED</div>
                    </div>
                    <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)]">
                        <div className="font-['Space_Grotesk'] text-sm font-semibold mb-3 text-gray-500">Instagram</div>
                        <div className="text-3xl font-bold mb-1 text-gray-400">0</div>
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 uppercase tracking-wider">SYNCED</div>
                    </div>

                    <div className="bg-gray-50/50 border border-gray-200 border-dashed p-5 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors text-gray-400 group min-h-[104px]">
                        <Plus className="h-4 w-4 mb-2 group-hover:text-black transition-colors" />
                        <div className="font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-wider group-hover:text-black transition-colors text-center">ADD YOUTUBE SHORTS</div>
                    </div>
                </div>
            </div>

        </div>
    );
}
