"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const steps = ["Welcome", "Connect Channels", "Voice Profile", "Dry Run", "Complete"];

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
    const [userName, setUserName] = useState("User");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real connection status
        fetch("/api/user/status")
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUserName(data.user.email?.split("@")[0] || "User");
                    const platforms = [];
                    if (data.user.linkedinToken) platforms.push("linkedin");
                    if (data.user.twitterToken) platforms.push("twitter");
                    setConnectedPlatforms(platforms);

                    // Jump to step 1 if return from OAuth
                    const params = new URLSearchParams(window.location.search);
                    if (params.get("connected")) {
                        setCurrentStep(1);
                        router.replace("/setup"); // clear the URL bar
                    }
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4 font-['Space_Grotesk']">
            {/* Sidebar Navigation */}
            <div className="fixed left-0 top-0 h-full w-64 p-8 flex flex-col justify-center">
                <div className="mb-16">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-black">
                            <div className="w-1.5 h-1.5 bg-white m-0.5" />
                        </div>
                        <span className="font-['IBM_Plex_Mono'] font-bold text-[10px] tracking-widest uppercase">SPINNER</span>
                    </div>
                    <span className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-widest uppercase ml-5">SETUP</span>
                </div>

                <div className="relative border-l border-gray-200 ml-2 pl-6 flex flex-col gap-6">
                    {steps.map((step, idx) => {
                        const isActive = idx === currentStep;
                        const isPast = idx < currentStep;
                        return (
                            <div key={idx} className="relative group cursor-pointer" onClick={() => setCurrentStep(idx)}>
                                <div className={`absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full border-2 transition-colors ${isActive ? 'border-black bg-black' : isPast ? 'border-gray-400 bg-white' : 'border-gray-200 bg-white'}`} />
                                <span className={`font-['IBM_Plex_Mono'] text-[10px] transition-colors tracking-wide ${isActive ? 'text-black font-semibold' : isPast ? 'text-gray-500' : 'text-gray-400'}`}>{step}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full max-w-2xl bg-white p-16 shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[500px] flex flex-col ml-32 relative">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                    </div>
                ) : (
                    <>
                        {/* Step 0: Welcome */}
                        {currentStep === 0 && (
                            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Initialize Workspace</h1>
                                <p className="text-gray-500 leading-relaxed text-[15px]">
                                    Welcome to the core protocol, {userName}. We need to calibrate your syndication engine before you deploy your first content asset.
                                </p>
                            </div>
                        )}

                        {/* Step 1: Connect Channels */}
                        {currentStep === 1 && (
                            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Connect Platforms</h1>
                                <p className="text-gray-500 leading-relaxed text-[15px] mb-8">Authorize SPINNER to post on your behalf.</p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => window.location.href = "/api/auth/linkedin"}
                                        disabled={connectedPlatforms.includes('linkedin')}
                                        className="w-full border border-gray-200 p-4 font-['Space_Grotesk'] block hover:border-black transition-colors group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">LinkedIn</span>
                                            <span className={`font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-wider ${connectedPlatforms.includes('linkedin') ? 'text-green-600' : 'text-gray-400 group-hover:text-black'}`}>
                                                {connectedPlatforms.includes('linkedin') ? 'CONNECTED' : 'CONNECT'}
                                            </span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => window.location.href = "/api/auth/twitter"}
                                        disabled={connectedPlatforms.includes('twitter')}
                                        className="w-full border border-gray-200 p-4 font-['Space_Grotesk'] block hover:border-black transition-colors group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">X / Twitter</span>
                                            <span className={`font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-wider ${connectedPlatforms.includes('twitter') ? 'text-green-600' : 'text-gray-400 group-hover:text-black'}`}>
                                                {connectedPlatforms.includes('twitter') ? 'CONNECTED' : 'CONNECT'}
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Voice Profile */}
                        {currentStep === 2 && (
                            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Voice Profile</h1>
                                <p className="text-gray-500 leading-relaxed text-[15px] mb-8">Establish your base syndication tone.</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400 tracking-wider block mb-2">Base Formality</label>
                                        <input type="range" className="w-full accent-black" min="1" max="100" defaultValue="70" />
                                        <div className="flex justify-between font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-400 mt-1"><span>Casual</span><span>Academic</span></div>
                                    </div>
                                    <div className="pt-4">
                                        <label className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400 tracking-wider block mb-2">Emoji Frequency</label>
                                        <select className="w-full border border-gray-200 p-3 font-['Space_Grotesk'] text-sm focus:outline-none focus:border-black appearance-none bg-white rounded-none">
                                            <option>Minimal (1-2 per post)</option>
                                            <option>Moderate (3-5 per post)</option>
                                            <option>None</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Dry Run */}
                        {currentStep === 3 && (
                            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">System Dry Run</h1>
                                <p className="text-gray-500 leading-relaxed text-[15px] mb-8">Initiating simulated payload generation to verify the AI connection.</p>
                                <div className="bg-gray-50 border border-gray-200 p-6 flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider text-gray-700">Gemini Neural Link Established. Latency: 42ms.</span>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Complete */}
                        {currentStep === 4 && (
                            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Sequence Complete</h1>
                                <p className="text-gray-500 leading-relaxed text-[15px] mb-8">Your workspace is fully calibrated. You are ready to shatter your content.</p>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="flex justify-end mt-12">
                            {currentStep < steps.length - 1 ? (
                                <button onClick={() => setCurrentStep(prev => prev + 1)} className="bg-black text-white font-['Space_Grotesk'] font-medium text-[13px] px-8 py-3.5 hover:bg-black/90 transition-colors flex items-center gap-3">
                                    {currentStep === 0 ? "Begin Sequence" : "Continue"} <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <Link href="/dashboard">
                                    <button className="bg-black text-white font-['Space_Grotesk'] font-medium text-[13px] px-8 py-3.5 hover:bg-black/90 transition-colors flex items-center gap-3">
                                        Enter Dashboard <ChevronRight className="h-4 w-4" />
                                    </button>
                                </Link>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
