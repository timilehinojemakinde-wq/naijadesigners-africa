"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus, Ruler, Images, Store,
    ChevronRight, Bell, User,
    AlertCircle, Clock, CheckCircle,
    Briefcase
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import BottomNav from "@/components/dashboard/BottomNav";

type Designer = {
    brand_name: string | null;
    profile_image: string | null;
};

type Job = {
    id: string;
    title: string | null;
    status: string;
    expected_delivery: string | null;
    client_id: string | null;
};

type ClientMap = Record<
    string,
    {
        title: string | null;
        full_name: string;
    }
>;

const STATUS_LABELS: Record<string, string> = {
    inquiry: "Inquiry",
    measurement_pending: "Awaiting Measurement",
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

const PIPELINE_STAGES = [
    { value: "inquiry", label: "Inquiry" },
    { value: "measurement_pending", label: "Measuring" },
    { value: "cutting", label: "Cutting" },
    { value: "sewing", label: "Sewing" },
    { value: "finishing", label: "Finishing" },
    { value: "ready", label: "Ready" },
];

export default function DashboardHome() {
    const router = useRouter();
    const [designer, setDesigner] = useState<Designer | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [clientMap, setClientMap] = useState<ClientMap>({});
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
                    .select("brand_name, profile_image")
                    .eq("id", user.id)
                    .single(),
                supabase
                    .from("jobs")
                    .select("id, title, status, expected_delivery, client_id")
                    .eq("designer_id", user.id)
                    .not("status", "eq", "delivered")
                    .order("created_at", { ascending: false }),
            ]);

            setDesigner(designerData);

            const allJobs = jobsData ?? [];
            setJobs(allJobs);

            // Fetch client names
            const clientIds = [...new Set(
                allJobs
                    .map(j => j.client_id)
                    .filter(Boolean) as string[]
            )];

            if (clientIds.length > 0) {
                const { data: clientsData } = await supabase
                    .from("clients")
                    .select("id, title, full_name")
                    .in("id", clientIds);

                const map: ClientMap = {};

                (clientsData ?? []).forEach((c) => {
                    map[c.id] = {
                        title: c.title,
                        full_name: c.full_name,
                    };
                });
                setClientMap(map);
            }

            setLoading(false);
        };

        load();
    }, [router]);

    // Derived attention data
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const awaitingMeasurement = jobs.filter(j =>
        j.status === "measurement_pending"
    );
    const awaitingDeposit = jobs.filter(j =>
        j.status === "awaiting_deposit"
    );
    const dueTomorrow = jobs.filter(j =>
        j.expected_delivery === tomorrowStr
    );
    const readyForDelivery = jobs.filter(j =>
        j.status === "ready"
    );

    const needsAttention = [
        ...awaitingMeasurement,
        ...awaitingDeposit,
        ...dueTomorrow,
        ...readyForDelivery,
    ];

    // Pipeline counts
    const pipelineCounts = PIPELINE_STAGES.map(stage => ({
        ...stage,
        count: jobs.filter(j => j.status === stage.value).length,
    })).filter(s => s.count > 0);

    // Recent active jobs
    const recentJobs = jobs.slice(0, 5);

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
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400">{today}</p>
                        <h1 className="mt-0.5 text-xl font-bold text-gray-900 truncate">
                            {greeting()},{" "}
                            {designer?.brand_name?.split(" ")[0] ?? "Designer"} 👋
                        </h1>
                        <p className="mt-0.5 text-xs text-gray-400">
                            {jobs.length} active job{jobs.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white">
                            <Bell size={16} className="text-gray-500" />
                        </button>
                        <Link
                            href="/designer-dashboard/profile"
                            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-emerald-100"
                        >
                            {designer?.profile_image ? (
                                <img
                                    src={designer.profile_image}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <User size={16} className="text-emerald-700" />
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <div className="px-5 py-4 space-y-6">

                {/* NEEDS ATTENTION */}
                {needsAttention.length > 0 && (
                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <AlertCircle size={14} className="text-amber-500" />
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                Needs Attention
                            </p>
                        </div>

                        <div className="space-y-2">
                            {awaitingMeasurement.length > 0 && (
                                <Link
                                    href="/designer-dashboard/jobs?status=measurement_pending"
                                    className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <Ruler size={16} className="text-blue-600" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-800">
                                                {awaitingMeasurement.length} awaiting measurement
                                            </p>
                                            <p className="text-xs text-blue-500">
                                                Send AI measurement links
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-blue-400" />
                                </Link>
                            )}

                            {awaitingDeposit.length > 0 && (
                                <Link
                                    href="/designer-dashboard/jobs?status=awaiting_deposit"
                                    className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertCircle size={16} className="text-amber-600" />
                                        <div>
                                            <p className="text-sm font-semibold text-amber-800">
                                                {awaitingDeposit.length} awaiting deposit
                                            </p>
                                            <p className="text-xs text-amber-500">
                                                Send invoices to collect payment
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-amber-400" />
                                </Link>
                            )}

                            {dueTomorrow.length > 0 && (
                                <Link
                                    href="/designer-dashboard/jobs"
                                    className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className="text-red-500" />
                                        <div>
                                            <p className="text-sm font-semibold text-red-700">
                                                {dueTomorrow.length} due tomorrow
                                            </p>
                                            <p className="text-xs text-red-400">
                                                {dueTomorrow.map(j => j.title).join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-red-300" />
                                </Link>
                            )}

                            {readyForDelivery.length > 0 && (
                                <Link
                                    href="/designer-dashboard/jobs?status=ready"
                                    className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle size={16} className="text-emerald-600" />
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-800">
                                                {readyForDelivery.length} ready for delivery
                                            </p>
                                            <p className="text-xs text-emerald-500">
                                                Notify customers to collect
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-emerald-400" />
                                </Link>
                            )}
                        </div>
                    </section>
                )}

                {/* QUICK ACTIONS */}
                <section>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                        Quick Actions
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/designer-dashboard/jobs/new"
                            className="flex items-center gap-3 rounded-2xl bg-gray-900 p-4 text-white"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                                <Plus size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">New Job</p>
                                <p className="text-xs text-gray-400">
                                    Add client job
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/designer-dashboard/style-library"
                            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                <Images size={16} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Style Library
                                </p>
                                <p className="text-xs text-gray-400">
                                    Share catalogue
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/designer-dashboard/clients"
                            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                <Ruler size={16} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Clients
                                </p>
                                <p className="text-xs text-gray-400">
                                    Measurements
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/designer-dashboard/store"
                            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                <Store size={16} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    My Store
                                </p>
                                <p className="text-xs text-gray-400">
                                    Public storefront
                                </p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* PRODUCTION PIPELINE */}
                {pipelineCounts.length > 0 && (
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Production Pipeline
                            </p>
                            <Link
                                href="/designer-dashboard/jobs"
                                className="text-xs font-medium text-emerald-600"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <div className="space-y-3">
                                {pipelineCounts.map((stage) => (
                                    <Link
                                        key={stage.value}
                                        href={`/designer-dashboard/jobs?status=${stage.value}`}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-24 flex-shrink-0">
                                            <p className="truncate text-xs text-gray-500">
                                                {stage.label}
                                            </p>
                                        </div>
                                        <div className="flex flex-1 items-center gap-2">
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            (stage.count / Math.max(...pipelineCounts.map(s => s.count))) * 100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="w-4 flex-shrink-0 text-right text-xs font-semibold text-gray-900">
                                                {stage.count}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ACTIVE JOBS */}
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Briefcase size={14} className="text-gray-400" />
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Active Jobs
                            </p>
                        </div>
                        <Link
                            href="/designer-dashboard/jobs"
                            className="text-xs font-medium text-emerald-600"
                        >
                            View all
                        </Link>
                    </div>

                    {recentJobs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                                <Briefcase size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">
                                No active jobs
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Create your first job to get started
                            </p>
                            <Link
                                href="/designer-dashboard/jobs/new"
                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white"
                            >
                                <Plus size={13} /> New Job
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentJobs.map((job) => {
                                const client = job.client_id
                                    ? clientMap[job.client_id]
                                    : null;

                                return (
                                    <Link
                                        key={job.id}
                                        href={`/designer-dashboard/jobs/${job.id}`}
                                        className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
                                    >
                                        {/* STATUS DOT */}
                                        <div className={`h-2 w-2 flex-shrink-0 rounded-full ${job.status === "ready"
                                            ? "bg-emerald-500"
                                            : job.status === "awaiting_deposit"
                                                ? "bg-amber-400"
                                                : job.status === "measurement_pending"
                                                    ? "bg-blue-400"
                                                    : "bg-gray-300"
                                            }`} />

                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                {job.title ?? "Untitled Job"}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                {client && (
                                                    <span className="truncate text-xs text-gray-400">
                                                        {client.title ? `${client.title} ` : ""}
                                                        {client.full_name}
                                                    </span>
                                                )}
                                                {client && job.expected_delivery && (
                                                    <span className="text-xs text-gray-300">·</span>
                                                )}
                                                {job.expected_delivery && (
                                                    <span className="text-xs text-gray-400">
                                                        Due{" "}
                                                        {new Date(job.expected_delivery).toLocaleDateString("en-NG", {
                                                            day: "numeric",
                                                            month: "short",
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-shrink-0 items-center gap-2">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600"
                                                }`}>
                                                {STATUS_LABELS[job.status] ?? job.status}
                                            </span>
                                            <ChevronRight size={14} className="text-gray-300" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            <BottomNav />
        </main>
    );
}