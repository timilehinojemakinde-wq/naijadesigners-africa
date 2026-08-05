"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Clock, TrendingUp, UserCheck, Sparkles, UserX, AlertOctagon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminOverview() {
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        trialsEndingSoon: 0,
        trialsExpired: 0,
        revenueThisMonth: 0,
        revenueLifetime: 0,
        totalDesigners: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const now = new Date();

            const [
                { count: pending },
                { count: approved },
                { count: rejected },
                { count: trialsEndingSoon },
                { count: trialsExpired },
                { data: payments },
                { count: totalDesigners },
            ] = await Promise.all([
                supabase.from("designers").select("*", { count: "exact", head: true }).eq("approval_status", "pending"),
                supabase.from("designers").select("*", { count: "exact", head: true }).eq("approval_status", "approved"),
                supabase.from("designers").select("*", { count: "exact", head: true }).eq("approval_status", "rejected"),
                supabase.from("designers").select("*", { count: "exact", head: true })
                    .eq("approval_status", "approved")
                    .eq("plan", "trial")
                    .lte("trial_ends_at", new Date(Date.now() + 3 * 86400000).toISOString())
                    .gte("trial_ends_at", now.toISOString()),
                supabase.from("designers").select("*", { count: "exact", head: true })
                    .eq("approval_status", "approved")
                    .eq("plan", "trial")
                    .lt("trial_ends_at", now.toISOString()),
                supabase.from("subscription_payments").select("amount, created_at").eq("status", "paid"),
                supabase.from("designers").select("*", { count: "exact", head: true }),
            ]);

            const revenueLifetime = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
            const revenueThisMonth = (payments ?? [])
                .filter((p) => new Date(p.created_at) >= startOfMonth)
                .reduce((sum, p) => sum + Number(p.amount), 0);

            setStats({
                pending: pending ?? 0,
                approved: approved ?? 0,
                rejected: rejected ?? 0,
                trialsEndingSoon: trialsEndingSoon ?? 0,
                trialsExpired: trialsExpired ?? 0,
                revenueThisMonth,
                revenueLifetime,
                totalDesigners: totalDesigners ?? 0,
            });
            setLoading(false);
        };
        load();
    }, []);

    const cards = [
        { label: "Pending Approvals", value: stats.pending, icon: Users, href: "/admin/designers?filter=pending", color: "text-amber-600 bg-amber-50" },
        { label: "Approved Designers", value: stats.approved, icon: UserCheck, href: "/admin/designers?filter=approved", color: "text-emerald-600 bg-emerald-50" },
        { label: "Rejected Applications", value: stats.rejected, icon: UserX, href: "/admin/designers?filter=rejected", color: "text-gray-500 bg-gray-100" },
        { label: "Trials Ending (3 days)", value: stats.trialsEndingSoon, icon: Clock, href: "/admin/trials", color: "text-amber-600 bg-amber-50" },
        { label: "Trials Expired", value: stats.trialsExpired, icon: AlertOctagon, href: "/admin/trials", color: "text-red-600 bg-red-50" },
    ];

    return (
        <div className="px-6 py-8 md:px-10">
            <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
            <p className="mt-1 text-sm text-gray-500">Everything that needs your attention today.</p>

            {loading ? (
                <div className="mt-10 flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
                </div>
            ) : stats.totalDesigners === 0 ? (
                <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                        <Sparkles size={22} className="text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No designers yet</p>
                    <p className="mt-1 text-xs text-gray-400">Once someone signs up and completes onboarding, they'll show up here for approval.</p>
                </div>
            ) : (
                <>
                    {/* REVENUE HERO — this month first, lifetime secondary */}
                    <Link
                        href="/admin/subscriptions"
                        className="mt-8 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
                    >
                        <div>
                            <div className="inline-flex rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                                <TrendingUp size={18} />
                            </div>
                            <p className="mt-3 text-3xl font-bold text-white">₦{stats.revenueThisMonth.toLocaleString()}</p>
                            <p className="mt-1 text-xs font-medium text-gray-400">Revenue This Month</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-semibold text-gray-300">₦{stats.revenueLifetime.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Lifetime Total</p>
                        </div>
                    </Link>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Link
                                    key={card.label}
                                    href={card.href}
                                    className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                                >
                                    <div className={`inline-flex rounded-xl p-2.5 ${card.color}`}>
                                        <Icon size={18} />
                                    </div>
                                    <p className="mt-4 text-2xl font-bold text-gray-900">{card.value}</p>
                                    <p className="mt-1 text-xs font-medium text-gray-500">{card.label}</p>
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}

            {stats.trialsExpired > 0 && (
                <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-semibold text-red-800">
                        {stats.trialsExpired} trial{stats.trialsExpired !== 1 ? "s have" : " has"} expired without converting
                    </p>
                    <p className="mt-1 text-xs text-red-600">
                        These designers are actively churning right now — reach out before they're gone for good.
                    </p>
                    <Link
                        href="/admin/trials"
                        className="mt-3 inline-flex rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                        View Trials
                    </Link>
                </div>
            )}

            {stats.pending > 0 && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm font-semibold text-amber-800">
                        {stats.pending} designer{stats.pending !== 1 ? "s" : ""} waiting on approval
                    </p>
                    <p className="mt-1 text-xs text-amber-600">
                        Verify their Instagram/TikTok and approve to unlock their dashboard.
                    </p>
                    <Link
                        href="/admin/designers?filter=pending"
                        className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                        Review Now
                    </Link>
                </div>
            )}
        </div>
    );
}