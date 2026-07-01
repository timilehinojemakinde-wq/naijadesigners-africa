"use client";

import PremiumVoicePlayer from "@/components/audio/PremiumVoicePlayer";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useEffect, useState, useCallback } from "react";
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
    DollarSign,
    Loader2,
    X,
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

type PaymentRecord = { amount: number; date: string };

type Invoice = {
    id: string;
    status: string;
    subtotal: number;
    deposit_required: number;
    deposit_paid: number;
    balance: number;
    currency: string;
    payment_history: PaymentRecord[];
};

type Measurement = {
    height?: number;
    bust?: number;
    waist?: number;
    hips?: number;
    shoulder_width?: number;
    sleeve_length?: number;
    chest?: number;
    neck?: number;
    inseam?: number;
    thigh?: number;
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

const MEASUREMENT_FIELDS: {
    key: keyof Measurement;
    label: string;
}[] = [
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
    ];

export default function JobDetailPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [measurement, setMeasurement] = useState<Measurement | null>(null);
    const [job, setJob] = useState<Job | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [updates, setUpdates] = useState<JobUpdate[]>([]);
    const [activeImage, setActiveImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [showPipeline, setShowPipeline] = useState(false);
    const [showFullMeasurements, setShowFullMeasurements] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [savingPayment, setSavingPayment] = useState(false);

    const loadAll = useCallback(async () => {
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
                    ? supabase.from("clients").select("*").eq("id", jobData.client_id).single()
                    : Promise.resolve({ data: null }),
                supabase
                    .from("job_updates")
                    .select("*")
                    .eq("job_id", jobId)
                    .order("created_at", { ascending: false }),
                supabase
                    .from("invoices")
                    .select("id, status, subtotal, deposit_required, deposit_paid, balance, currency, payment_history")
                    .eq("job_id", jobId)
                    .maybeSingle(),
            ]);

        setClient(clientData);
        setUpdates(updatesData ?? []);
        setInvoice(invoiceData);
        setLoading(false);
    }, [jobId, router]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const refreshUpdates = async () => {
        const { data } = await supabase
            .from("job_updates")
            .select("*")
            .eq("job_id", jobId)
            .order("created_at", { ascending: false });
        setUpdates(data ?? []);
    };

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
            await refreshUpdates();
        }

        setStatusUpdating(false);
    };

    const copyTrackingLink = async () => {
        if (!job?.tracking_token) return;
        const url = `${window.location.origin}/track/${job.tracking_token}`;
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

    const handleRecordPayment = async () => {
        if (!invoice || !paymentAmount) return;
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return;

        setSavingPayment(true);

        const newPaid = invoice.deposit_paid + amount;
        const newBalance = Math.max(0, invoice.subtotal - newPaid);
        const newStatus = newBalance <= 0 ? "fully_paid" : "deposit_paid";
        const newHistory: PaymentRecord[] = [
            ...(invoice.payment_history || []),
            {
                amount,
                date: new Date().toISOString(),
            },
        ];

        const { data, error } = await supabase
            .from("invoices")
            .update({
                deposit_paid: newPaid,
                balance: newBalance,
                status: newStatus,
                payment_history: newHistory,
                updated_at: new Date().toISOString(),
            })
            .eq("id", invoice.id)
            .select("id, status, subtotal, deposit_required, deposit_paid, balance, currency, payment_history")
            .single();

        if (!error && data) {
            setInvoice(data as Invoice);
            if (job) {
                await supabase.from("job_updates").insert({
                    job_id: job.id,
                    status: job.status,
                    note: `Payment recorded: ${invoice.currency} ${amount.toLocaleString()}`,
                    notify_client: false,
                });
                await refreshUpdates();
            }
        }

        setPaymentAmount("");
        setShowPaymentForm(false);
        setSavingPayment(false);
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </main>
        );
    }

    if (!job) return null;

    const currentPipelineIndex = PIPELINE.findIndex(p => p.value === job.status);
    const progress = ((currentPipelineIndex + 1) / PIPELINE.length) * 100;
    const images = job.style_images ?? [];

    const paidPercent = invoice
        ? Math.min(
            100,
            Math.max(
                0,
                Math.round((invoice.deposit_paid / invoice.subtotal) * 100)
            )
        )
        : 0;

    // Context-aware primary action
    type ActionButton = {
        label: string;
        onClick: () => void;
        icon: React.ReactNode;
    };
    let primaryAction: ActionButton | null = null;

    if (!measurement) {
        primaryAction = {
            label: "Send Measurement Link",
            onClick: shareMeasurementLink,
            icon: <Ruler size={14} />,
        };
    } else if (!invoice) {
        primaryAction = {
            label: "Generate Invoice",
            onClick: () => router.push(`/designer-dashboard/jobs/${job.id}/invoice`),
            icon: <FileText size={14} />,
        };
    } else if (invoice.balance > 0) {
        primaryAction = {
            label: "Record Payment",
            onClick: () => setShowPaymentForm(true),
            icon: <DollarSign size={14} />,
        };
    } else {
        primaryAction = {
            label: "Update Status",
            onClick: () => setShowPipeline(true),
            icon: <ChevronRight size={14} />,
        };
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-36">

            {/* 1. HEADER */}
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
                            {client?.full_name ?? "Client"}
                        </p>
                        <p className="truncate text-sm text-gray-500">{job.title}</p>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {PIPELINE.find(p => p.value === job.status)?.label}
                    </span>

                    {job.expected_delivery && (() => {
                        const today = new Date();
                        const due = new Date(job.expected_delivery);
                        today.setHours(0, 0, 0, 0);
                        due.setHours(0, 0, 0, 0);
                        const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);

                        const colorClass = days < 0 ? "text-red-600" : days <= 2 ? "text-orange-600" : "text-gray-700";
                        const label = days < 0 ? `${Math.abs(days)} days overdue`
                            : days === 0 ? "Due today"
                                : days === 1 ? "Tomorrow"
                                    : `${days} days left`;

                        return <span className={`text-sm font-semibold ${colorClass}`}>{label}</span>;
                    })()}
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-4">

                {/* 2. STYLE IMAGE (HERO) */}
                {images.length > 0 && (
                    <PhotoProvider maskOpacity={0.95} speed={() => 300}>
                        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <PhotoView src={images[activeImage]}>
                                <div className="relative h-[420px] w-full cursor-zoom-in bg-gray-50">
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
                                            className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${i === activeImage ? "border-emerald-600" : "border-transparent"}`}
                                        >
                                            <img src={img} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </PhotoProvider>
                )}

                {/* 3. VOICE NOTE */}
                {job.voice_note_url && (
                    <section className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Client Voice Note
                        </p>
                        <PremiumVoicePlayer src={job.voice_note_url} />
                    </section>
                )}

                {/* 4. STYLE / CUSTOMER INSTRUCTIONS */}
                {job.style_notes && (
                    <section className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-amber-600">
                            Style Notes
                        </p>
                        <p className="text-sm leading-relaxed text-amber-900">{job.style_notes}</p>
                    </section>
                )}

                {/* 5. MEASUREMENTS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">Measurements</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${measurement ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                            {measurement ? "Received" : "Not received"}
                        </span>
                    </div>

                    {measurement ? (
                        <>
                            <div className="grid grid-cols-2 gap-2">
                                {MEASUREMENT_FIELDS.filter(f => measurement[f.key])
                                    .slice(0, showFullMeasurements ? undefined : 6)
                                    .map(({ key, label }) => (
                                        <div key={key} className="rounded-xl bg-gray-50 px-3 py-2">
                                            <p className="text-[10px] text-gray-400">{label}</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {Number(measurement[key]).toFixed(1)} cm
                                            </p>
                                        </div>
                                    ))}
                            </div>
                            {MEASUREMENT_FIELDS.filter(f => measurement[f.key]).length > 6 && (
                                <button
                                    onClick={() => setShowFullMeasurements(!showFullMeasurements)}
                                    className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600"
                                >
                                    {showFullMeasurements ? "Show Less" : "View Full Measurements"}
                                    <ChevronDown size={12} className={`transition ${showFullMeasurements ? "rotate-180" : ""}`} />
                                </button>
                            )}
                        </>
                    ) : (
                        <div>
                            <p className="mb-3 text-xs text-gray-400">No measurements received yet.</p>
                            <button
                                onClick={shareMeasurementLink}
                                disabled={!client?.phone}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Ruler size={14} /> Send Measurement Link
                            </button>
                        </div>
                    )}
                </section>

                {/* 6. PAYMENTS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">Payments</h2>
                        {invoice && (
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${invoice.status === "fully_paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {invoice.status === "fully_paid" ? "Paid" : invoice.status === "deposit_paid" ? "Partial" : "Unpaid"}
                            </span>
                        )}
                    </div>

                    {invoice ? (
                        <>
                            {/* Progress bar */}
                            <div className="mb-3">
                                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                        style={{ width: `${paidPercent}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-xs font-medium text-emerald-600">{paidPercent}% Paid</p>
                            </div>

                            <div className="space-y-2 rounded-xl bg-gray-50 p-3.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-semibold text-gray-900">
                                        {invoice.currency} {invoice.subtotal.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Deposit Required</span>
                                    <span className="font-semibold text-gray-900">
                                        {invoice.currency} {invoice.deposit_required.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Deposit Paid</span>
                                    <span className="font-semibold text-emerald-600">
                                        {invoice.currency} {invoice.deposit_paid.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
                                    <span className="font-medium text-gray-700">Outstanding Balance</span>
                                    <span className={`font-bold ${invoice.balance <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                        {invoice.currency} {invoice.balance.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {showPaymentForm ? (
                                <div className="mt-3 flex gap-2">
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="Amount"
                                        autoFocus
                                        className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-900"
                                    />
                                    <button
                                        onClick={handleRecordPayment}
                                        disabled={savingPayment}
                                        className="flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-3 text-white disabled:opacity-50"
                                    >
                                        {savingPayment ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    </button>
                                    <button
                                        onClick={() => setShowPaymentForm(false)}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-3 flex gap-2">
                                    <Link
                                        href={`/designer-dashboard/jobs/${job.id}/invoice`}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700"
                                    >
                                        <FileText size={13} /> Edit Invoice
                                    </Link>
                                    {invoice.balance > 0 && (
                                        <button
                                            onClick={() => setShowPaymentForm(true)}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-2.5 text-xs font-semibold text-white"
                                        >
                                            <DollarSign size={13} /> Record Payment
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="mb-3 text-xs text-gray-400">No invoice yet. Generate one when price is agreed.</p>
                            <Link
                                href={`/designer-dashboard/jobs/${job.id}/invoice`}
                                className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-xs font-semibold text-white"
                            >
                                <FileText size={14} /> Generate Invoice
                            </Link>
                        </>
                    )}
                </section>

                {/* 7. PRODUCTION TRACKER */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Production Progress</h2>
                                <p className="mt-1 text-sm text-gray-500">{Math.round(progress)}% Complete</p>
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
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {PIPELINE.map((stage, i) => {
                            const isDone = i < currentPipelineIndex;
                            const isCurrent = i === currentPipelineIndex;

                            return (
                                <div key={stage.value} className="relative flex items-start gap-4">
                                    {i !== PIPELINE.length - 1 && (
                                        <div className={`absolute left-[18px] top-10 h-full w-[2px] ${isDone ? "bg-emerald-500" : "bg-gray-200"}`} />
                                    )}
                                    <div className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500 ${isDone ? "bg-emerald-600 text-white"
                                        : isCurrent ? "border-4 border-emerald-500 bg-white shadow-lg shadow-emerald-200"
                                            : "border-2 border-gray-300 bg-white"
                                        }`}>
                                        {isDone ? <Check size={18} strokeWidth={3} />
                                            : isCurrent ? <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                                : null}
                                    </div>
                                    <div className="pb-4">
                                        <p className={`font-semibold ${isCurrent ? "text-emerald-600" : isDone ? "text-gray-500" : "text-gray-400"}`}>
                                            {stage.label}
                                        </p>
                                        {isCurrent && <p className="mt-1 text-sm text-gray-500">Current stage</p>}
                                        {isDone && <p className="mt-1 text-xs text-emerald-600">Completed</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {showPipeline && (
                        <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4">
                            <p className="mb-2 text-xs font-semibold text-gray-500">Move to:</p>
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

                {/* 8. CLIENT CONTACT */}
                {client && (
                    <section className="rounded-2xl bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-sm font-bold text-gray-900">Client</h2>
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                                {client.full_name[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">{client.full_name}</p>
                                {client.phone && <p className="text-xs text-gray-400">{client.phone}</p>}
                            </div>
                        </div>

                        {client.phone && (
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white"
                                >
                                    <MessageCircle size={14} />
                                    WhatsApp
                                </a>
                                <a
                                    href={`tel:${client.phone}`}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700"
                                >
                                    <Phone size={14} /> Call
                                </a>
                                <button
                                    onClick={shareTrackingLink}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700"
                                >
                                    <Send size={14} /> Share Tracking
                                </button>
                                <button
                                    onClick={copyTrackingLink}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700"
                                >
                                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    {copied ? "Copied" : "Copy Link"}
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* 9. TIMELINE */}
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
                                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* 10. STICKY CONTEXT-AWARE ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white px-5 py-3">
                <div className="mx-auto flex max-w-md gap-2">
                    <button
                        onClick={primaryAction?.onClick}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-xs font-semibold text-white"
                    >
                        {primaryAction?.icon}
                        {primaryAction?.label}
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