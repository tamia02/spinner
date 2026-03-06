"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Check, Calendar, Plus, X, Link as LinkIcon, Info } from "lucide-react";

interface VoiceProfile {
    id: string;
    name: string;
    isDefault: boolean;
}

export default function AutopilotPage() {
    const [topic, setTopic] = useState("");
    const [competitorUrls, setCompetitorUrls] = useState<string[]>([""]);
    const [subreddits, setSubreddits] = useState<string[]>(["artificial", "technology"]);
    const [profileId, setProfileId] = useState("");
    const [availableProfiles, setAvailableProfiles] = useState<VoiceProfile[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/profiles")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAvailableProfiles(data);
                    const def = data.find(p => p.isDefault);
                    if (def) setProfileId(def.id);
                    else if (data.length > 0) setProfileId(data[0].id);
                }
            })
            .catch(err => console.error("Failed to load profiles:", err));
    }, []);

    const addCompetitor = () => setCompetitorUrls([...competitorUrls, ""]);
    const removeCompetitor = (index: number) => setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
    const updateCompetitor = (index: number, val: string) => {
        const next = [...competitorUrls];
        next[index] = val;
        setCompetitorUrls(next);
    };

    const addSubreddit = () => setSubreddits([...subreddits, ""]);
    const removeSubreddit = (index: number) => setSubreddits(subreddits.filter((_, i) => i !== index));
    const updateSubreddit = (index: number, val: string) => {
        const next = [...subreddits];
        next[index] = val;
        setSubreddits(next);
    };

    const handleGenerate = async () => {
        if (!topic) return;
        setIsGenerating(true);
        setStatus("Gathering Intelligence & Analyzing Styles...");
        try {
            const response = await fetch("/api/generate/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    competitorUrls: competitorUrls.filter(u => u.trim() !== ""),
                    subreddits: subreddits.filter(s => s.trim() !== ""),
                    profileId,
                    count: 30
                }),
            });
            const data = await response.json();
            if (data.success) {
                setGeneratedPosts(data.data);
                setStatus("30-Day Plan Generated & Scheduled!");
            } else {
                alert(data.error);
                setStatus(null);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to start autopilot.");
            setStatus(null);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-12 max-w-4xl">
            <div>
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-purple-500 tracking-[0.2em] mb-4">
                    // AUTOPILOT ENGINE
                </p>
                <h1 className="text-4xl font-bold tracking-tight">Content Autopilot</h1>
                <p className="text-gray-500 mt-2 font-['Space_Grotesk']">
                    Generate a full month of authority-building LinkedIn posts in seconds.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Configuration */}
                <div className="space-y-8">
                    <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-6">
                        <div>
                            <label className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider mb-2 block uppercase">PRIMARY TOPIC / NICHE</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="e.g. AI Agents for B2B SaaS"
                                className="w-full border border-gray-200 p-3 font-['Space_Grotesk'] text-sm focus:outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider mb-2 block uppercase text-emerald-600">COMPETITOR STYLE ANALYSIS (URLs)</label>
                            <div className="space-y-2">
                                {competitorUrls.map((url, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={e => updateCompetitor(i, e.target.value)}
                                            placeholder="Link to a post you like..."
                                            className="flex-1 border border-gray-200 p-2 text-xs font-['Space_Grotesk'] focus:outline-none focus:border-emerald-500"
                                        />
                                        <button onClick={() => removeCompetitor(i)} className="text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                    </div>
                                ))}
                                <button onClick={addCompetitor} className="text-[10px] font-['IBM_Plex_Mono'] uppercase text-emerald-600 flex items-center gap-1 hover:underline">
                                    <Plus className="h-3 w-3" /> Add Post URL
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider mb-2 block uppercase text-orange-600">REDDIT INTELLIGENCE (SUBREDDITS)</label>
                            <div className="space-y-2">
                                {subreddits.map((sub, i) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="flex-1 flex items-center border border-gray-200 bg-gray-50 px-2 text-xs font-['Space_Grotesk'] focus-within:border-orange-500">
                                            <span className="text-gray-400 mr-1">r/</span>
                                            <input
                                                type="text"
                                                value={sub}
                                                onChange={e => updateSubreddit(i, e.target.value)}
                                                className="flex-1 bg-transparent p-2 outline-none"
                                            />
                                        </div>
                                        <button onClick={() => removeSubreddit(i)} className="text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                    </div>
                                ))}
                                <button onClick={addSubreddit} className="text-[10px] font-['IBM_Plex_Mono'] uppercase text-orange-600 flex items-center gap-1 hover:underline">
                                    <Plus className="h-3 w-3" /> Add Subreddit
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider mb-2 block uppercase">VOICE PROFILE</label>
                            <select value={profileId} onChange={e => setProfileId(e.target.value)}
                                className="w-full border border-gray-200 p-3 font-['Space_Grotesk'] text-sm focus:outline-none focus:border-black appearance-none bg-white rounded-none cursor-pointer">
                                {availableProfiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!topic || isGenerating}
                            className="w-full bg-black text-white font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-[0.2em] py-4 hover:bg-black/80 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-3"
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {isGenerating ? "Processing Plan..." : "Generate 30-Day Plan"}
                        </button>
                    </div>

                    {status && (
                        <div className="bg-purple-50 border border-purple-100 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <Info className="h-5 w-5 text-purple-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-['Space_Grotesk'] text-purple-900 font-medium">{status}</p>
                                <p className="text-[11px] text-purple-700 font-['IBM_Plex_Mono'] uppercase mt-1">Automatic scheduling engaged.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Preview */}
                <div className="space-y-4">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em]">
                        // 30-DAY PREVIEW
                    </p>
                    <div className="bg-white border border-gray-200 shadow-sm min-h-[500px] max-h-[700px] overflow-y-auto p-6 space-y-6">
                        {generatedPosts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <Calendar className="h-12 w-12 mb-4" />
                                <p className="font-['Space_Grotesk'] text-sm">No plan generated yet.</p>
                            </div>
                        ) : (
                            generatedPosts.map((post, i) => (
                                <div key={i} className="border-b border-gray-100 last:border-0 pb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded">DAY {post.day}</span>
                                        <span className="text-[10px] text-green-600 font-['IBM_Plex_Mono'] flex items-center gap-1">
                                            <Check className="h-3 w-3" /> SCHEDULED
                                        </span>
                                    </div>
                                    <p className="text-sm font-['Space_Grotesk'] text-gray-700 whitespace-pre-wrap line-clamp-4">
                                        {post.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
