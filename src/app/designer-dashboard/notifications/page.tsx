"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquarePlus, Wallet, Clock, Ruler, Bell as BellIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Notification = {
    id: string;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    read: boolean;
    created_at: string;
};

const TYPE_ICON: Record<string, any> = {
    new_inquiry: MessageSquarePlus,
    payment_received: Wallet,
    job_due_soon: Clock,
    measurement_submitted: Ruler,
};

const TYPE_COLOR: Record<string, string> = {
    new_inquiry: "bg-blue-50 text-blue-600",
    payment_received: "bg-emerald-50 text-emerald-600",
    job_due_soon: "bg-amber-50 text-amber-600",
    measurement_submitted: "bg-purple-50 text-purple-600",
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data } = await supabase
                .from("notifications")
                .select("*")
                .eq("designer_id", user.id)
                .order("created_at", { ascending: false })
                .limit(50);

            setNotifications(data ?? []);
            setLoading(false);

            const unreadIds = (data ?? []).filter(n => !n.read).map(n => n.id);
            if (unreadIds.length > 0) {
                await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
            }
        };

        load();
    }, [router]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3 px-5 pt-4 pb-4">
                    <Link
                        href="/designer-dashboard"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <p className="text-lg font-bold text-gray-900">Notifications</p>
                </div>
            </header>

            <div className="px-5 py-4">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                            <BellIcon size={28} className="text-gray-400" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">No notifications yet</h2>
                        <p className="mt-1.5 max-w-xs text-sm text-gray-400">
                            New inquiries, payments, and job updates will show up here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((n) => {
                            const Icon = TYPE_ICON[n.type] ?? BellIcon;
                            const colorClass = TYPE_COLOR[n.type] ?? "bg-gray-100 text-gray-500";
                            const content = (
                                <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                                        {n.body && (
                                            <p className="mt-0.5 text-xs text-gray-500">{n.body}</p>
                                        )}
                                        <p className="mt-1 text-[10px] text-gray-400">{timeAgo(n.created_at)}</p>
                                    </div>
                                    {!n.read && (
                                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                                    )}
                                </div>
                            );

                            return n.link ? (
                                <Link key={n.id} href={n.link}>{content}</Link>
                            ) : (
                                <div key={n.id}>{content}</div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
