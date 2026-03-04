"use client";

import React, { useState, useEffect } from "react";
import { Copy, Eye, MoreHorizontal, Loader2 } from "lucide-react";

interface GeneratedItem {
    id: string;
    sourceStr: string;
    platforms: string[];
    createdAt: string;
}

export default function ContentLibraryPage() {
    const [activeTab, setActiveTab] = useState<'history' | 'all'>('history');
    const [content, setContent] = useState<GeneratedItem[]>([]);
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

    // For now, both tabs show the same database content until "All Content" definition expands
    const displayData = content;

    return (
        <div className="space-y-8 max-w-6xl">
            <div>
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-4">
                    // ARCHIVE
                </p>
                <div className="flex justify-between items-end border-b border-gray-200 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight">Content Library</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 transition-colors relative ${activeTab === 'history' ? 'text-black font-bold' : 'text-gray-400 hover:text-black'}`}
                >
                    Generated History
                    {activeTab === 'history' && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-4 transition-colors relative ${activeTab === 'all' ? 'text-black font-bold' : 'text-gray-400 hover:text-black'}`}
                >
                    All Content
                    {activeTab === 'all' && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
                    )}
                </button>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden mt-8 min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-24 text-gray-400">
                        <Loader2 className="h-6 w-6 animate-spin mb-4" />
                        <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest">Loading Records...</span>
                    </div>
                ) : displayData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-32 text-center text-gray-400 border border-dashed border-gray-200 m-8">
                        <p className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider mb-2 text-black">Empty Archive</p>
                        <p className="text-sm">You haven't generated any content yet.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="py-4 px-6 font-['IBM_Plex_Mono'] text-[10px] text-gray-500 tracking-wider font-medium uppercase min-w-[300px]">Source Target</th>
                                <th className="py-4 px-6 font-['IBM_Plex_Mono'] text-[10px] text-gray-500 tracking-wider font-medium uppercase">Syndicated Entities</th>
                                <th className="py-4 px-6 font-['IBM_Plex_Mono'] text-[10px] text-gray-500 tracking-wider font-medium uppercase text-center">Timestamp</th>
                                <th className="py-4 px-6 font-['IBM_Plex_Mono'] text-[10px] text-gray-500 tracking-wider font-medium uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                    <td className="py-5 px-6 font-medium text-sm">
                                        <div className="truncate max-w-[400px]">
                                            {item.sourceStr}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex flex-wrap gap-2 font-['IBM_Plex_Mono'] text-[9px] text-gray-600 uppercase">
                                            {item.platforms.map((platform) => (
                                                <span key={platform} className="bg-gray-100 border border-gray-200 px-2.5 py-1 tracking-wider">{platform}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-center font-['IBM_Plex_Mono'] text-[10px] text-gray-500 tracking-wider">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-5 px-6 text-right">
                                        <button className="text-gray-400 hover:text-black ml-4 transition-colors p-2 hover:bg-gray-100"><Copy className="h-3.5 w-3.5" /></button>
                                        <button className="text-gray-400 hover:text-black ml-2 transition-colors p-2 hover:bg-gray-100"><Eye className="h-3.5 w-3.5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
