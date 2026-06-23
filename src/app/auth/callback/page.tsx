"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Let Supabase auto-detect and handle the OAuth callback
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Session error:", error);
                    router.push("/auth");
                    return;
                }

                if (!session) {
                    // Wait briefly for session to establish then retry
                    await new Promise((r) => setTimeout(r, 1000));
                    const { data: { session: retrySession } } = await supabase.auth.getSession();

                    if (!retrySession) {
                        router.push("/auth");
                        return;
                    }
                }

                // Get user and check onboarding
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push("/auth");
                    return;
                }

                const { data: designer } = await supabase
                    .from("designers")
                    .select("onboarding_completed")
                    .eq("id", user.id)
                    .single();

                if (!designer?.onboarding_completed) {
                    router.push("/designer-dashboard/onboarding");
                } else {
                    router.push("/designer-dashboard");
                }

            } catch (err) {
                console.error("Callback error:", err);
                router.push("/auth");
            }
        };

        handleCallback();
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-white">
            <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
                <p className="text-sm text-gray-500">Signing you in...</p>
            </div>
        </main>
    );
}