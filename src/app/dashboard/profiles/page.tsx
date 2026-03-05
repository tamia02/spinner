"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, X, Star, Trash2, Loader2, Sparkles } from "lucide-react";

interface VoiceProfile {
    id: string;
    name: string;
    audience: string;
    tone: string;
    formality: number;
    humor: number;
    emoji: number;
    isDefault: boolean;
    writingStyle?: string;
    writingSample?: string;
}

const TONE_OPTIONS = [
    "PROFESSIONAL", "CASUAL", "WITTY", "AUTHORITATIVE",
    "EDUCATIONAL", "CONVERSATIONAL", "TECHNICAL", "STORYTELLING"
];

export default function VoiceProfilesPage() {
    const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<VoiceProfile>>({});
    const [saving, setSaving] = useState(false);
    const [sampleText, setSampleText] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeResult, setAnalyzeResult] = useState<string | null>(null);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const res = await fetch("/api/profiles");
            const data = await res.json();
            if (Array.isArray(data)) setProfiles(data);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (p?: VoiceProfile) => {
        setSampleText("");
        setAnalyzeResult(null);
        if (p) {
            setFormData(p);
            setSampleText(p.writingSample || "");
            setEditingId(p.id);
        } else {
            setFormData({
                name: "New Profile",
                audience: "General audience",
                tone: "PROFESSIONAL",
                formality: 50,
                humor: 20,
                emoji: 10,
                isDefault: profiles.length === 0,
            });
            setEditingId("new");
        }
    };

    const handleAnalyzeVoice = async () => {
        if (!sampleText.trim() || sampleText.trim().length < 20) {
            alert("Please paste at least one of your own posts (minimum 20 characters).");
            return;
        }
        setAnalyzing(true);
        setAnalyzeResult(null);
        try {
            const res = await fetch("/api/profiles/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sampleText, profileId: editingId !== "new" ? editingId : undefined }),
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    formality: data.formality,
                    humor: data.humor,
                    emoji: data.emoji,
                    writingStyle: data.styleDescription,
                    writingSample: sampleText,
                }));
                setAnalyzeResult(data.styleDescription);
            } else {
                alert(data.error || "Analysis failed.");
            }
        } catch {
            alert("Network error during analysis.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) return;
        setSaving(true);
        const method = editingId === "new" ? "POST" : "PUT";
        const url = editingId === "new" ? "/api/profiles" : `/api/profiles/${editingId}`;

        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            await fetchProfiles();
            setEditingId(null);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this profile?")) return;
        await fetch(`/api/profiles/${id}`, { method: "DELETE" });
        await fetchProfiles();
    };

    const handleSetDefault = async (id: string) => {
        // Find current default and unset it, set this one
        const currentDef = profiles.find(p => p.isDefault);
        if (currentDef && currentDef.id !== id) {
            fetch(`/api/profiles/${currentDef.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...currentDef, isDefault: false }),
            });
        }

        const target = profiles.find(p => p.id === id);
        if (target) {
            await fetch(`/api/profiles/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...target, isDefault: true }),
            });
            await fetchProfiles();
        }
    };

    return (
        <div className="max-w-5xl font-['Space_Grotesk']">
            <div className="flex justify-between items-end pb-8 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Voice Profiles</h1>
                </div>
                <button
                    onClick={() => handleEdit()}
                    className="bg-black text-white font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.15em] px-4 py-3 hover:bg-black/80 transition flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> NEW PROFILE
                </button>
            </div>

            {loading ? (
                <div className="pt-8 font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading Profiles...
                </div>
            ) : profiles.length === 0 && !editingId ? (
                <div className="pt-12 text-center border border-dashed border-gray-200 p-12 mt-8">
                    <p className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider text-gray-400 mb-2">No Profiles Found</p>
                    <p className="text-sm text-gray-500">Create your first voice profile to define your AI's writing style.</p>
                </div>
            ) : (
                <div className="space-y-6 mt-8">
                    {profiles.map((profile) => (
                        <div key={profile.id} className={`bg-white border p-6 shadow-sm transition-all ${profile.isDefault ? 'border-black' : 'border-gray-100 hover:border-gray-300'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold mb-1 flex items-center gap-3">
                                        {profile.name}
                                        {profile.isDefault && <span className="font-['IBM_Plex_Mono'] text-[9px] bg-black text-white px-2 py-0.5 uppercase tracking-wider">Default</span>}
                                    </h3>
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.15em] mb-4">
                                        // {profile.tone}
                                    </p>
                                    <div className="text-[12px] text-gray-600 mb-1 font-['IBM_Plex_Mono']">
                                        Formality {profile.formality}% &middot; Humor {profile.humor}% &middot; Emoji {profile.emoji}%
                                    </div>
                                    <div className="text-[12px] text-gray-600 font-['IBM_Plex_Mono']">
                                        Audience: {profile.audience}
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider text-gray-500">
                                    <button onClick={() => handleEdit(profile)} className="flex items-center gap-1.5 hover:text-black transition">
                                        <Edit2 className="h-3 w-3" /> EDIT
                                    </button>
                                    {!profile.isDefault && (
                                        <button onClick={() => handleSetDefault(profile.id)} className="flex items-center gap-1.5 hover:text-black transition">
                                            <Star className="h-3 w-3" /> SET DEFAULT
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(profile.id)} className="flex items-center gap-1.5 hover:text-red-500 transition">
                                        <Trash2 className="h-3 w-3" /> DELETE
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Edit Form */}
                    {editingId && (
                        <div className="bg-[#f8f9fb] border border-gray-100 p-10 relative mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button
                                onClick={() => setEditingId(null)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-black transition"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-10">
                                // {editingId === 'new' ? 'CREATE PROFILE' : 'EDIT PROFILE'}
                            </p>

                            <div className="space-y-12">
                                {/* Analyze My Voice */}
                                <section className="border border-dashed border-gray-300 p-6 bg-white">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-1">
                                                // ANALYZE MY VOICE
                                            </p>
                                            <p className="text-sm text-gray-500">Paste 1-3 posts you&apos;ve written. AI will analyze your style and auto-calibrate the sliders.</p>
                                        </div>
                                        <Sparkles className="h-4 w-4 text-gray-300 flex-shrink-0 mt-1" />
                                    </div>
                                    <textarea
                                        value={sampleText}
                                        onChange={e => setSampleText(e.target.value)}
                                        placeholder={"Paste your own posts here...\n\nPost 1:\n...\n\nPost 2:\n..."}
                                        className="w-full min-h-[140px] border border-gray-200 bg-gray-50 p-4 font-['Space_Grotesk'] text-sm focus:outline-none focus:border-black placeholder:text-gray-400 resize-y"
                                    />
                                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                                        <button
                                            onClick={handleAnalyzeVoice}
                                            disabled={analyzing || sampleText.trim().length < 20}
                                            className="flex items-center gap-2 bg-black text-white font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider px-5 py-3 hover:bg-black/80 transition disabled:bg-gray-300"
                                        >
                                            {analyzing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> ANALYZING...</> : <><Sparkles className="h-3.5 w-3.5" /> ANALYZE MY VOICE</>}
                                        </button>
                                        {analyzeResult && (
                                            <p className="text-[12px] text-green-700 font-['Space_Grotesk'] italic flex-1">
                                                ✓ {analyzeResult}
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* Basic Settings */}
                                <section>
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-6">
                                        // BASIC SETTINGS
                                    </p>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-wider block mb-2">NAME</label>
                                            <input
                                                type="text"
                                                value={formData.name || ""}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full border border-gray-200 p-4 text-[13px] focus:outline-none focus:border-black bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-wider block mb-2">TARGET AUDIENCE</label>
                                            <input
                                                type="text"
                                                value={formData.audience || ""}
                                                onChange={e => setFormData({ ...formData, audience: e.target.value })}
                                                className="w-full border border-gray-200 p-4 text-[13px] focus:outline-none focus:border-black bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-wider block mb-2">TONE</label>
                                            <div className="flex flex-wrap gap-2">
                                                {TONE_OPTIONS.map(tone => (
                                                    <button
                                                        key={tone}
                                                        onClick={() => setFormData({ ...formData, tone })}
                                                        className={`px-4 py-2 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider transition-colors
                                                        ${formData.tone === tone ? 'bg-transparent text-black border-l border-r border-black font-bold' : 'bg-transparent text-gray-400 border-l border-r border-transparent hover:text-black'}`}
                                                    >
                                                        {formData.tone === tone ? `[ ${tone} ]` : tone}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Calibration */}
                                <section>
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-8">
                                        // CALIBRATION
                                    </p>

                                    <div className="space-y-8">
                                        {/* Formality */}
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-wider">FORMALITY</label>
                                                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold">{formData.formality}%</span>
                                            </div>
                                            <input type="range" className="w-full accent-black mb-3" min="0" max="100"
                                                value={formData.formality || 50}
                                                onChange={e => setFormData({ ...formData, formality: parseInt(e.target.value) })} />
                                            <div className="flex justify-between font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-400">
                                                <span>Casual</span>
                                                <span>Corporate</span>
                                            </div>
                                        </div>

                                        {/* Humor */}
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-wider">HUMOR</label>
                                                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold">{formData.humor}%</span>
                                            </div>
                                            <input type="range" className="w-full accent-black mb-3" min="0" max="100"
                                                value={formData.humor || 20}
                                                onChange={e => setFormData({ ...formData, humor: parseInt(e.target.value) })} />
                                            <div className="flex justify-between font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-400">
                                                <span>Stiff</span>
                                                <span>Witty</span>
                                            </div>
                                        </div>

                                        {/* Emoji Usage */}
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-wider">EMOJI USAGE</label>
                                                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold">{formData.emoji}%</span>
                                            </div>
                                            <input type="range" className="w-full accent-black mb-3" min="0" max="100"
                                                value={formData.emoji || 10}
                                                onChange={e => setFormData({ ...formData, emoji: parseInt(e.target.value) })} />
                                            <div className="flex justify-between font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-400">
                                                <span>None</span>
                                                <span>Heavy</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="flex justify-end pt-4 border-t border-gray-200 mt-8">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-black text-white font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.15em] px-8 py-4 hover:bg-black/90 transition flex items-center gap-2 mt-6"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "SAVE PROFILE"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
