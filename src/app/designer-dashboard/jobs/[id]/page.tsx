"use client";

import PremiumVoicePlayer from "@/components/audio/PremiumVoicePlayer";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    ChevronRight,
    Send,
    Copy,
    Check,
    Ruler,
    FileText,
    ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Job = {
    id: string;
    job_number: string | null;
    title: string | null;
    status: string;
    style_images: string[] | null;
    style_notes: string | null;
    voice_note_url: string | null;
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
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/auth");
                return;
            }

            const { data: jobData } = await supabase
                .from("jobs")
                .select("*")
                .eq("id", jobId)
                .eq("designer_id", user.id)
                .single();

            if (!jobData) {
                router.push("/designer-dashboard/jobs");
                return;
            }

            setJob(jobData);

            const { data: measurementData } = await supabase
                .from("measurements")
                .select("*")
                .eq("client_id", jobData.client_id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            setMeasurement(measurementData);

            const [
                { data: clientData },
                { data: updatesData },
                { data: invoiceData },
            ] = await Promise.all([
                jobData.client_id
                    ? supabase
                        .from("clients")
                        .select("*")
                        .eq("id", jobData.client_id)
                        .single()
                    : Promise.resolve({ data: null }),

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
    const progress =
        ((currentPipelineIndex + 1) / PIPELINE.length) * 100;
    const images = job.style_images ?? [];

    return (
        <main className="min-h-screen bg-gray-50 pb-32">

            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">

                <div className="flex items-center gap-3 px-5 pt-4">
                    <Link
                        href="/designer-dashboard/jobs"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-bold text-gray-900">
                            {client?.full_name ?? "Customer"}
                        </p>

                        <p className="truncate text-sm text-gray-500">
                            {job.title}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 px-5 py-3">

                    <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_COLORS[job.status] ??
                            "bg-gray-100 text-gray-600"
                            }`}
                    >
                        {PIPELINE.find(p => p.value === job.status)?.label}
                    </span>

                    {job.expected_delivery && (
                        <span
                            className={`text-sm font-semibold ${(() => {
                                const today = new Date();
                                const due = new Date(job.expected_delivery);

                                today.setHours(0, 0, 0, 0);
                                due.setHours(0, 0, 0, 0);

                                const days = Math.ceil(
                                    (due.getTime() - today.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                );

                                if (days < 0) return "text-red-600";
                                if (days <= 2) return "text-orange-600";
                                return "text-gray-700";
                            })()
                                }`}
                        >
                            {(() => {
                                const today = new Date();
                                const due = new Date(job.expected_delivery);

                                today.setHours(0, 0, 0, 0);
                                due.setHours(0, 0, 0, 0);

                                const days = Math.ceil(
                                    (due.getTime() - today.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                );

                                if (days < 0) return `${Math.abs(days)} days overdue`;
                                if (days === 0) return "Due today";
                                if (days === 1) return "Tomorrow";
                                return `${days} days left`;
                            })()}
                        </span>
                    )}

                </div>

            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-4">

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

                {/* STYLE IMAGES */}
                {images.length > 0 && (
                    <PhotoProvider
                        maskOpacity={0.95}
                        speed={() => 300}
                    >
                        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

                            <PhotoView src={images[activeImage]}>
                                <div className="relative h-[500px] w-full cursor-zoom-in bg-gray-50">
                                    <img
                                        src={images[activeImage]}
                                        alt="Style reference"
                                        className="h-full w-full object-contain bg-white transition duration-300 hover:scale-[1.01]"
                                    />

                                    <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                                        Tap to zoom
                                    </div>

                                    {images.length > 1 && (
                                        <div className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                                            {activeImage + 1} / {images.length}
                                        </div>
                                    )}
                                </div>
                            </PhotoView>

                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto p-3">
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${i === activeImage
                                                ? "border-emerald-600"
                                                : "border-transparent"
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                        </section>
                    </PhotoProvider>
                )}

                {job.voice_note_url && (
                    <section className="rounded-2xl bg-white p-5 shadow-sm">

                        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Customer Voice Note
                        </p>

                        <PremiumVoicePlayer
                            src={job.voice_note_url}
                        />

                    </section>
                )}


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

                {/* PRODUCTION PIPELINE */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-lg font-bold text-gray-900">
                                    Production Progress
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {Math.round(progress)}% Complete
                                </p>

                            </div>

                            <button
                                onClick={() => setShowPipeline(!showPipeline)}
                                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition"
                            >
                                Update
                            </button>

                        </div>

                        <div className="mt-5">

                            <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 transition-all duration-700"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />

                            </div>

                        </div>

                    </div>
                    {/* Pipeline visual */}
                    <div className="space-y-5">

                        {PIPELINE.map((stage, i) => {

                            const isDone = i < currentPipelineIndex;
                            const isCurrent = i === currentPipelineIndex;

                            return (

                                <div
                                    key={stage.value}
                                    className="relative flex items-start gap-4"
                                >

                                    {/* Vertical line */}

                                    {i !== PIPELINE.length - 1 && (
                                        <div
                                            className={`absolute left-[18px] top-10 h-full w-[2px] ${isDone
                                                ? "bg-emerald-500"
                                                : "bg-gray-200"
                                                }`}
                                        />
                                    )}

                                    {/* Circle */}

                                    <div
                                        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500

                    ${isDone
                                                ? "bg-emerald-600 text-white"
                                                : isCurrent
                                                    ? "border-4 border-emerald-500 bg-white shadow-lg shadow-emerald-200"
                                                    : "border-2 border-gray-300 bg-white"
                                            }`}
                                    >

                                        {isDone ? (
                                            <Check size={18} strokeWidth={3} />
                                        ) : isCurrent ? (
                                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                        ) : null}

                                    </div>

                                    {/* Text */}

                                    <div className="pb-4">

                                        <p
                                            className={`font-semibold

                        ${isCurrent
                                                    ? "text-emerald-600"
                                                    : isDone
                                                        ? "text-gray-500"
                                                        : "text-gray-400"
                                                }`}
                                        >
                                            {stage.label}
                                        </p>

                                        {isCurrent && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Current stage
                                            </p>
                                        )}

                                        {isDone && (
                                            <p className="mt-1 text-xs text-emerald-600">
                                                Completed
                                            </p>
                                        )}

                                    </div>

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