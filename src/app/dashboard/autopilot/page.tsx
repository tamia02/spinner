"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Check, Calendar, Plus, X, Link as LinkIcon, Info, Users, Zap, Search, Send, Clock, RotateCcw, Target, BookOpen, Layers } from "lucide-react";

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

const STYLE_OPTIONS = [
    { id: "justin_welsh", name: "Justin Welsh", tag: "Minimalist & Value-Dense" },
    { id: "lara_acosta", name: "Lara Acosta", tag: "Conversational & Personal" },
    { id: "jasmin_alic", name: "Jasmin Alic", tag: "Tactical & Bold" },
    { id: "professional", name: "Standard Pro", tag: "Balanced & Formal" }
];

export default function AutopilotPage() {
    const [view, setView] = useState<"brief" | "monitored" | "strategy">("brief");
    const [styleProfileId, setStyleProfileId] = useState("justin_welsh");

    // Monitored Creators State
    const [creators, setCreators] = useState<MonitoredCreator[]>([]);
    const [newCreatorUrl, setNewCreatorUrl] = useState("");
    const [newCreatorName, setNewCreatorName] = useState("");
    const [isAddingCreator, setIsAddingCreator] = useState(false);

    // Morning Brief State
    const [briefings, setBriefings] = useState<BriefingPost[]>([]);
    const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
    const [briefStatus, setBriefStatus] = useState<string | null>(null);

    // Strategy State
    const [strategyTopic, setStrategyTopic] = useState("");
    const [isGeneratingSequence, setIsGeneratingSequence] = useState(false);
    const [sequenceStatus, setSequenceStatus] = useState<string | null>(null);

    // Common Loading
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [creatorsRes, briefRes] = await Promise.all([
                    fetch("/api/creators"),
                    fetch("/api/generate/daily-brief")
                ]);

                const creatorsData = await creatorsRes.json();
                const briefData = await briefRes.json();

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
        setBriefStatus(`Mirroring as ${STYLE_OPTIONS.find(s => s.id === styleProfileId)?.name}...`);
        try {
            const res = await fetch("/api/generate/daily-brief", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ styleProfileId })
            });
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

    const handleGenerateSequence = async () => {
        if (!strategyTopic) return;
        setIsGeneratingSequence(true);
        setSequenceStatus(`Building 7-Day Educational Sequence...`);
        try {
            const res = await fetch("/api/generate/sequence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: strategyTopic, styleProfileId })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                setSequenceStatus(null);
            } else {
                alert(data.error);
                setSequenceStatus(null);
            }
        } catch (err) {
            alert("Failed to generate sequence.");
            setSequenceStatus(null);
        } finally {
            setIsGeneratingSequence(false);
        }
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
                        <Zap className="h-3 w-3 fill-purple-500" /> // LINKEDIN STRATEGY MANAGER
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight">Autopilot</h1>
                    <p className="text-gray-500 mt-2 font-['Space_Grotesk'] max-w-xl">
                        Mirror elite creators, master new topics, and dominate the LinkedIn feed.
                    </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-sm self-start md:self-auto">
                    {[
                        { id: "brief", label: "Mornings", icon: Clock },
                        { id: "strategy", label: "Strategy", icon: Target },
                        { id: "monitored", label: "Monitors", icon: Users }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id as any)}
                            className={`px-4 py-1.5 text-[11px] font-['IBM_Plex_Mono'] uppercase tracking-wider transition flex items-center gap-2 ${view === tab.id ? 'bg-white shadow-sm text-black font-bold' : 'text-gray-400 hover:text-black'}`}>
                            <tab.icon className="h-3 w-3" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Style Selector Global */}
            <div className="bg-white border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Layers className="h-4 w-4 text-purple-500" />
                    <span className="text-[11px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-gray-500">Mirror Style:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map(style => (
                        <button
                            key={style.id}
                            onClick={() => setStyleProfileId(style.id)}
                            className={`px-3 py-1.5 text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-tighter border transition-all ${styleProfileId === style.id ? 'bg-black text-white border-black shadow-lg scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-black'}`}>
                            {style.name} <span className="opacity-40 ml-1">[{style.tag}]</span>
                        </button>
                    ))}
                </div>
            </div>

            {view === "brief" && (
                <div className="space-y-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400 font-['Space_Grotesk']">
                            <Info className="h-4 w-4" />
                            {creators.length === 0 ? "No creators monitored." : `Repurposing from ${creators.length} top creator profiles.`}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {briefings.length === 0 ? (
                            <div className="col-span-full py-24 border-2 border-dashed border-gray-100 rounded-lg flex flex-col items-center justify-center opacity-30 text-center">
                                <Zap className="h-12 w-12 mb-4" />
                                <p className="font-['Space_Grotesk'] text-sm">Your morning brief is dry.<br />Click generate to mirror latest activity.</p>
                            </div>
                        ) : (
                            briefings.map((post, i) => (
                                <div key={post.id} className="bg-white border border-gray-200 shadow-sm p-8 flex flex-col h-full hover:border-purple-200 transition-colors group">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-sm uppercase tracking-tighter">SUGGESTION {i + 1}</span>
                                        </div>
                                        {post.sourceUrl && (
                                            <a href={post.sourceUrl} target="_blank" className="text-[9px] font-['IBM_Plex_Mono'] uppercase text-gray-300 hover:text-purple-500 flex items-center gap-1 transition-colors">
                                                MIRRORED SOURCE <LinkIcon className="h-2.5 w-2.5" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex-1 font-['Space_Grotesk'] text-[15px] leading-[1.6] text-gray-800 whitespace-pre-wrap mb-8">
                                        {post.content}
                                    </div>
                                    <div className="flex flex-col gap-3 pt-6 border-t border-gray-50">
                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-black text-white py-2.5 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest hover:bg-gray-800 transition flex items-center justify-center gap-2">
                                                <Send className="h-3.5 w-3.5" /> Post
                                            </button>
                                            <button className="flex-1 border border-black py-2.5 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition flex items-center justify-center gap-2">
                                                <Clock className="h-3.5 w-3.5" /> Queue
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {view === "strategy" && (
                <div className="max-w-2xl mx-auto space-y-12 py-8">
                    <div className="text-center space-y-4">
                        <div className="h-16 w-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">The 7-Day Sequence Engine</h2>
                        <p className="text-gray-500 font-['Space_Grotesk']">
                            Master any topic from 0 to 1. We generate 14 structured posts (2x daily)
                            following the {STYLE_OPTIONS.find(s => s.id === styleProfileId)?.name} blueprint.
                        </p>
                    </div>

                    <div className="space-y-8 bg-white border border-gray-200 p-10 shadow-2xl relative">
                        <div className="absolute top-0 right-10 w-20 h-1 bg-black" />

                        <div>
                            <label className="block text-[11px] font-['IBM_Plex_Mono'] text-gray-400 uppercase tracking-[0.2em] mb-4">Target Topic / Mastery Area</label>
                            <input
                                type="text"
                                value={strategyTopic}
                                onChange={e => setStrategyTopic(e.target.value)}
                                placeholder="e.g. Agentic AI for Growth Ops"
                                className="w-full border-b-2 border-gray-100 py-4 text-2xl font-bold focus:border-black focus:outline-none placeholder:text-gray-200 font-['Space_Grotesk']"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-xs text-gray-400 font-['Space_Grotesk']">
                                <Check className="h-4 w-4 text-green-500" />
                                14 Posts generated (Morning & Afternoon)
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 font-['Space_Grotesk']">
                                <Check className="h-4 w-4 text-green-500" />
                                Sequence: Basics → Framework → Advanced Implementation
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 font-['Space_Grotesk']">
                                <Check className="h-4 w-4 text-green-500" />
                                Scheduled automatically in your queue
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateSequence}
                            disabled={isGeneratingSequence || !strategyTopic}
                            className="w-full bg-black text-white py-5 font-['IBM_Plex_Mono'] text-[14px] uppercase tracking-[0.3em] hover:bg-black/90 disabled:bg-gray-100 transition flex items-center justify-center gap-4">
                            {isGeneratingSequence ? <Loader2 className="animate-spin h-5 w-5" /> : <Zap className="h-5 w-5 fill-white" />}
                            {isGeneratingSequence ? "ENGINEERING SEQUENCE..." : "Launch 7-Day Sequence"}
                        </button>

                        {sequenceStatus && (
                            <p className="text-center font-['IBM_Plex_Mono'] text-[10px] uppercase text-purple-600 animate-pulse tracking-widest">{sequenceStatus}</p>
                        )}
                    </div>
                </div>
            )}

            {view === "monitored" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="font-['IBM_Plex_Mono'] text-sm font-bold uppercase tracking-widest">
                            Monitoring {creators.length}/5 Active Profiles
                        </h3>
                        <div className="space-y-3">
                            {creators.length === 0 ? (
                                <div className="py-12 bg-gray-50 border border-dashed border-gray-200 text-center rounded-lg opacity-40">
                                    <Users className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-xs font-['Space_Grotesk']">No profiles monitored.</p>
                                </div>
                            ) : creators.map(c => (
                                <div key={c.id} className="bg-white border border-gray-100 p-4 flex items-center justify-between group hover:border-black transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Users className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="font-bold font-['Space_Grotesk'] text-sm">{c.name}</p>
                                            <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono'] truncate max-w-[200px]">{c.url}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveCreator(c.id)} className="text-gray-300 hover:text-red-500 p-2"><X className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 shadow-xl">
                        <h4 className="font-['IBM_Plex_Mono'] text-[11px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-gray-100">Add New Monitor</h4>
                        <div className="space-y-6">
                            <input type="text" value={newCreatorName} onChange={e => setNewCreatorName(e.target.value)} placeholder="Creator Name" className="w-full border-b border-gray-200 py-2 text-sm focus:border-black focus:outline-none font-['Space_Grotesk']" />
                            <input type="url" value={newCreatorUrl} onChange={e => setNewCreatorUrl(e.target.value)} placeholder="Profile URL" className="w-full border-b border-gray-200 py-2 text-sm focus:border-black focus:outline-none font-['Space_Grotesk']" />
                            <button onClick={handleAddCreator} disabled={creators.length >= 5} className="w-full bg-black text-white py-3 text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-[0.2em] hover:bg-gray-800 disabled:bg-gray-200 transition-colors">Monitor Profile</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
