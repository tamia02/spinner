"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setError(error.message);
            } else {
                setSent(true);
            }
        }

        setLoading(false);
    };

    const handleGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback/supabase`,
            },
        });
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 font-['Space_Grotesk']">

            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="relative w-full max-w-md">

                {/* Logo */}
                <div className="flex items-center gap-2 mb-16">
                    <div className="w-3 h-3 bg-black" />
                    <span className="font-['IBM_Plex_Mono'] font-bold text-[11px] tracking-widest uppercase">SPINNER</span>
                </div>

                {/* Form */}
                <div className="border border-gray-100 p-10 shadow-sm bg-white">

                    {sent ? (
                        <div>
                            <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-4">// SEQUENCE INITIATED</p>
                            <h1 className="text-2xl font-bold mb-4">Check your email</h1>
                            <p className="text-gray-500 text-sm leading-relaxed">We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account and proceed to the dashboard.</p>
                        </div>
                    ) : (
                        <>
                            <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-[0.2em] mb-6">
                                {isLogin ? "// AUTHENTICATE" : "// INITIALIZE ACCOUNT"}
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight mb-10">
                                {isLogin ? "Sign In" : "Create Account"}
                            </h1>

                            {/* Google Auth */}
                            <button
                                onClick={handleGoogle}
                                className="w-full border border-gray-200 py-3.5 font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-widest text-gray-600 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-3 mb-8"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex-1 h-px bg-gray-100" />
                                <span className="font-['IBM_Plex_Mono'] text-[9px] uppercase text-gray-400 tracking-wider">or</span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>

                            <form onSubmit={handleAuth} className="space-y-5">
                                <div>
                                    <label className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-wider block mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="w-full border border-gray-200 p-3.5 text-[13px] focus:outline-none focus:border-black transition-colors"
                                        placeholder="you@domain.com"
                                    />
                                </div>
                                <div>
                                    <label className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-gray-500 tracking-wider block mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="w-full border border-gray-200 p-3.5 text-[13px] focus:outline-none focus:border-black transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {error && (
                                    <p className="font-['IBM_Plex_Mono'] text-[10px] text-red-500 uppercase tracking-wider">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black text-white font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-widest py-4 hover:bg-black/80 transition disabled:opacity-50 mt-2"
                                >
                                    {loading ? "PROCESSING..." : (isLogin ? "AUTHENTICATE" : "CREATE ACCOUNT")}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider text-gray-400 hover:text-black transition"
                                >
                                    {isLogin ? "No account? Create one →" : "Already registered? Sign In →"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
