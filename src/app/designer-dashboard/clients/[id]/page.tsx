"use client";


import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Phone, MessageCircle,
    ChevronRight, Plus, Ruler
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Client = {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    created_at: string;
};

type Job = {
    id: string;
    title: string | null;
    status: string;
    expected_delivery: string | null;
    created_at: string;
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

export default function ClientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const clientId = params.id as string;

    const [client, setClient] = useState<Client | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [measurement, setMeasurement] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const [{ data: clientData }, { data: jobsData }] = await Promise.all([
                supabase
                    .from("clients")
                    .select("*")
                    .eq("id", clientId)
                    .eq("designer_id", user.id)
                    .single(),
                supabase
                    .from("jobs")
                    .select("id, title, status, expected_delivery, created_at")
                    .eq("client_id", clientId)
                    .order("created_at", { ascending: false }),
            ]);

            if (!clientData) {
                router.push("/designer-dashboard/clients");
                return;
            }

            const { data: measurementData } = await supabase
                .from("measurements")
                .select("*")
                .eq("client_id", clientId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            setClient(clientData);
            setJobs(jobsData ?? []);
            setLoading(false);
        };

        load();
    }, [clientId, router]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    if (!client) return null;

    const activeJobs = jobs.filter(j => j.status !== "delivered");
    const completedJobs = jobs.filter(j => j.status === "delivered");

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="bg-white px-5 pt-12 pb-5">
                <div className="flex items-center gap-3">
                    <Link
                        href="/designer-dashboard/clients"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Client Profile</h1>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-2">

                {/* CLIENT CARD */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
                            {client.full_name[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {client.full_name}
                            </h2>
                            <p className="mt-0.5 text-xs text-gray-400">
                                Client since{" "}
                                {new Date(client.created_at).toLocaleDateString("en-NG", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-gray-50 p-3 text-center">
                            <p className="text-lg font-bold text-gray-900">{jobs.length}</p>
                            <p className="text-[10px] text-gray-400">Total Jobs</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3 text-center">
                            <p className="text-lg font-bold text-gray-900">{activeJobs.length}</p>
                            <p className="text-[10px] text-gray-400">Active</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3 text-center">
                            <p className="text-lg font-bold text-gray-900">{completedJobs.length}</p>
                            <p className="text-[10px] text-gray-400">Completed</p>
                        </div>
                    </div>

                    {/* CONTACT */}
                    {client.phone && (
                        <div className="mt-4 flex gap-2">
                            <a
                                href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white"
                            >
                                <MessageCircle size={14} />
                                WhatsApp
                            </a>

                            <a
                                href={`tel:${client.phone}`}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700"
                            >
                                <Phone size={14} />
                                Call
                            </a>
                        </div>
                    )}
                </section>

                {/* CONTACT DETAILS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold text-gray-900">
                        Contact Details
                    </h3>
                    <div className="space-y-2.5">
                        {client.phone && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Phone</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {client.phone}
                                </span>
                            </div>
                        )}
                        {client.email && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Email</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {client.email}
                                </span>
                            </div>
                        )}
                        {client.address && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Address</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {client.address}
                                </span>
                            </div>
                        )}
                        {!client.phone && !client.email && !client.address && (
                            <p className="text-sm text-gray-400">No contact details saved.</p>
                        )}
                    </div>
                </section>

                {/* MEASUREMENTS */}
                {/* MEASUREMENTS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">
                            Measurements
                        </h3>

                        <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${measurement
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            {measurement ? "On File" : "Not recorded"}
                        </span>
                    </div>

                    {measurement ? (
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { key: "height", label: "Height" },
                                { key: "bust", label: "Bust" },
                                { key: "waist", label: "Waist" },
                                { key: "hips", label: "Hips" },
                                { key: "shoulder_width", label: "Shoulder" },
                                { key: "sleeve_length", label: "Sleeve" },
                                { key: "chest", label: "Chest" },
                                { key: "neck", label: "Neck" },
                                { key: "inseam", label: "Inseam" },
                                { key: "thigh", label: "Thigh" },
                            ].map(({ key, label }) => {
                                const value = measurement[key];

                                if (value === null || value === undefined || value === "") {
                                    return null;
                                }

                                return (
                                    <div key={key} className="rounded-xl bg-gray-50 px-3 py-2">
                                        <p className="text-[10px] text-gray-400">{label}</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {Number(value).toFixed(1)} cm
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">
                            No measurements on file for this client yet. Measurements are
                            collected automatically when you send a link from a job.
                        </p>
                    )}
                </section>

                {/* JOBS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">
                            Jobs ({jobs.length})
                        </h3>
                        <Link
                            href="/designer-dashboard/jobs/new"
                            className="flex items-center gap-1 text-xs font-semibold text-emerald-600"
                        >
                            <Plus size={13} /> New Job
                        </Link>
                    </div>

                    {jobs.length === 0 ? (
                        <p className="text-sm text-gray-400">No jobs yet for this client.</p>
                    ) : (
                        <div className="space-y-2">
                            {jobs.map((job) => (
                                <Link
                                    key={job.id}
                                    href={`/designer-dashboard/jobs/${job.id}`}
                                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {job.title ?? "Untitled Job"}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600"
                                                }`}>
                                                {STATUS_LABELS[job.status] ?? job.status}
                                            </span>
                                            {job.expected_delivery && (
                                                <span className="text-[10px] text-gray-400">
                                                    Due{" "}
                                                    {new Date(job.expected_delivery).toLocaleDateString("en-NG", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-300" />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* NEW JOB FOR THIS CLIENT */}
                <Link
                    href="/designer-dashboard/jobs/new"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white"
                >
                    <Plus size={16} />
                    Create New Job for {client.full_name.split(" ")[0]}
                </Link>
            </div >
        </main >
    );
}