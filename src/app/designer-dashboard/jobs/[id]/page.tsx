"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Phone, MessageCircle,
    ChevronRight, Send, Copy, Check,
    Ruler, FileText, ChevronDown
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Job = {
    id: string;
    job_number: string | null;
    title: string | null;
    status: string;
    style_images: string[] | null;
    style_notes: string | null;
    expected_delivery: string | null;
    tracking_token: string | null;
    measurement_token: string | null;
    created_at: string;
    client_id: string | null;
};

type Client = {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
};

type JobUpdate = {
    id: string;
    status: string;
    note: string | null;
    created_at: string;
};

const PIPELINE = [
    { value: "inquiry", label: "Inquiry" },
    { value: "measurement_pending", label: "Measurement Pending" },
    { value: "measurement_done", label: "Measurement Done" },
    { value: "awaiting_deposit", label: "Awaiting Deposit" },
    { value: "deposit_paid", label: "Deposit Paid" },
    { value: "cutting", label: "Cutting" },
    { value: "sewing", label: "Sewing" },
    { value: "finishing", label: "Finishing" },
    { value: "quality_check", label: "Quality Check" },
    { value: "ready", label: "Ready for Delivery" },
    { value: "delivered", label: "Delivered" },
];

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


const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-600" },
    sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
    deposit_paid: { label: "Deposit Paid", color: "bg-amber-100 text-amber-700" },
    fully_paid: { label: "Fully Paid", color: "bg-emerald-100 text-emerald-700" },
};
export default function JobDetailPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [measurement, setMeasurement] = useState<any>(null);
    const [job, setJob] = useState<Job | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [invoice, setInvoice] = useState<{
        id: string;
        status: string;
        subtotal: number;
        deposit_required: number;
        deposit_paid: number;
        balance: number;
        currency: string;
    } | null>(null);

    const [updates, setUpdates] = useState<JobUpdate[]>([]);
    const [activeImage, setActiveImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [showPipeline, setShowPipeline] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data: jobData } = await supabase
                .from("jobs")
                .select("*")
                .eq("id", jobId)
                .eq("designer_id", user.id)
                .single();

            if (!jobData) { router.push("/designer-dashboard/jobs"); return; }

            setJob(jobData);

            const { data: measurementData } = await supabase
                .from("measurements")
                .select("*")
                .eq("client_id", jobData.client_id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            setMeasurement(measurementData);


            const [{ data: clientData }, { data: updatesData }, { data: invoiceData }] =
                await Promise.all([
                    jobData.client_id
                        ? supabase
                            .from("clients")
                            .select("*")
                            .eq("id", jobData.client_id)
                            .single()
                        : { data: null },

                    supabase
                        .from("job_updates")
                        .select("*")
                        .eq("job_id", jobId)
                        .order("created_at", { ascending: false }),

                    supabase
                        .from("invoices")
                        .select(`
    id,
    status,
    subtotal,
    deposit_required,
    deposit_paid,
    balance,
    currency
`)
                        .eq("job_id", jobId)
                        .maybeSingle(),
                ]);

            setClient(clientData);
            setUpdates(updatesData ?? []);
            setInvoice(invoiceData);
            setLoading(false);
        };

        load();
    }, [jobId, router]);

    const updateStatus = async (newStatus: string) => {
        if (!job) return;
        setStatusUpdating(true);
        setShowPipeline(false);

        const { error } = await supabase
            .from("jobs")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", job.id);

        if (!error) {
            await supabase.from("job_updates").insert({
                job_id: job.id,
                status: newStatus,
                note: `Status updated to ${PIPELINE.find(p => p.value === newStatus)?.label}`,
                notify_client: true,
            });

            setJob((prev) => prev ? { ...prev, status: newStatus } : prev);
            const { data: newUpdates } = await supabase
                .from("job_updates")
                .select("*")
                .eq("job_id", jobId)
                .order("created_at", { ascending: false });
            setUpdates(newUpdates ?? []);
        }

        setStatusUpdating(false);
    };

    const copyTrackingLink = async () => {
        if (!job?.tracking_token) return;
        const url = `${window.location.origin}/track/${job.tracking_token}`;  // ← /track/ not /measure/
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareTrackingLink = () => {
        if (!client?.phone || !job?.tracking_token) return;
        const url = `${window.location.origin}/track/${job.tracking_token}`;
        const message = `Hi ${client.full_name}, here's your order tracking link for ${job.title}: ${url}`;
        const phone = client.phone.replace(/\D/g, "");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    };

    const shareMeasurementLink = () => {
        if (!client?.phone || !job?.measurement_token) return;
        const url = `${window.location.origin}/measure/${job.measurement_token}`;
        const message = `Hi ${client.full_name}, please click this link to take your measurements for your ${job.title} order. It only takes 60 seconds: ${url}`;
        const phone = client.phone.replace(/\D/g, "");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    };
    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    if (!job) return null;

    const currentPipelineIndex = PIPELINE.findIndex(p => p.value === job.status);
    const images = job.style_images ?? [];

    return (
        <main className="min-h-screen bg-gray-50 pb-32">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/designer-dashboard/jobs"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                {job.job_number ?? "JOB"}
                            </p>
                            <h1 className="text-base font-bold text-gray-900">
                                {job.title ?? "Untitled Job"}
                            </h1>
                        </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {PIPELINE.find(p => p.value === job.status)?.label ?? job.status}
                    </span>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-4">

                {/* STYLE IMAGES */}
                {images.length > 0 && (
                    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                            <img
                                src={images[activeImage]}
                                alt="Style reference"
                                className="h-full w-full object-cover"
                            />
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto p-3">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${i === activeImage ? "border-gray-900" : "border-transparent"}`}
                                    >
                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* CUSTOMER NOTES */}
                {job.style_notes && (
                    <section className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-amber-600">
                            Customer Instructions
                        </p>
                        <p className="text-sm leading-relaxed text-amber-900">
                            {job.style_notes}
                        </p>
                    </section>
                )}

                {/* PRODUCTION PIPELINE */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">Production Status</h2>
                        <button
                            onClick={() => setShowPipeline(!showPipeline)}
                            className="flex items-center gap-1 text-xs font-medium text-emerald-600"
                        >
                            Update <ChevronDown size={14} className={`transition ${showPipeline ? "rotate-180" : ""}`} />
                        </button>
                    </div>

                    {/* Pipeline visual */}
                    <div className="space-y-2">
                        {PIPELINE.map((stage, i) => {
                            const isDone = i < currentPipelineIndex;
                            const isCurrent = i === currentPipelineIndex;

                            return (
                                <div key={stage.value} className="flex items-center gap-3">
                                    <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isDone
                                        ? "bg-emerald-600 text-white"
                                        : isCurrent
                                            ? "border-2 border-gray-900 bg-white"
                                            : "border border-gray-200 bg-gray-50"
                                        }`}>
                                        {isDone ? <Check size={10} strokeWidth={3} /> : null}
                                        {isCurrent ? <div className="h-2 w-2 rounded-full bg-gray-900" /> : null}
                                    </div>
                                    <span className={`text-xs ${isCurrent ? "font-semibold text-gray-900" :
                                        isDone ? "text-gray-400 line-through" :
                                            "text-gray-400"
                                        }`}>
                                        {stage.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Status picker */}
                    {showPipeline && (
                        <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4">
                            <p className="mb-2 text-xs font-semibold text-gray-500">
                                Move to:
                            </p>
                            {PIPELINE.filter(p => p.value !== job.status).map((stage) => (
                                <button
                                    key={stage.value}
                                    onClick={() => updateStatus(stage.value)}
                                    disabled={statusUpdating}
                                    className="flex w-full items-center justify-between rounded-xl border border-gray-100 px-3.5 py-2.5 text-sm hover:border-gray-900 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {stage.label}
                                    <ChevronRight size={14} className="text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* CLIENT */}
                {client && (
                    <section className="rounded-2xl bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-sm font-bold text-gray-900">Customer</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                                {client.full_name[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">{client.full_name}</p>
                                {client.phone && (
                                    <p className="text-xs text-gray-400">{client.phone}</p>
                                )}
                            </div>
                        </div>

                        {client.phone && (

                            <div className="mt-3 flex gap-2">
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
                )}

                {/* MEASUREMENTS */}
                {/* MEASUREMENTS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900">
                            Measurements
                        </h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${measurement
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                            }`}>
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
                                if (!value) return null;
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
                        <div>
                            <p className="text-xs text-gray-400">
                                No measurements on file for this client yet.
                            </p>

                            <button
                                onClick={shareMeasurementLink}
                                disabled={!client?.phone}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Ruler size={14} />
                                Send AI Measurement Link
                            </button>
                        </div>
                    )}
                </section>

                {/* INVOICE */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">Invoice</h2>
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${invoice
                                ? STATUS_COLORS[invoice.status] ?? "bg-gray-100 text-gray-600"
                                : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            {invoice
                                ? STATUS_CONFIG[invoice.status]?.label ?? invoice.status
                                : "Not created"}
                        </span>
                    </div>
                    <div className="mt-3">
                        {invoice ? (
                            <div className="space-y-2 rounded-xl bg-gray-50 p-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-semibold">
                                        {invoice.currency} {invoice.subtotal.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Deposit Paid</span>
                                    <span className="font-semibold text-emerald-600">
                                        {invoice.currency} {invoice.deposit_paid.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
                                    <span className="font-medium text-gray-700">Balance</span>
                                    <span className="font-bold text-red-600">
                                        {invoice.currency} {invoice.balance.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">
                                No invoice yet. Generate one when price is agreed.
                            </p>
                        )}
                    </div>
                    <Link
                        href={`/designer-dashboard/jobs/${job.id}/invoice`}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700"
                    >
                        <FileText size={14} />
                        {invoice ? "View / Edit Invoice" : "Generate Invoice"}
                    </Link>
                </section>

                {/* DELIVERY */}
                {job.expected_delivery && (
                    <section className="rounded-2xl bg-white p-5 shadow-sm">
                        <h2 className="mb-1 text-sm font-bold text-gray-900">Delivery Date</h2>
                        <p className="text-sm text-gray-600">
                            {new Date(job.expected_delivery).toLocaleDateString("en-NG", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </section>
                )}

                {/* TIMELINE */}
                {updates.length > 0 && (
                    <section className="rounded-2xl bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-sm font-bold text-gray-900">Timeline</h2>
                        <div className="space-y-4">
                            {updates.map((update, i) => (
                                <div key={update.id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500 mt-1" />
                                        {i < updates.length - 1 && (
                                            <div className="mt-1 w-px flex-1 bg-gray-100 min-h-[20px]" />
                                        )}
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-xs font-semibold text-gray-900">
                                            {update.note ?? PIPELINE.find(p => p.value === update.status)?.label}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-gray-400">
                                            {new Date(update.created_at).toLocaleDateString("en-NG", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>

            {/* STICKY BOTTOM ACTIONS */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white px-5 py-3">
                <div className="mx-auto flex max-w-md gap-2">
                    <button
                        onClick={shareTrackingLink}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-xs font-semibold text-white"
                    >
                        <Send size={14} />
                        Share Tracking Link
                    </button>
                    <button
                        onClick={copyTrackingLink}
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-xs font-semibold text-gray-700"
                    >
                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        </main>
    );
}