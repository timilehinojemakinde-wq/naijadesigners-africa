"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function NotificationPrompt() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
        if (
            Notification.permission === "default" &&
            !localStorage.getItem("push_prompt_dismissed")
        ) {
            setVisible(true);
        }
    }, []);

    const enable = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") { setVisible(false); return; }

            const registration = await navigator.serviceWorker.register("/sw.js");
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            });

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const json = subscription.toJSON();
            await supabase.from("push_subscriptions").upsert(
                {
                    designer_id: user.id,
                    endpoint: json.endpoint!,
                    p256dh: json.keys!.p256dh!,
                    auth: json.keys!.auth!,
                },
                { onConflict: "endpoint" }
            );

            setVisible(false);
        } catch (err) {
            console.error("Push subscription failed:", err);
            setVisible(false);
        }
    };

    const dismiss = () => {
        localStorage.setItem("push_prompt_dismissed", "true");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-20 left-5 right-5 z-50 mx-auto max-w-md rounded-2xl bg-gray-900 p-4 shadow-lg">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Bell size={16} className="text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Stay on top of new orders</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                        Get notified for new inquiries, payments, and job deadlines — even when the app is closed.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={enable}
                            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-900"
                        >
                            Enable Notifications
                        </button>
                        <button
                            onClick={dismiss}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-400"
                        >
                            Not Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
