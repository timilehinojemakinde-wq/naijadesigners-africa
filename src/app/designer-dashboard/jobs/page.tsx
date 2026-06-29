"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, Search, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import BottomNav from "@/components/dashboard/BottomNav";

type Job = {
    id: string;
    title: string | null;
    status: string;
    expected_delivery: string | null;
    created_at: string;
    client_id: string | null;
};

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

const FILTERS = [
    { label: "All", value: "all" },
    { label: "Inquiry", value: "inquiry" },
    { label: "Measuring", value: "measurement_pending" },
    { label: "Production", value: "sewing" },
    { label: "Ready", value: "ready" },
    { label: "Delivered", value: "delivered" },
];

function JobsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusParam = searchParams.get("status") ?? "all";

    const [jobs, setJobs] = useState<Job[]>([]);
    const [filtered, setFiltered] = useState<Job[]>([]);
    const [activeFilter, setActiveFilter] = useState(statusParam);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data } = await supabase
                .from("jobs")
                .select("id, title, status, expected_delivery, created_at, client_id")
                .eq("designer_id", user.id)
                .order("created_at", { ascending: false });

            setJobs(data ?? []);
            setLoading(false);
        };

        load();
    }, [router]);

    useEffect(() => {
        let result = jobs;

        if (activeFilter !== "all") {
            result = result.filter((j) => j.status === activeFilter);
        }

        if (search.trim()) {
            result = result.filter((j) =>
                j.title?.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFiltered(result);
    }, [jobs, activeFilter, search]);

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="bg-white px-5 pt-12 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jobs</h1>
                        <p className="mt-0.5 text-xs text-gray-400">
                            {jobs.filter(j => j.status !== "delivered").length} active
                        </p>
                    </div>
                    <Link
                        href="/designer-dashboard/jobs/new"
                        className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus size={16} />
                        New Job
                    </Link>
                </div>

                {/* SEARCH */}
                <div className="relative mt-4">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search jobs..."
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-gray-900 focus:bg-white"
                    />
                </div>
            </header>

            {/* FILTERS */}
            <div className="flex gap-2 overflow-x-auto px-5 py-3 pb-1">
                {FILTERS.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setActiveFilter(filter.value)}
                        className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${activeFilter === filter.value
                            ? "bg-gray-900 text-white"
                            : "border border-gray-200 bg-white text-gray-600"
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* JOBS LIST */}
            <div className="px-5 py-3 space-y-2">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
                        <p className="text-sm font-medium text-gray-700">
                            {search ? "No jobs match your search" : "No jobs yet"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            {!search && "Create your first job to start managing client work"}
                        </p>
                        {!search && (
                            <Link
                                href="/designer-dashboard/jobs/new"
                                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white"
                            >
                                <Plus size={14} /> New Job
                            </Link>
                        )}
                    </div>
                ) : (
                    filtered.map((job) => (
                        <Link
                            key={job.id}
                            href={`/designer-dashboard/jobs/${job.id}`}
                            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {job.title ?? "Untitled Job"}
                                </p>
                                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600"
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
                    ))
                )}
            </div>

            <BottomNav />
        </main>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        }>
            <JobsContent />
        </Suspense>
    );
}