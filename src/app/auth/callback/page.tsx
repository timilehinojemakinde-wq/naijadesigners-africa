"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Exchange the code in the URL for a session
                const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
                    window.location.href
                );

                if (sessionError) {
                    console.error("Session exchange error:", sessionError);
                    router.push("/auth");
                    return;
                }

                // Get the user
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    console.error("User error:", userError);
                    router.push("/auth");
                    return;
                }

                // Check if onboarding is complete
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