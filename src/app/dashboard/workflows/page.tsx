import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function WorkflowsPage() {
    return (
        <div className="space-y-12 max-w-6xl">
            <div className="flex justify-between items-end">
                <div>
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-4">
            // AUTONOMOUS PROTOCOLS
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight">Workflows</h1>
                </div>
                <button className="bg-black text-white font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.15em] px-4 py-3 hover:bg-black/80 transition flex items-center gap-2">
                    <Plus className="h-4 w-4" /> CREATE WORKFLOW
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 shadow-sm p-6 hover:border-black transition-colors min-h-[220px] flex flex-col justify-between cursor-pointer">
                    <div>
                        <div className="font-['IBM_Plex_Mono'] text-[10px] text-gray-400 tracking-wider mb-4 uppercase">AUTO-PUBLISH</div>
                        <h3 className="text-lg font-bold mb-2">RSS to LinkedIn</h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-['Space_Grotesk']">
                            Detects new blog posts via RSS feed and automatically generates a LinkedIn synopsis.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                        <span className="font-['IBM_Plex_Mono'] text-[10px] text-green-600 tracking-wider">ACTIVE</span>
                        <div className="w-10 h-5 bg-black ml-auto rounded-full relative">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border text-gray-400 border-dashed border-gray-200 shadow-sm p-6 hover:border-black transition-colors min-h-[220px] flex flex-col items-center justify-center cursor-pointer">
                    <Plus className="h-6 w-6 mb-4" />
                    <div className="font-['IBM_Plex_Mono'] text-[10px] tracking-wider uppercase text-center">
                        DEFINE NEW<br />NEURAL PATHWAY
                    </div>
                </div>
            </div>
        </div>
    );
}
