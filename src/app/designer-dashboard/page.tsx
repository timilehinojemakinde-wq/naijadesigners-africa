"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus, Ruler, Images, FileText,
    ChevronRight, Bell
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import BottomNav from "@/components/dashboard/BottomNav";

type Designer = {
    brand_name: string | null;
};

type JobSummary = {
    id: string;
    title: string | null;
    status: string;
    client_name?: string | null;
    expected_delivery: string | null;
};

type AttentionItem = {
    label: string;
    count: number;
    status: string;
    color: string;
};

export default function DashboardHome() {
    const router = useRouter();
    const [designer, setDesigner] = useState<Designer | null>(null);
    const [jobs, setJobs] = useState<JobSummary[]>([]);
    const [attention, setAttention] = useState<AttentionItem[]>([]);
    const [loading, setLoading] = useState(true);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const [{ data: designerData }, { data: jobsData }] = await Promise.all([
                supabase
                    .from("designers")
                    .select("brand_name")
                    .eq("id", user.id)
                    .single(),
                supabase
                    .from("jobs")
                    .select("id, title, status, expected_delivery")
                    .eq("designer_id", user.id)
                    .not("status", "eq", "delivered")
                    .order("created_at", { ascending: false }),
            ]);

            setDesigner(designerData);

            const jobList = jobsData ?? [];

            // Build attention items
            const statusCounts = jobList.reduce((acc: Record<string, number>, job) => {
                acc[job.status] = (acc[job.status] ?? 0) + 1;
                return acc;
            }, {});

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split("T")[0];

            const dueTomorrow = jobList.filter(
                (j) => j.expected_delivery === tomorrowStr
            ).length;

            const attentionItems: AttentionItem[] = [];

            if (statusCounts["measurement_pending"] > 0) {
                attentionItems.push({
                    label: "Awaiting Measurement",
                    count: statusCounts["measurement_pending"],
                    status: "measurement_pending",
                    color: "bg-blue-50 text-blue-700 border-blue-100",
                });
            }
            if (statusCounts["awaiting_deposit"] > 0) {
                attentionItems.push({
                    label: "Awaiting Deposit",
                    count: statusCounts["awaiting_deposit"],
                    status: "awaiting_deposit",
                    color: "bg-amber-50 text-amber-700 border-amber-100",
                });
            }
            if (dueTomorrow > 0) {
                attentionItems.push({
                    label: "Due Tomorrow",
                    count: dueTomorrow,
                    status: "due_tomorrow",
                    color: "bg-red-50 text-red-700 border-red-100",
                });
            }
            if (statusCounts["ready"] > 0) {
                attentionItems.push({
                    label: "Ready for Delivery",
                    count: statusCounts["ready"],
                    status: "ready",
                    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
                });
            }

            setAttention(attentionItems);
            setJobs(jobList.slice(0, 5));
            setLoading(false);
        };

        load();
    }, [router]);

    const STATUS_LABELS: Record<string, string> = {
        inquiry: "Inquiry",
        measurement_pending: "Measurement Pending",
        measurement_done: "Measurement Done",
        awaiting_deposit: "Awaiting Deposit",
        deposit_paid: "Deposit Paid",
        cutting: "Cutting",
        sewing: "Sewing",
        finishing: "Finishing",
        quality_check: "Quality Check",
        ready: "Ready for Delivery",
        delivered: "Delivered",
    };

    const STATUS_COLORS: Record<string, string> = {
        inquiry: "bg-gray-100 text-gray-600",
        measurement_pending: "bg-blue-100 text-blue-700",
        measurement_done: "bg-blue-100 text-blue-700",
        awaiting_deposit: "bg-amber-100 text-amber-700",
        deposit_paid: "bg-emerald-100 text-emerald-700",
        cutting: "bg-purple-100 text-purple-700",
        sewing: "bg-purple-100 text-purple-700",
        finishing: "bg-purple-100 text-purple-700",
        quality_check: "bg-orange-100 text-orange-700",
        ready: "bg-emerald-100 text-emerald-700",
        delivered: "bg-gray-100 text-gray-500",
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="bg-white px-5 pt-12 pb-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-gray-400">{today}</p>
                        <h1 className="mt-0.5 text-xl font-bold text-gray-900">
                            {greeting()},{" "}
                            {designer?.brand_name?.split(" ")[0] ?? "Designer"} 👋
                        </h1>
                    </div>
                    <button className="relative mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white">
                        <Bell size={16} className="text-gray-500" />
                    </button>
                </div>
            </header>

            <div className="px-5 py-4 space-y-5">

                {/* NEEDS ATTENTION */}
                {attention.length > 0 && (
                    <section>
                        <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Needs Attention
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                            {attention.map((item) => (
                                <Link
                                    key={item.status}
                                    href={`/designer-dashboard/jobs?status=${item.status}`}
                                    className={`flex flex-col rounded-xl border p-3.5 ${item.color}`}
                                >
                                    <span className="text-2xl font-bold">{item.count}</span>
                                    <span className="mt-1 text-xs font-medium leading-tight">
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* QUICK ACTIONS */}
                <section>
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Quick Actions
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                        <Link
                            href="/designer-dashboard/jobs/new"
                            className="flex items-center gap-3 rounded-xl bg-gray-900 p-4 text-white"
                        >
                            <Plus size={18} />
                            <div>
                                <p className="text-sm font-semibold">New Job</p>
                                <p className="text-xs text-gray-400">Create a client job</p>
                            </div>
                        </Link>

                        <Link
                            href="/designer-dashboard/measurements"
                            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4"
                        >
                            <Ruler size={18} className="text-emerald-600" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Measure</p>
                                <p className="text-xs text-gray-400">Send AI link</p>
                            </div>
                        </Link>

                        <Link
                            href="/designer-dashboard/style-library"
                            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4"
                        >
                            <Images size={18} className="text-emerald-600" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Style Library</p>
                                <p className="text-xs text-gray-400">Browse styles</p>
                            </div>
                        </Link>

                        <Link
                            href="/designer-dashboard/store"
                            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4"
                        >
                            <FileText size={18} className="text-emerald-600" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">My Store</p>
                                <p className="text-xs text-gray-400">View storefront</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* ACTIVE JOBS */}
                <section>
                    <div className="mb-2.5 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Active Jobs
                        </p>
                        <Link
                            href="/designer-dashboard/jobs"
                            className="text-xs font-medium text-emerald-600"
                        >
                            View all
                        </Link>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
                            <p className="text-sm font-medium text-gray-700">No active jobs yet</p>
                            <p className="mt-1 text-xs text-gray-400">
                                Create your first job to get started
                            </p>
                            <Link
                                href="/designer-dashboard/jobs/new"
                                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white"
                            >
                                <Plus size={14} /> New Job
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {jobs.map((job) => (
                                <Link
                                    key={job.id}
                                    href={`/designer-dashboard/jobs/${job.id}`}
                                    className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
                                >
                                    {/* Status indicator */}
                                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />

                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {job.title ?? "Untitled Job"}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600"
                                                }`}>
                                                {STATUS_LABELS[job.status] ?? job.status}
                                            </span>
                                            {job.expected_delivery && (
                                                <span className="text-[10px] text-gray-400">
                                                    Due {new Date(job.expected_delivery).toLocaleDateString("en-NG", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronRight size={16} className="flex-shrink-0 text-gray-300" />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <BottomNav />
        </main>
    );
}