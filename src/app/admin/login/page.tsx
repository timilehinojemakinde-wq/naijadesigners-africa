"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        if (!email.trim() || !password.trim()) {
            setError("Enter both email and password.");
            return;
        }

        setLoading(true);

        const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (loginError || !data.user) {
            setError("Invalid email or password.");
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

        if (profile?.role !== "admin") {
            setError("This account doesn't have admin access.");
            await supabase.auth.signOut();
            setLoading(false);
            return;
        }

        router.push("/admin");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-950 px-5">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                        <Lock size={20} className="text-emerald-400" />
                    </div>
                    <h1 className="text-lg font-bold text-white">
                        FitHouse<span className="text-emerald-400">Admin</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Sign in to manage the platform.</p>
                </div>

                <div className="rounded-2xl bg-gray-900 p-6">
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-400">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="you@fithouseafrica.com"
                                className="h-11 w-full rounded-xl border border-gray-700 bg-gray-800 px-3.5 text-sm text-white outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-400">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="••••••••"
                                className="h-11 w-full rounded-xl border border-gray-700 bg-gray-800 px-3.5 text-sm text-white outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-3 rounded-xl bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                    >
                        {loading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
}