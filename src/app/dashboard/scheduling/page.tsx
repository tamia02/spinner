"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Clock } from "lucide-react";

interface ScheduledPost {
    id: string;
    platform: string;
    content: string;
    scheduledAt: string;
    status: string;
}

const PLATFORM_COLORS: Record<string, string> = {
    linkedin: "bg-blue-50 text-blue-700",
    twitter: "bg-sky-50 text-sky-700",
    instagram: "bg-pink-50 text-pink-700",
    newsletter: "bg-amber-50 text-amber-700",
    blog: "bg-emerald-50 text-emerald-700",
};

export default function SchedulingPage() {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/schedule")
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setPosts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        await fetch(`/api/schedule?id=${id}`, { method: "DELETE" });
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-10 max-w-5xl font-['Space_Grotesk']">
            <div className="flex justify-between items-end border-b border-gray-200 pb-6">
                <div>
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-4">
                        // DISTRIBUTION QUEUE
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight">Scheduling</h1>
                </div>
            </div>

            {loading ? (
                <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider text-gray-400">
                    Loading queue...
                </div>
            ) : posts.length === 0 ? (
                <div className="border border-dashed border-gray-200 p-12 text-center">
                    <Clock className="h-8 w-8 text-gray-300 mx-auto mb-4" />
                    <p className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider text-gray-400 mb-2">
                        Queue is empty
                    </p>
                    <p className="text-sm text-gray-400">
                        Schedule posts from the <strong>Create</strong> page
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em]">
                        // {posts.length} POSTS QUEUED
                    </p>
                    {posts.map(post => (
                        <div key={post.id} className="bg-white border border-gray-100 p-6 flex gap-6 items-start shadow-sm hover:border-gray-300 transition">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider px-2.5 py-1 ${PLATFORM_COLORS[post.platform.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                                        {post.platform}
                                    </span>
                                    <span className={`font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-wider px-2 py-1 ${post.status === 'POSTED' ? 'text-green-600 bg-green-50' :
                                            post.status === 'FAILED' ? 'text-red-500 bg-red-50' :
                                                'text-gray-500 bg-gray-100'
                                        }`}>
                                        {post.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 mb-4">
                                    {post.content}
                                </p>
                                <div className="flex items-center gap-2 font-['IBM_Plex_Mono'] text-[10px] text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    {new Date(post.scheduledAt).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            {post.status === 'PENDING' && (
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="text-gray-300 hover:text-red-500 transition flex-shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
