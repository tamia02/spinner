"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Mic, BarChart, Settings, Calendar, GitCompare } from "lucide-react";

const mainRoutes = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Content Library", href: "/dashboard/library", icon: FileText },
    { label: "Voice Profiles", href: "/dashboard/profiles", icon: Mic },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart },
    { label: "Scheduling", href: "/dashboard/scheduling", icon: Calendar },
    { label: "Workflows", href: "/dashboard/workflows", icon: GitCompare },
];

const configRoutes = [
    { label: "Setup", href: "/dashboard/setup", icon: Settings },
    { label: "API Access", href: "/dashboard/api", icon: Settings },
];

const Sidebar = () => {
    const pathname = usePathname();

    const isRouteActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname?.startsWith(href);
    };

    const renderLinks = (routes: typeof mainRoutes) => {
        return routes.map((route) => {
            const active = isRouteActive(route.href);
            return (
                <Link
                    key={route.href}
                    href={route.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-['Space_Grotesk'] font-medium transition-all ${active
                        ? "bg-black text-white"
                        : "text-gray-500 hover:text-black hover:bg-gray-100"
                        }`}
                >
                    <route.icon className="h-4 w-4" strokeWidth={1.5} />
                    {route.label}
                </Link>
            );
        });
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-black" />
                    <span className="font-['Space_Grotesk'] font-bold tracking-widest text-sm uppercase">SPINNER</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400 tracking-[0.2em]">
            // MAIN
                    </p>
                </div>
                <div className="space-y-1 mb-8">
                    {renderLinks(mainRoutes)}
                </div>

                <div className="px-4 mb-2">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-400 tracking-[0.2em]">
            // CONFIG
                    </p>
                </div>
                <div className="space-y-1">
                    {renderLinks(configRoutes)}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
