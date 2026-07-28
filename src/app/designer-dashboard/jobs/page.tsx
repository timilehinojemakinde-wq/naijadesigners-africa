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
    client_name: string | null;
    client_title: string | null;
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
    measurement_pending: "bg-sky-100 text-sky-700",
    measurement_done: "bg-teal-100 text-teal-700",
    awaiting_deposit: "bg-amber-100 text-amber-700",
    deposit_paid: "bg-green-100 text-green-700",
    cutting: "bg-indigo-100 text-indigo-700",
    sewing: "bg-violet-100 text-violet-700",
    finishing: "bg-purple-100 text-purple-700",
    quality_check: "bg-orange-100 text-orange-700",
    ready: "bg-emerald-100 text-emerald-700",
    delivered: "bg-slate-100 text-slate-500",
};

const FILTERS = [
    { label: "All", value: "all" },
    { label: "Inquiry", value: "inquiry" },
    { label: "Measuring", value: "measurement_pending" },
    { label: "Production", value: "sewing" },
    { label: "Ready", value: "ready" },
    { label: "Delivered", value: "delivered" },
];

const titleCase = (str: string | null | undefined) =>
    (str ?? "").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

function JobsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusParam = searchParams.get("status") ?? "all";

    const [jobs, setJobs] = useState<Job[]>([]);
    const [filtered, setFiltered] = useState<Job[]>([]);
    const [activeFilter, setActiveFilter] = useState(statusParam);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [financials, setFinancials] = useState({ earned: 0, outstanding: 0, currency: "NGN" });
    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data } = await supabase
                .from("jobs")
                .select("id, title, status, expected_delivery, created_at, client_id, clients(full_name, title)")
                .eq("designer_id", user.id)
                .order("created_at", { ascending: false });

            const mapped = (data ?? []).map((j: any) => ({
                ...j,
                client_name: j.clients?.full_name ?? null,
                client_title: j.clients?.title ?? null,
            }));
            setJobs(mapped);
            const jobIds = mapped.map((j: any) => j.id);
            if (jobIds.length > 0) {
                const { data: invData } = await supabase
                    .from("invoices")
                    .select("deposit_paid, balance, currency")
                    .in("job_id", jobIds);

                const earned = invData?.reduce((sum, inv) => sum + (inv.deposit_paid || 0), 0) ?? 0;
                const outstanding = invData?.reduce((sum, inv) => sum + (inv.balance || 0), 0) ?? 0;
                const currency = invData?.[0]?.currency ?? "NGN";
                setFinancials({ earned, outstanding, currency });
            }
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
            {/* FINANCIALS */}
            <div className="px-5 pt-3">
                <div className="flex gap-3">
                    <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                            Total Earned
                        </p>
                        <p className="mt-1.5 text-lg font-bold text-emerald-600">
                            {financials.currency} {financials.earned.toLocaleString()}
                        </p>
                    </div>
                    <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                            Outstanding
                        </p>
                        <p className="mt-1.5 text-lg font-bold text-amber-600">
                            {financials.currency} {financials.outstanding.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
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
                                    {[job.client_title, job.client_name].filter(Boolean).map(titleCase).join(" ") ?? "Unknown Client"}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-gray-500">
                                    {job.title ? titleCase(job.title) : "Untitled Job"}
                                </p>
                                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600"
                                        }`}>
                                        {STATUS_LABELS[job.status] ?? job.status}
                                    </span>
                                    {job.expected_delivery && (
                                        <span className={`text-[10px] font-semibold ${(() => {
                                            const days = Math.ceil((new Date(job.expected_delivery).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                            if (days < 0) return "text-red-500";
                                            if (days <= 2) return "text-orange-500";
                                            return "text-gray-400";
                                        })()}`}>
                                            {(() => {
                                                const days = Math.ceil((new Date(job.expected_delivery).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                                if (days < 0) return `${Math.abs(days)}d overdue`;
                                                if (days === 0) return "Due today";
                                                if (days === 1) return "Tomorrow";
                                                return `${days} days left`;
                                            })()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight size={16} className="flex-shrink-0 text-gray-300" />
                        </Link>
                    ))
                )
                }
            </div >

            <BottomNav />
        </main >
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