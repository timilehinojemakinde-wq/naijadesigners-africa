"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Plus, Trash2,
    Loader2, Check, Share2, Copy
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type LineItem = {
    id: string;
    description: string;
    amount: number;
};

type Job = {
    id: string;
    title: string | null;
    job_number: string | null;
    client_id: string | null;
};

type Client = {
    full_name: string;
    phone: string | null;
};

type Invoice = {
    id: string;
    items: LineItem[];
    subtotal: number;
    deposit_required: number;
    deposit_paid: number;
    balance: number;
    total: number;
    currency: string;
    status: string;
    notes: string | null;
};

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-600" },
    sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
    deposit_paid: { label: "Deposit Paid", color: "bg-amber-100 text-amber-700" },
    fully_paid: { label: "Fully Paid", color: "bg-emerald-100 text-emerald-700" },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
};

export default function InvoicePage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    // Form state
    const [items, setItems] = useState<LineItem[]>([
        { id: crypto.randomUUID(), description: "Stitching & Labour", amount: 0 },
    ]);
    const [depositRequired, setDepositRequired] = useState(0);
    const [depositPaid, setDepositPaid] = useState(0);
    const [currency, setCurrency] = useState("NGN");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data: jobData } = await supabase
                .from("jobs")
                .select("id, title, job_number, client_id")
                .eq("id", jobId)
                .eq("designer_id", user.id)
                .single();

            if (!jobData) {
                router.push("/designer-dashboard/jobs");
                return;
            }

            setJob(jobData);

            const [clientResult, invoiceResult] = await Promise.all([
                jobData.client_id
                    ? supabase
                        .from("clients")
                        .select("full_name, phone")
                        .eq("id", jobData.client_id)
                        .single()
                    : Promise.resolve({ data: null }),
                supabase
                    .from("invoices")
                    .select("*")
                    .eq("job_id", jobId)
                    .maybeSingle(),
            ]);

            setClient(clientResult.data);

            if (invoiceResult.data) {
                const inv = invoiceResult.data;
                setInvoice(inv);
                setItems(inv.items ?? []);
                setDepositRequired(inv.deposit_required ?? 0);
                setDepositPaid(inv.deposit_paid ?? 0);
                setCurrency(inv.currency ?? "NGN");
                setNotes(inv.notes ?? "");
            }

            setLoading(false);
        };

        load();
    }, [jobId, router]);

    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const balance = subtotal - (Number(depositPaid) || 0);

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            { id: crypto.randomUUID(), description: "", amount: 0 },
        ]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateItem = (id: string, field: "description" | "amount", value: string | number) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSave = async (newStatus?: string) => {
        setSaving(true);
        setSaved(false);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const status = newStatus ?? invoice?.status ?? "draft";

            const payload = {
                designer_id: user.id,
                job_id: jobId,
                job_number: job?.job_number ?? null,
                client_name: client?.full_name ?? null,
                items,
                subtotal,
                deposit_required: Number(depositRequired) || 0,
                deposit_paid: Number(depositPaid) || 0,
                balance,
                total: subtotal,
                currency,
                status,
                notes: notes.trim() || null,
                updated_at: new Date().toISOString(),
            };

            if (invoice?.id) {
                const { data, error } = await supabase
                    .from("invoices")
                    .update(payload)
                    .eq("id", invoice.id)
                    .select()
                    .single();

                if (error) throw error;
                setInvoice(data);
            } else {
                const { data, error } = await supabase
                    .from("invoices")
                    .insert(payload)
                    .select()
                    .single();

                if (error) throw error;
                setInvoice(data);
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            alert("Failed to save: " + err.message);
        }

        setSaving(false);
    };

    const markDepositPaid = async () => {
        setDepositPaid(depositRequired);
        await handleSave("deposit_paid");
    };

    const markFullyPaid = async () => {
        setDepositPaid(subtotal);
        await handleSave("fully_paid");
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/invoice/${invoice?.id}`;
        if (navigator.share) {
            await navigator.share({
                title: `Invoice — ${job?.title}`,
                text: `Invoice from ${client?.full_name ?? "FitHouseAfrica"}`,
                url,
            });
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-32">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/designer-dashboard/jobs/${jobId}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                {job?.job_number ?? "JOB"}
                            </p>
                            <h1 className="text-base font-bold text-gray-900">
                                Invoice
                            </h1>
                        </div>
                    </div>
                    {invoice && (
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_CONFIG[invoice.status]?.color ?? "bg-gray-100 text-gray-600"
                            }`}>
                            {STATUS_CONFIG[invoice.status]?.label ?? invoice.status}
                        </span>
                    )}
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-5">

                {/* JOB + CLIENT INFO */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                Bill To
                            </p>
                            <p className="mt-1 text-base font-bold text-gray-900">
                                {client?.full_name ?? "Customer"}
                            </p>
                            {client?.phone && (
                                <p className="text-xs text-gray-400">{client.phone}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                For
                            </p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {job?.title ?? "Job"}
                            </p>
                        </div>
                    </div>

                    {/* CURRENCY */}
                    <div className="mt-4">
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                            Currency
                        </label>
                        <div className="flex gap-2">
                            {CURRENCIES.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCurrency(c)}
                                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${currency === c
                                            ? "border-gray-900 bg-gray-900 text-white"
                                            : "border-gray-200 text-gray-600"
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* LINE ITEMS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">
                            Line Items
                        </h2>
                        <button
                            onClick={addItem}
                            className="flex items-center gap-1 text-xs font-semibold text-emerald-600"
                        >
                            <Plus size={13} /> Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                                <input
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                    placeholder="Description"
                                    className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-900"
                                />
                                <div className="flex h-10 items-center overflow-hidden rounded-xl border border-gray-200 focus-within:border-gray-900">
                                    <span className="px-2 text-xs text-gray-400">{symbol}</span>
                                    <input
                                        type="number"
                                        value={item.amount || ""}
                                        onChange={(e) => updateItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                        className="h-full w-24 pr-2 text-sm outline-none"
                                    />
                                </div>
                                {items.length > 1 && (
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-400"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* TOTALS */}
                    <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Subtotal</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {symbol}{subtotal.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Deposit Required</span>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-400">{symbol}</span>
                                <input
                                    type="number"
                                    value={depositRequired || ""}
                                    onChange={(e) => setDepositRequired(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-right text-sm outline-none focus:border-gray-900"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Deposit Paid</span>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-400">{symbol}</span>
                                <input
                                    type="number"
                                    value={depositPaid || ""}
                                    onChange={(e) => setDepositPaid(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-right text-sm outline-none focus:border-gray-900"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                            <span className="text-sm font-bold text-gray-900">Balance Due</span>
                            <span className={`text-base font-bold ${balance <= 0 ? "text-emerald-600" : "text-gray-900"
                                }`}>
                                {symbol}{Math.max(0, balance).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </section>

                {/* NOTES */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-2 text-sm font-bold text-gray-900">
                        Notes{" "}
                        <span className="font-normal text-gray-400 text-xs">— optional</span>
                    </h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Payment instructions, bank details, delivery info..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-gray-900"
                    />
                </section>

                {/* PAYMENT STATUS SHORTCUTS */}
                {invoice && invoice.status !== "fully_paid" && (
                    <section className="rounded-2xl bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-sm font-bold text-gray-900">
                            Record Payment
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={markDepositPaid}
                                disabled={saving || invoice.status === "deposit_paid"}
                                className="rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-semibold text-amber-700 disabled:opacity-50"
                            >
                                ✓ Deposit Received
                            </button>
                            <button
                                onClick={markFullyPaid}
                                disabled={saving}
                                className="rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                            >
                                ✓ Fully Paid
                            </button>
                        </div>
                    </section>
                )}

                {/* FULLY PAID STATE */}
                {invoice?.status === "fully_paid" && (
                    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600">
                                <Check size={18} className="text-white" strokeWidth={3} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-800">
                                    Fully Paid
                                </p>
                                <p className="text-xs text-emerald-600">
                                    {symbol}{subtotal.toLocaleString()} received
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* STICKY BOTTOM ACTIONS */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white px-5 py-3">
                <div className="mx-auto flex max-w-md gap-2">
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? (
                            <><Loader2 size={15} className="animate-spin" /> Saving...</>
                        ) : saved ? (
                            <><Check size={15} /> Saved</>
                        ) : (
                            invoice ? "Save Changes" : "Create Invoice"
                        )}
                    </button>

                    {invoice && (
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700"
                        >
                            {copied
                                ? <Check size={16} className="text-emerald-600" />
                                : <Share2 size={16} />
                            }
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}