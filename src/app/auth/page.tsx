"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        router.push("/designer-dashboard");
    };

    const handleSignup = async () => {
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        alert("Check your email to confirm account");
    };

    const handleGoogle = async () => {
        setLoading(true);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        setLoading(false);

        if (error) {
            alert(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-4">

                <h1 className="text-2xl font-bold">
                    Designer Login
                </h1>

                <input
                    className="w-full border p-3 rounded"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="w-full border p-3 rounded"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-red-600 text-white p-3 rounded"
                >
                    Login
                </button>

                <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full border p-3 rounded"
                >
                    Sign Up
                </button>

                <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full bg-black text-white p-3 rounded"
                >
                    Continue with Google
                </button>

            </div>
        </div>
    );
}
