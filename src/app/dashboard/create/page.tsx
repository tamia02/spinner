"use client";

import React, { useState, useEffect } from "react";
import { FileText, Link as LinkIcon, Youtube, Mic, Loader2, Check, Send, Clock, X, Sparkles, RotateCcw } from "lucide-react";

interface ResultItem {
    platform: string;
    content: string;
}

interface VoiceProfile {
    id: string;
    name: string;
    isDefault: boolean;
}

export default function CreateContentPage() {
    const [source, setSource] = useState("");
    const [modality, setModality] = useState<"text" | "url" | "youtube" | "audio">("text");
    const [platforms, setPlatforms] = useState<string[]>(["Twitter", "LinkedIn"]);
    const [profileId, setProfileId] = useState("");
    const [availableProfiles, setAvailableProfiles] = useState<VoiceProfile[]>([]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<ResultItem[] | null>(null);
    const [publishing, setPublishing] = useState<Record<string, string>>({});
    const [schedulingFor, setSchedulingFor] = useState<string | null>(null);
    const [scheduleDateTime, setScheduleDateTime] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFileName, setImageFileName] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
    const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});

    // Fetch voice profiles on mount
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File too large. Max 5MB.");
                return;
            }
            setImageFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const togglePlatform = (p: string) => {
        setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    };

    const handleGenerate = async () => {
        if (!source.trim() || platforms.length === 0) return;
        setIsGenerating(true);
        setResults(null);
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source, platforms, profileId }),
            });
            const data = await response.json();
            if (data.success) {
                setResults(data.data);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to generate content.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublishNow = async (res: ResultItem) => {
        const platform = res.platform.toLowerCase();
        if (!["linkedin", "twitter"].includes(platform)) {
            alert(`Direct publishing is available for LinkedIn and Twitter only. Copy the content for ${res.platform}.`);
            return;
        }
        setPublishing(prev => ({ ...prev, [res.platform]: "posting" }));
        try {
            const endpoint = platform === "linkedin" ? "/api/post/linkedin" : "/api/post/twitter";
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: res.content }),
            });
            const data = await response.json();
            if (data.success) {
                setPublishing(prev => ({ ...prev, [res.platform]: "done" }));
            } else {
                alert(data.error || "Failed to post.");
                setPublishing(prev => ({ ...prev, [res.platform]: "" }));
            }
        } catch {
            alert("Network error when posting.");
            setPublishing(prev => ({ ...prev, [res.platform]: "" }));
        }
    };

    const handleSchedule = async (res: ResultItem) => {
        if (!scheduleDateTime) { alert("Please pick a date and time first."); return; }
        try {
            const response = await fetch("/api/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    platform: res.platform,
                    content: res.content,
                    scheduledAt: new Date(scheduleDateTime).toISOString(),
                }),
            });
            const data = await response.json();
            if (data.id) {
                setSchedulingFor(null);
                setScheduleDateTime("");
                alert(`✅ Scheduled for ${res.platform} at ${new Date(scheduleDateTime).toLocaleString()}`);
            } else {
                alert(data.error || "Failed to schedule.");
            }
        } catch {
            alert("Network error when scheduling.");
        }
    };

    const handleGenerateImage = async (res: ResultItem) => {
        setGeneratingImages(prev => ({ ...prev, [res.platform]: true }));
        try {
            const response = await fetch("/api/generate/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: res.content, platform: res.platform }),
            });
            const data = await response.json();
            if (data.success) {
                setGeneratedImages(prev => ({ ...prev, [res.platform]: data.imageUrl }));
            } else {
                alert(data.error || "Failed to generate AI image.");
            }
        } catch {
            alert("Network error when generating image.");
        } finally {
            setGeneratingImages(prev => ({ ...prev, [res.platform]: false }));
        }
    };

    return (
        <div className="space-y-12 max-w-4xl">
            <div>
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400 tracking-[0.2em] mb-4">
                    // CONTENT ENGINE
                </p>
                <h1 className="text-4xl font-bold tracking-tight">Create Spinner</h1>
            </div>

            {/* Source Ingestion */}
            <div className="space-y-4">
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em]">
                    // 01. SOURCE INGESTION
                </p>
                <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-8">
                    <div>
                        <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider mb-4 uppercase">INPUT MODALITY</div>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { key: "text", icon: <FileText className="h-4 w-4" />, label: "Plain Text" },
                                { key: "url", icon: <LinkIcon className="h-4 w-4" />, label: "URL" },
                                { key: "youtube", icon: <Youtube className="h-4 w-4" />, label: "YouTube" },
                                { key: "audio", icon: <Mic className="h-4 w-4" />, label: "Audio" },
                            ].map(m => (
                                <button
                                    key={m.key}
                                    onClick={() => { setModality(m.key as typeof modality); setSource(""); }}
                                    className={`flex items-center gap-2 border px-4 py-2 text-sm font-['Space_Grotesk'] transition-colors ${modality === m.key ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'}`}
                                >
                                    {m.icon} {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider mb-4 uppercase">SOURCE PAYLOAD</div>
                        {modality === "text" && (
                            <textarea value={source} onChange={e => setSource(e.target.value)}
                                placeholder="Paste your raw content, transcript, or ideas here..."
                                className="w-full min-h-[200px] border border-gray-200 bg-gray-50 p-4 font-['Space_Grotesk'] text-sm focus:outline-none focus:border-black placeholder:text-gray-400 resize-y" />
                        )}
                        {(modality === "url" || modality === "youtube") && (
                            <input type="url" value={source} onChange={e => setSource(e.target.value)}
                                placeholder={modality === "url" ? "https://example.com/article..." : "https://youtube.com/watch?v=..."}
                                className="w-full border border-gray-200 bg-gray-50 p-4 font-['Space_Grotesk'] text-sm focus:outline-none focus:border-black placeholder:text-gray-400" />
                        )}
                        {modality === "audio" && (
                            <div className="w-full border border-dashed border-gray-200 bg-gray-50 p-12 flex flex-col items-center justify-center min-h-[200px]">
                                <Mic className="h-8 w-8 text-gray-400 mb-4" />
                                <div className="font-['Space_Grotesk'] text-sm text-gray-500 mb-1">Upload Audio / Video File</div>
                                <div className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400">MP3, M4A, MP4 (Max 50MB)</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Target Parameters */}
            <div className="space-y-4">
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em]">
                    // 02. TARGET PARAMETERS
                </p>
                <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-8">
                    <div>
                        <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider mb-4 uppercase">PLATFORM SYNDICATION</div>
                        <div className="flex flex-wrap gap-3">
                            {['Twitter', 'LinkedIn', 'Instagram', 'Newsletter', 'Blog'].map(p => (
                                <button key={p} onClick={() => togglePlatform(p)}
                                    className={`border px-3 py-1.5 font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider transition ${platforms.includes(p) ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider mb-4 uppercase">VOICE PROFILE</div>
                        <select value={profileId} onChange={e => setProfileId(e.target.value)}
                            className="w-full border border-gray-200 p-3 font-['Space_Grotesk'] text-sm focus:outline-none focus:border-black appearance-none bg-white rounded-none cursor-pointer max-w-sm">
                            {availableProfiles.length === 0 ? (
                                <option value="">No Profiles Found - Create One First</option>
                            ) : (
                                availableProfiles.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} {p.isDefault ? "(Default)" : ""}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                <div className="bg-white p-6 border border-gray-200 shadow-sm mt-6">
                    <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider mb-4 uppercase text-center md:text-left">CREATIVE ATTACHMENTS (OPTIONAL)</div>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <label className="cursor-pointer bg-gray-50 border border-dashed border-gray-300 p-8 flex flex-col items-center justify-center w-full md:w-48 hover:bg-gray-100 transition">
                            <input type="file" accept="image/png,image/jpeg,image/gif" onChange={handleImageChange} className="hidden" />
                            <LinkIcon className="h-5 w-5 text-gray-400 mb-2" />
                            <span className="font-['Space_Grotesk'] text-[11px] text-gray-500">{imageFileName ? "Change Image" : "Attach Image"}</span>
                        </label>
                        <div className="flex-1">
                            {selectedImage ? (
                                <div className="relative inline-block group">
                                    <img src={selectedImage} alt="Preview" className="h-24 w-auto rounded border border-gray-200" />
                                    <button onClick={() => { setSelectedImage(null); setImageFileName(null); }} className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                                        <X className="h-3 w-3" />
                                    </button>
                                    <p className="text-[10px] text-gray-400 font-['IBM_Plex_Mono'] mt-2 uppercase tracking-tight">{imageFileName}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 font-['Space_Grotesk']">
                                    Include an image for better engagement on Twitter and LinkedIn.
                                    <br />
                                    <span className="text-[11px] text-amber-600 italic">Note: Attach manually when publishing to X/Twitter.</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!source.trim() || platforms.length === 0 || isGenerating || availableProfiles.length === 0}
                    className="w-full bg-black text-white font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-[0.2em] py-5 mt-4 hover:bg-black/80 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-3"
                >
                    {isGenerating ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> ESTABLISHING NEURAL LINK...</>
                    ) : "Initialize Generation"}
                </button>
            </div>

            {/* Results */}
            {results && (
                <div className="space-y-4 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-green-600 tracking-[0.2em] flex items-center gap-2">
                        <Check className="h-4 w-4" /> // 03. GENERATION COMPLETE — SAVED TO LIBRARY
                    </p>
                    <div className="space-y-6">
                        {results.map((res, i) => {
                            const postStatus = publishing[res.platform];
                            const canDirectPost = ["linkedin", "twitter"].includes(res.platform.toLowerCase());
                            const isSchedulingThis = schedulingFor === res.platform;
                            return (
                                <div key={i} className="bg-white border border-gray-200 shadow-sm p-6">
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                        <h3 className="font-['IBM_Plex_Mono'] font-bold text-xs uppercase tracking-wider">{res.platform} PAYLOAD</h3>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => navigator.clipboard.writeText(res.content)}
                                                className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400 tracking-wider hover:text-black transition">
                                                COPY
                                            </button>
                                            {canDirectPost && (
                                                <button onClick={() => handlePublishNow(res)} disabled={postStatus === "posting" || postStatus === "done"}
                                                    className={`flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider transition ${postStatus === "done" ? 'text-green-600' : 'text-gray-400 hover:text-black'}`}>
                                                    {postStatus === "posting" ? <Loader2 className="h-3 w-3 animate-spin" /> : postStatus === "done" ? <Check className="h-3 w-3" /> : <Send className="h-3 w-3" />}
                                                    {postStatus === "done" ? "POSTED" : postStatus === "posting" ? "POSTING..." : "PUBLISH NOW"}
                                                </button>
                                            )}
                                            <button onClick={() => setSchedulingFor(isSchedulingThis ? null : res.platform)}
                                                className="flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider text-gray-400 hover:text-black transition">
                                                <Clock className="h-3 w-3" /> SCHEDULE
                                            </button>
                                            <button
                                                onClick={() => handleGenerateImage(res)}
                                                disabled={generatingImages[res.platform]}
                                                className="flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider text-indigo-500 hover:text-indigo-700 transition"
                                            >
                                                {generatingImages[res.platform] ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : generatedImages[res.platform] ? (
                                                    <RotateCcw className="h-3 w-3" />
                                                ) : (
                                                    <Sparkles className="h-3 w-3" />
                                                )}
                                                {generatingImages[res.platform] ? "Generating..." : generatedImages[res.platform] ? "Regenerate" : "AI Image"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="font-['Space_Grotesk'] text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        {res.content}
                                    </div>

                                    {generatedImages[res.platform] && (
                                        <div className="mt-6 pt-6 border-t border-indigo-50 animate-in zoom-in-95 duration-500">
                                            <p className="font-['IBM_Plex_Mono'] text-[10px] text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Sparkles className="h-3 w-3" /> // AI GENERATED VISUAL
                                            </p>
                                            <div className="relative group">
                                                <img
                                                    src={generatedImages[res.platform]}
                                                    alt="AI Generated"
                                                    className="max-h-[350px] w-auto rounded border border-indigo-100 shadow-lg group-hover:shadow-indigo-100 transition-all"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none" />
                                            </div>
                                        </div>
                                    )}

                                    {selectedImage && !generatedImages[res.platform] && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <p className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 uppercase tracking-widest mb-3">// ATTACHED MEDIA</p>
                                            <img src={selectedImage} alt="Attachment" className="max-h-[300px] w-auto rounded border border-gray-100 shadow-sm" />
                                        </div>
                                    )}
                                    {isSchedulingThis && (
                                        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-4 animate-in fade-in duration-200">
                                            <input type="datetime-local" value={scheduleDateTime} onChange={e => setScheduleDateTime(e.target.value)}
                                                className="border border-gray-200 p-2.5 font-['IBM_Plex_Mono'] text-[11px] focus:outline-none focus:border-black" />
                                            <button onClick={() => handleSchedule(res)}
                                                className="bg-black text-white font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-widest px-5 py-2.5 hover:bg-black/80 transition">
                                                CONFIRM
                                            </button>
                                            <button onClick={() => setSchedulingFor(null)}
                                                className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400 hover:text-black tracking-wider transition">
                                                CANCEL
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
