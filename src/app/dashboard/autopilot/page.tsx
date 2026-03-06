"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Check, Calendar, Plus, X, Link as LinkIcon, Info, Users, Zap, Search, Send, Clock, RotateCcw } from "lucide-react";

interface VoiceProfile {
    id: string;
    name: string;
    isDefault: boolean;
}

interface MonitoredCreator {
    id: string;
    name: string;
    url: string;
}

interface BriefingPost {
    id: string;
    content: string;
    status: string;
    sourceUrl?: string;
}

export default function AutopilotPage() {
    const [view, setView] = useState<"brief" | "monitored">("brief");
    const [profileId, setProfileId] = useState("");
    const [availableProfiles, setAvailableProfiles] = useState<VoiceProfile[]>([]);

    // Monitored Creators State
    const [creators, setCreators] = useState<MonitoredCreator[]>([]);
    const [newCreatorUrl, setNewCreatorUrl] = useState("");
    const [newCreatorName, setNewCreatorName] = useState("");
    const [isAddingCreator, setIsAddingCreator] = useState(false);

    // Morning Brief State
    const [briefings, setBriefings] = useState<BriefingPost[]>([]);
    const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
    const [briefStatus, setBriefStatus] = useState<string | null>(null);

    // Common Loading
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [profilesRes, creatorsRes, briefRes] = await Promise.all([
                    fetch("/api/profiles"),
                    fetch("/api/creators"),
                    fetch("/api/generate/daily-brief")
                ]);

                const profilesData = await profilesRes.json();
                const creatorsData = await creatorsRes.json();
                const briefData = await briefRes.json();

                if (Array.isArray(profilesData)) {
                    setAvailableProfiles(profilesData);
                    const def = profilesData.find(p => p.isDefault) || profilesData[0];
                    if (def) setProfileId(def.id);
                }

                if (creatorsData.success) setCreators(creatorsData.data);
                if (briefData.success) setBriefings(briefData.data);

            } catch (err) {
                console.error("Failed to load initial data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const handleAddCreator = async () => {
        if (!newCreatorUrl) return;
        setIsAddingCreator(true);
        try {
            const res = await fetch("/api/creators", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: newCreatorUrl, name: newCreatorName || "Top Creator" })
            });
            const data = await res.json();
            if (data.success) {
                setCreators([data.data, ...creators]);
                setNewCreatorUrl("");
                setNewCreatorName("");
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Failed to add creator.");
        } finally {
            setIsAddingCreator(false);
        }
    };

    const handleRemoveCreator = async (id: string) => {
        try {
            const res = await fetch(`/api/creators?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setCreators(creators.filter(c => c.id !== id));
            }
        } catch (err) {
            alert("Failed to remove creator.");
        }
    };

    const handleGenerateBrief = async () => {
        if (creators.length === 0) {
            setView("monitored");
            alert("Please add at least one monitored creator first.");
            return;
        }
        setIsGeneratingBrief(true);
        setBriefStatus("Scraping Latest Creator Activity...");
        try {
            const res = await fetch("/api/generate/daily-brief", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setBriefings(data.data);
                setBriefStatus(null);
            } else {
                alert(data.error);
                setBriefStatus(null);
            }
        } catch (err) {
            alert("Failed to generate brief.");
            setBriefStatus(null);
        } finally {
            setIsGeneratingBrief(false);
        }
    };

    const handleApprove = async (post: BriefingPost, immediate: boolean) => {
        // Implementation for scheduling/posting approved brief
        alert(immediate ? "Publishing to LinkedIn..." : "Added to scheduling queue.");
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-black/10" />
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
                <div>
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-purple-500 tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Zap className="h-3 w-3 fill-purple-500" /> // CREATOR MIRRORING ENGINE
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight">The Morning Brief</h1>
                    <p className="text-gray-500 mt-2 font-['Space_Grotesk'] max-w-xl">
                        Your personalized daily content ideas, curated from the creators you watch.
                        Approved by you, published by Splinter.
                    </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-sm self-start md:self-auto">
                    <button
                        onClick={() => setView("brief")}
                        className={`px-4 py-1.5 text-[11px] font-['IBM_Plex_Mono'] uppercase tracking-wider transition ${view === "brief" ? 'bg-white shadow-sm text-black font-bold' : 'text-gray-400 hover:text-black'}`}>
                        Mornings
                    </button>
                    <button
                        onClick={() => setView("monitored")}
                        className={`px-4 py-1.5 text-[11px] font-['IBM_Plex_Mono'] uppercase tracking-wider transition ${view === "monitored" ? 'bg-white shadow-sm text-black font-bold' : 'text-gray-400 hover:text-black'}`}>
                        Monitors
                    </button>
                </div>
            </div>

            {view === "brief" ? (
                <div className="space-y-10">
                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400 font-['Space_Grotesk']">
                            <Info className="h-4 w-4" />
                            {creators.length === 0 ? "No creators monitored. Go to 'Monitors' to add some." : `Monitoring ${creators.length} top creator profiles.`}
                        </div>
                        <button
                            onClick={handleGenerateBrief}
                            disabled={isGeneratingBrief}
                            className="bg-black text-white font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-[0.2em] px-8 py-3.5 hover:bg-black/80 transition-colors disabled:bg-gray-400 flex items-center gap-3">
                            {isGeneratingBrief ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {isGeneratingBrief ? "MIRRORING..." : "Generate Today's Brief"}
                        </button>
                    </div>

                    {briefStatus && (
                        <div className="bg-purple-50 border border-purple-100 p-4 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-3">
                                <RotateCcw className="h-4 w-4 text-purple-500 animate-spin" />
                                <span className="text-xs font-['IBM_Plex_Mono'] uppercase tracking-wider text-purple-700">{briefStatus}</span>
                            </div>
                        </div>
                    )}

                    {/* Suggestions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {briefings.length === 0 ? (
                            <div className="col-span-full py-24 border-2 border-dashed border-gray-100 rounded-lg flex flex-col items-center justify-center opacity-30 text-center">
                                <Zap className="h-12 w-12 mb-4" />
                                <p className="font-['Space_Grotesk'] text-sm">Your morning brief is empty.<br />Click generate to build your daily plan.</p>
                            </div>
                        ) : (
                            briefings.map((post, i) => (
                                <div key={post.id} className="bg-white border border-gray-200 shadow-sm p-8 flex flex-col h-full hover:border-purple-200 transition-colors group">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-sm uppercase tracking-tighter">SUGGESTION {i + 1}</span>
                                            {post.status === "APPROVED" && <span className="text-[10px] text-green-600 font-['IBM_Plex_Mono'] flex items-center gap-1 uppercase tracking-tighter"><Check className="h-3 w-3" /> Approved</span>}
                                        </div>
                                        {post.sourceUrl && (
                                            <a href={post.sourceUrl} target="_blank" className="text-[9px] font-['IBM_Plex_Mono'] uppercase text-gray-300 hover:text-purple-500 flex items-center gap-1 transition-colors">
                                                ORIGINAL SOURCE <LinkIcon className="h-2.5 w-2.5" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex-1 font-['Space_Grotesk'] text-[15px] leading-[1.6] text-gray-800 whitespace-pre-wrap mb-8">
                                        {post.content}
                                    </div>
                                    <div className="flex flex-col gap-3 pt-6 border-t border-gray-50">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(post, true)}
                                                className="flex-1 bg-black text-white py-2.5 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest hover:bg-gray-800 transition flex items-center justify-center gap-2">
                                                <Send className="h-3.5 w-3.5" /> Post Now
                                            </button>
                                            <button
                                                onClick={() => handleApprove(post, false)}
                                                className="flex-1 border border-black py-2.5 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition flex items-center justify-center gap-2">
                                                <Clock className="h-3.5 w-3.5" /> Queue
                                            </button>
                                        </div>
                                        <button className="w-full text-[10px] font-['IBM_Plex_Mono'] text-purple-500 uppercase tracking-widest py-1.5 hover:bg-purple-50 transition border border-dashed border-purple-200">
                                            + ADD AI GRAPHIC
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Monitor List */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-['IBM_Plex_Mono'] text-sm font-bold uppercase tracking-widest group">
                                Monitoring {creators.length}/5 Active Profiles
                            </h3>
                            <button className="text-[10px] font-['IBM_Plex_Mono'] uppercase text-gray-400 hover:text-black flex items-center gap-1 transition-colors">
                                <Search className="h-3 w-3" /> Find Creators
                            </button>
                        </div>

                        <div className="space-y-3">
                            {creators.length === 0 ? (
                                <div className="py-12 bg-gray-50 border border-dashed border-gray-200 text-center rounded-lg opacity-40">
                                    <Users className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-xs font-['Space_Grotesk']">Your monitoring engine is cold.</p>
                                </div>
                            ) : creators.map(c => (
                                <div key={c.id} className="bg-white border border-gray-100 p-4 flex items-center justify-between group hover:border-black transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-gray-100 rounded-sm flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold font-['Space_Grotesk'] text-sm">{c.name}</p>
                                            <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono'] truncate max-w-[200px]">{c.url}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCreator(c.id)}
                                        className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add Creator Form */}
                    <div className="bg-white border border-gray-200 p-6 h-fit shadow-xl rounded-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-gray-50 -mr-6 -mt-6 rotate-45" />
                        <h4 className="font-['IBM_Plex_Mono'] text-[11px] font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Add New Mentor</h4>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-['IBM_Plex_Mono'] text-gray-400 uppercase tracking-widest mb-2">Creator Name</label>
                                <input
                                    type="text"
                                    value={newCreatorName}
                                    onChange={e => setNewCreatorName(e.target.value)}
                                    placeholder="e.g. Justin Welsh"
                                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black focus:outline-none placeholder:text-gray-300 font-['Space_Grotesk']"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-['IBM_Plex_Mono'] text-gray-400 uppercase tracking-widest mb-2">Profile URL</label>
                                <input
                                    type="url"
                                    value={newCreatorUrl}
                                    onChange={e => setNewCreatorUrl(e.target.value)}
                                    placeholder="LinkedIn or Twitter URL"
                                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-black focus:outline-none placeholder:text-gray-300 font-['Space_Grotesk']"
                                />
                            </div>
                            <button
                                onClick={handleAddCreator}
                                disabled={isAddingCreator || creators.length >= 5}
                                className="w-full bg-black text-white py-3 text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-[0.2em] hover:bg-gray-800 disabled:bg-gray-200 transition-colors">
                                {isAddingCreator ? "Adding..." : "Add to Monitoring"}
                            </button>
                            <p className="text-[9px] text-gray-400 text-center font-['IBM_Plex_Mono'] uppercase leading-relaxed">
                                Splinter will scrape their latest activity daily using Jina Intelligence.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
