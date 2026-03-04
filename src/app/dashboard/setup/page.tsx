"use client";

import React, { useState } from "react";
import { Copy, Eye, MoreHorizontal, ArrowUpRight, TrendingUp } from "lucide-react";

export default function SetupPage() {
    const [activeTab, setActiveTab] = useState("Profile");

    const TABS = ["Profile", "Platforms", "Notifications", "Data"];

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400 tracking-[0.2em] mb-2">
          // SETUP
                </p>
                <h1 className="text-2xl font-bold tracking-tight mb-6">Setup</h1>

                <div className="flex gap-6 border-b border-gray-200">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-xs font-['IBM_Plex_Mono'] transition-colors ${activeTab === tab
                                    ? "border-b-2 border-black text-black"
                                    : "text-gray-400 hover:text-black"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "Profile" && (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em]">
              // ACCOUNT
                        </p>
                        <div className="bg-white p-6 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] space-y-6">

                            <div>
                                <label className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-widest mb-2 uppercase block">NAME</label>
                                <input
                                    type="text"
                                    defaultValue="Mock User"
                                    className="w-full border-b border-gray-200 py-2 font-['IBM_Plex_Mono'] text-[11px] text-gray-600 focus:outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-widest mb-2 uppercase block">EMAIL</label>
                                <input
                                    type="email"
                                    defaultValue="mock@domain.com"
                                    className="w-full border-b border-gray-200 py-2 font-['IBM_Plex_Mono'] text-[11px] text-gray-400 focus:outline-none"
                                    readOnly
                                />
                            </div>

                            <div className="pt-2">
                                <button className="bg-black text-white font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] px-4 py-2 hover:bg-black/80 transition">
                                    SAVE CHANGES
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em]">
              // SECURITY
                        </p>
                        <div className="bg-white p-6 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] space-y-6">

                            <div>
                                <label className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-widest mb-2 uppercase block">CURRENT PASSWORD</label>
                                <input
                                    type="password"
                                    className="w-full border-b border-gray-200 py-2 font-['IBM_Plex_Mono'] text-[11px] focus:outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-widest mb-2 uppercase block">NEW PASSWORD</label>
                                <input
                                    type="password"
                                    className="w-full border-b border-gray-200 py-2 font-['IBM_Plex_Mono'] text-[11px] focus:outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-widest mb-2 uppercase block">CONFIRM PASSWORD</label>
                                <input
                                    type="password"
                                    className="w-full border-b border-gray-200 py-2 font-['IBM_Plex_Mono'] text-[11px] focus:outline-none focus:border-black"
                                />
                            </div>

                            <p className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 pt-2">
                                Password management requires authentication integration.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Platforms" && (
                <div className="space-y-6">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em]">
            // CONNECTED NETWORKS
                    </p>

                    <div className="bg-white p-6 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-[#0A66C2] text-white flex items-center justify-center font-bold font-['Space_Grotesk']">
                                in
                            </div>
                            <div>
                                <h3 className="font-['Space_Grotesk'] text-sm font-semibold">LinkedIn</h3>
                                <p className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400">Mock User • Connected 2d ago</p>
                            </div>
                        </div>
                        <button className="border border-red-200 text-red-600 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider px-3 py-1.5 hover:bg-red-50">
                            DISCONNECT
                        </button>
                    </div>

                    <div className="bg-white p-6 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-black text-white flex items-center justify-center font-bold font-['Space_Grotesk']">
                                X
                            </div>
                            <div>
                                <h3 className="font-['Space_Grotesk'] text-sm font-semibold">Twitter (X)</h3>
                                <p className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400">Mock User • Connected 1w ago</p>
                            </div>
                        </div>
                        <button className="border border-red-200 text-red-600 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider px-3 py-1.5 hover:bg-red-50">
                            DISCONNECT
                        </button>
                    </div>

                    <div className="border border-gray-300 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black transition-colors">
                        <div className="font-['IBM_Plex_Mono'] text-[11px] text-gray-400 tracking-wider mb-1">+ CONNECT NEW PLATFORM</div>
                        <div className="font-['Space_Grotesk'] text-[11px] text-gray-400">Instagram, Newsletter, Blog CMS</div>
                    </div>
                </div>
            )}

            {activeTab === "Notifications" && (
                <div className="font-['IBM_Plex_Mono'] text-[11px] text-gray-400 tracking-wider">
                    No active notification routes defined.
                </div>
            )}

            {activeTab === "Data" && (
                <div className="space-y-4">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em]">
              // ARCHIVE PURGE
                    </p>
                    <div className="bg-white p-6 border border-red-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] space-y-4">
                        <div>
                            <h3 className="font-['Space_Grotesk'] text-sm font-semibold text-red-600">Delete Account Data</h3>
                            <p className="font-['IBM_Plex_Mono'] text-[10px] text-gray-500 mt-1">Permanently sever all platform connections and wipe generation history.</p>
                        </div>
                        <button className="bg-red-600 text-white font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] px-4 py-2 hover:bg-red-700 transition">
                            INITIATE PURGE
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
