"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error(error);
                    router.push("/auth");
                    return;
                }

                if (data.session) {
                    router.push("/designer-dashboard");
                } else {
                    router.push("/auth");
                }
            } catch (err) {
                console.error(err);
                router.push("/auth");
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Signing you in...</p>
        </div>
    );
}
