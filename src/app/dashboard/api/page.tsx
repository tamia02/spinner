import React from "react";
import { Eye, Copy, Trash } from "lucide-react";

export default function ApiAccessPage() {
    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-2">
          // API ACCESS
                </p>
                <h1 className="text-2xl font-bold tracking-tight mb-8">API Access</h1>
            </div>

            <div className="space-y-4">
                <p className="font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-400 tracking-[0.2em]">
          // YOUR API KEYS
                </p>
                <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)] space-y-5">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-['Space_Grotesk'] font-medium text-[13px]">Production</span>
                        <span className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider">CREATED 2 WEEKS AGO</span>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="flex-1 bg-gray-100/50 font-['IBM_Plex_Mono'] text-[11px] text-gray-600 p-2.5">
                            sk_live_***********a4f2
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-['IBM_Plex_Mono'] text-gray-400 uppercase tracking-widest">
                            <button className="flex items-center gap-1.5 hover:text-black transition-colors">
                                <Eye className="h-3 w-3" /> Reveal
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-black transition-colors">
                                <Copy className="h-3 w-3" /> Copy
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-red-600 transition-colors">
                                <Trash className="h-3 w-3" /> Revoke
                            </button>
                        </div>
                    </div>

                    <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider">
                        LAST USED: 5H AGO - 142 REQUESTS THIS MONTH
                    </div>
                </div>

                <button className="bg-black text-white font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.15em] px-4 py-2 hover:bg-black/90 transition">
                    + GENERATE NEW KEY
                </button>
            </div>

            <div className="space-y-4 pt-4">
                <p className="font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-400 tracking-[0.2em]">
          // USAGE THIS MONTH
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)]">
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider mb-3 uppercase">
                            API REQUESTS
                        </div>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-3xl font-bold">142</span>
                            <span className="text-gray-400 text-[11px] font-['IBM_Plex_Mono']">/ 10,000</span>
                        </div>
                        <div className="h-0.5 bg-gray-100 w-full mb-2">
                            <div className="h-full bg-black w-[1.4%]" />
                        </div>
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 uppercase tracking-wider">
                            1.4% USED
                        </div>
                    </div>

                    <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)]">
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider mb-3 uppercase">
                            TOKENS USED
                        </div>
                        <div className="flex items-baseline gap-1 mb-5">
                            <span className="text-3xl font-bold">38,400</span>
                        </div>
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 uppercase tracking-wider">
                            THIS MONTH
                        </div>
                    </div>

                    <div className="bg-white p-5 border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)]">
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider mb-3 uppercase">
                            RATE LIMIT
                        </div>
                        <div className="flex items-baseline gap-1 mb-5">
                            <span className="text-3xl font-bold">100</span>
                            <span className="text-gray-400 text-[11px] font-['IBM_Plex_Mono']">req/min</span>
                        </div>
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-gray-400 uppercase tracking-wider">
                            CURRENT PLAN
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <p className="font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-400 tracking-[0.2em]">
          // RATE LIMITS
                </p>
                <div className="bg-white border border-gray-100 shadow-[0_1px_3px_rgb(0,0,0,0.02)]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="py-3 px-5 font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider font-medium uppercase">PLAN</th>
                                <th className="py-3 px-5 font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider font-medium uppercase">REQUESTS/MIN</th>
                                <th className="py-3 px-5 font-['IBM_Plex_Mono'] text-[9px] text-gray-400 tracking-wider font-medium uppercase">GENERATIONS/MO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-4 px-5 font-medium text-[13px] text-gray-600">Starter</td>
                                <td className="py-4 px-5 font-['IBM_Plex_Mono'] text-[11px] text-gray-600">10</td>
                                <td className="py-4 px-5 font-['IBM_Plex_Mono'] text-[11px] text-gray-600">50</td>
                            </tr>
                            <tr>
                                <td className="py-4 px-5 font-medium text-[13px] text-gray-900">Pro</td>
                                <td className="py-4 px-5 font-['IBM_Plex_Mono'] text-[11px] text-gray-900">30</td>
                                <td className="py-4 px-5 font-['IBM_Plex_Mono'] text-[11px] text-gray-900 flex items-center justify-between">
                                    300
                                    <span className="bg-black text-white text-[9px] px-2 py-0.5 tracking-wider">CURRENT</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-4 px-5 font-medium text-[13px] text-gray-600">Business</td>
                                <td className="py-4 px-5 font-['IBM_Plex_Mono'] text-[11px] text-gray-600">100</td>
                                <td className="py-4 px-5 font-['IBM_Plex_Mono'] text-[11px] text-gray-600">Unlimited</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
