"use client";

import React, { useState, useEffect } from "react";
import { Copy, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface ContentItem {
    id: string;
    sourceStr: string;
    platform: string;
    platforms: string[];
    content: string;
    createdAt: string;
}

interface GroupedItem {
    sourceStr: string;
    createdAt: string;
    items: ContentItem[];
}

const PLATFORM_COLORS: Record<string, string> = {
    twitter: "bg-sky-50 text-sky-700 border-sky-100",
    linkedin: "bg-blue-50 text-blue-700 border-blue-100",
    instagram: "bg-pink-50 text-pink-700 border-pink-100",
    newsletter: "bg-amber-50 text-amber-700 border-amber-100",
    blog: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

function getPlatformStyle(platform: string) {
    return PLATFORM_COLORS[platform.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-200";
}

function ContentCard({ item, showSource = false }: { item: ContentItem; showSource?: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(item.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const preview = item.content.length > 160 ? item.content.substring(0, 160) + "..." : item.content;

    return (
        <div className="bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-all">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-widest px-2.5 py-1 border ${getPlatformStyle(item.platform)}`}>
                                {item.platform}
                            </span>
                            <span className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider">
                                {new Date(item.createdAt).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", year: "numeric"
                                })}
                            </span>
                        </div>
                        {showSource && (
                            <p className="font-['IBM_Plex_Mono'] text-[10px] text-gray-500 truncate mb-2">
                                ↳ {item.sourceStr}
                            </p>
                        )}
                        <p className="font-['Space_Grotesk'] text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {expanded ? item.content : preview}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 mt-1">
                        <button
                            onClick={handleCopy}
                            className="font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-wider text-gray-400 hover:text-black transition-colors"
                        >
                            {copied ? "COPIED" : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        {item.content.length > 160 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-gray-400 hover:text-black transition-colors"
                            >
                                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function GroupedHistoryCard({ group }: { group: GroupedItem }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            {/* Group header */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-gray-50/50 transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <p className="font-['Space_Grotesk'] text-sm font-semibold text-gray-800 truncate mb-2">
                        {group.sourceStr}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                        {group.items.map(item => (
                            <span key={item.id} className={`font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-widest px-2 py-0.5 border ${getPlatformStyle(item.platform)}`}>
                                {item.platform}
                            </span>
                        ))}
                        <span className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider">
                            {new Date(group.createdAt).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric"
                            })}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 uppercase tracking-wider">
                        {group.items.length} post{group.items.length !== 1 ? "s" : ""}
                    </span>
                    {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
            </button>

            {/* Expanded content */}
            {open && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {group.items.map(item => (
                        <ContentCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ContentLibraryPage() {
    const [activeTab, setActiveTab] = useState<"history" | "all">("history");
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/content")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setContent(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Group by source + same-minute timestamp (one generation session)
    const grouped: GroupedItem[] = React.useMemo(() => {
        const map = new Map<string, GroupedItem>();
        content.forEach(item => {
            const key = item.sourceStr;
            if (!map.has(key)) {
                map.set(key, { sourceStr: item.sourceStr, createdAt: item.createdAt, items: [] });
            }
            map.get(key)!.items.push(item);
        });
        return Array.from(map.values());
    }, [content]);

    // "All Content" = flat list, sorted by platform name
    const allSorted = [...content].sort((a, b) => a.platform.localeCompare(b.platform));

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-4">
                    // ARCHIVE
                </p>
                <div className="flex justify-between items-end border-b border-gray-200 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight">Content Library</h1>
                    {!loading && (
                        <span className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 uppercase tracking-wider">
                            {content.length} item{content.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-4 transition-colors relative ${activeTab === "history" ? "text-black font-bold" : "text-gray-400 hover:text-black"}`}
                >
                    Generated History
                    {activeTab === "history" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`pb-4 transition-colors relative ${activeTab === "all" ? "text-black font-bold" : "text-gray-400 hover:text-black"}`}
                >
                    All Content
                    {activeTab === "all" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mb-4" />
                    <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest">Loading Records...</span>
                </div>
            ) : content.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400 border border-dashed border-gray-200">
                    <p className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider mb-2 text-black">Empty Archive</p>
                    <p className="text-sm">You haven't generated any content yet.</p>
                </div>
            ) : activeTab === "history" ? (
                <div className="space-y-4">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400 tracking-[0.2em]">
                        // {grouped.length} GENERATION SESSION{grouped.length !== 1 ? "S" : ""}
                    </p>
                    {grouped.map((group, i) => (
                        <GroupedHistoryCard key={i} group={group} />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400 tracking-[0.2em]">
                        // ALL {allSorted.length} GENERATED PIECES — SORTED BY PLATFORM
                    </p>
                    {allSorted.map(item => (
                        <ContentCard key={item.id} item={item} showSource />
                    ))}
                </div>
            )}
        </div>
    );
}
