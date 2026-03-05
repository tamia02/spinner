"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function SetupPage() {
    const [activeTab, setActiveTab] = useState("Profile");
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);

    const handleDisconnect = async (e: React.MouseEvent, platform: string) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`[Setup] Disconnecting platform: ${platform}`);
        setDisconnecting(platform);
        try {
            const res = await fetch("/api/auth/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully disconnected ${platform}. The page will reload to confirm.`);
                window.location.reload();
            } else {
                alert(data.error || "Failed to disconnect");
            }
        } catch (err) {
            alert("Error disconnecting account");
        } finally {
            setDisconnecting(null);
        }
    };

    const TABS = ["Profile", "Platforms", "Notifications", "Data"];

    useEffect(() => {
        fetch("/api/user/status")
            .then(res => res.json())
            .then(data => {
                if (data.user) setUserData(data.user);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
        );
    }

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
                                    defaultValue={userData?.name || "User"}
                                    className="w-full border-b border-gray-200 py-2 font-['IBM_Plex_Mono'] text-[11px] text-gray-600 focus:outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-widest mb-2 uppercase block">EMAIL</label>
                                <input
                                    type="email"
                                    defaultValue={userData?.email || ""}
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
                                <p className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400">
                                    {userData?.linkedinToken ? "Connected" : "Not connected"}
                                </p>
                            </div>
                        </div>
                        {userData?.linkedinToken ? (
                            <button
                                onClick={(e) => handleDisconnect(e, 'linkedin')}
                                disabled={disconnecting === 'linkedin'}
                                className="border border-red-200 text-red-600 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
                            >
                                {disconnecting === 'linkedin' ? 'DISCONNECTING...' : 'DISCONNECT'}
                            </button>
                        ) : (
                            <button
                                onClick={() => window.location.href = "/api/auth/linkedin"}
                                className="border border-gray-200 text-gray-600 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider px-3 py-1.5 hover:bg-gray-50 hover:border-black hover:text-black transition-colors"
                            >
                                CONNECT
                            </button>
                        )}
                    </div>

                    <div className="bg-white p-6 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-black text-white flex items-center justify-center font-bold font-['Space_Grotesk']">
                                X
                            </div>
                            <div>
                                <h3 className="font-['Space_Grotesk'] text-sm font-semibold">Twitter (X)</h3>
                                <p className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400">
                                    {userData?.twitterToken ? "Connected" : "Not connected"}
                                </p>
                            </div>
                        </div>
                        {userData?.twitterToken ? (
                            <button
                                onClick={(e) => handleDisconnect(e, 'twitter')}
                                disabled={disconnecting === 'twitter'}
                                className="border border-red-200 text-red-600 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
                            >
                                {disconnecting === 'twitter' ? 'DISCONNECTING...' : 'DISCONNECT'}
                            </button>
                        ) : (
                            <button
                                onClick={() => window.location.href = "/api/auth/twitter"}
                                className="border border-gray-200 text-gray-600 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider px-3 py-1.5 hover:bg-gray-50 hover:border-black hover:text-black transition-colors"
                            >
                                CONNECT
                            </button>
                        )}
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
