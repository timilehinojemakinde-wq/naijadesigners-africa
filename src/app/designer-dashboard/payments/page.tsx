"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatCurrency } from "@/lib/formatCurrency";

type PaymentRow = {
    jobId: string;
    jobTitle: string | null;
    clientName: string;
    clientPhone: string | null;
    amount: number;
    currency: string;
    createdAt: string;
};

export default function PaymentsPage() {
    const router = useRouter();
    const [outstanding, setOutstanding] = useState<PaymentRow[]>([]);
    const [earned, setEarned] = useState<PaymentRow[]>([]);
    const [totalEarned, setTotalEarned] = useState(0);
    const [totalOutstanding, setTotalOutstanding] = useState(0);
    const [currency, setCurrency] = useState("NGN");
    const [tab, setTab] = useState<"outstanding" | "earned">("outstanding");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data: jobsData } = await supabase
                .from("jobs")
                .select("id, title, client_id")
                .eq("designer_id", user.id);

            const jobIds = (jobsData ?? []).map(j => j.id);
            if (jobIds.length === 0) {
                setLoading(false);
                return;
            }

            const { data: invoicesData } = await supabase
                .from("invoices")
                .select("job_id, deposit_paid, balance, currency, created_at")
                .in("job_id", jobIds);

            const clientIds = [...new Set(
                (jobsData ?? [])
                    .map(j => j.client_id)
                    .filter(Boolean) as string[]
            )];

            const { data: clientsData } = clientIds.length > 0
                ? await supabase
                    .from("clients")
                    .select("id, title, full_name, phone")
                    .in("id", clientIds)
                : { data: [] };

            const clientMap: Record<string, { name: string; phone: string | null }> = {};
            (clientsData ?? []).forEach(c => {
                clientMap[c.id] = {
                    name: `${c.title ? c.title + " " : ""}${c.full_name}`,
                    phone: c.phone ?? null,
                };
            });

            const jobMap: Record<string, { title: string | null; client_id: string | null }> = {};
            (jobsData ?? []).forEach(j => {
                jobMap[j.id] = { title: j.title, client_id: j.client_id };
            });

            const invoices = invoicesData ?? [];

            const outstandingList: PaymentRow[] = invoices
                .filter(inv => inv.balance > 0)
                .map(inv => {
                    const job = jobMap[inv.job_id];
                    const client = job?.client_id ? clientMap[job.client_id] : null;
                    return {
                        jobId: inv.job_id,
                        jobTitle: job?.title ?? "Untitled Job",
                        clientName: client?.name ?? "Unknown Client",
                        clientPhone: client?.phone ?? null,
                        amount: inv.balance,
                        currency: inv.currency,
                        createdAt: inv.created_at,
                    };
                })
                .sort((a, b) => b.amount - a.amount);

            const earnedList: PaymentRow[] = invoices
                .filter(inv => inv.deposit_paid > 0)
                .map(inv => {
                    const job = jobMap[inv.job_id];
                    const client = job?.client_id ? clientMap[job.client_id] : null;
                    return {
                        jobId: inv.job_id,
                        jobTitle: job?.title ?? "Untitled Job",
                        clientName: client?.name ?? "Unknown Client",
                        clientPhone: client?.phone ?? null,
                        amount: inv.deposit_paid,
                        currency: inv.currency,
                        createdAt: inv.created_at,
                    };
                })
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOutstanding(outstandingList);
            setEarned(earnedList);
            setTotalOutstanding(invoices.reduce((s, i) => s + (i.balance || 0), 0));
            setTotalEarned(invoices.reduce((s, i) => s + (i.deposit_paid || 0), 0));
            setCurrency(invoices[0]?.currency ?? "NGN");
            setLoading(false);
        };

        load();
    }, [router]);

    const remindClient = (p: PaymentRow, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!p.clientPhone) return;
        const message = `Hi ${p.clientName}, this is a friendly reminder that you have an outstanding balance of ${formatCurrency(p.amount, p.currency)} for your ${p.jobTitle} order. Kindly complete payment at your convenience. Thank you!`;
        const phone = p.clientPhone.replace(/\D/g, "");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const date = d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
        const time = d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
        return `${date}, ${time}`;
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    const activeList = tab === "outstanding" ? outstanding : earned;

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3 px-5 pt-4 pb-4">
                    <Link
                        href="/designer-dashboard"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <p className="text-lg font-bold text-gray-900">Payments</p>
                </div>
            </header>

            <div className="px-5 pt-4">
                {/* HERO BALANCE CARD */}
                <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                                Total Earned
                            </p>
                            <p className="mt-1.5 truncate text-2xl font-bold text-white">
                                {formatCurrency(totalEarned, currency)}
                            </p>
                        </div>

                        <div className="mx-4 h-10 w-px flex-shrink-0 bg-white/10" />

                        <div className="min-w-0 text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                                Outstanding
                            </p>
                            <p className="mt-1.5 truncate text-2xl font-bold text-amber-400">
                                {formatCurrency(totalOutstanding, currency)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* SEGMENTED TOGGLE */}
                <div className="mt-4 flex gap-1 rounded-full bg-gray-100 p-1">
                    <button
                        onClick={() => setTab("outstanding")}
                        className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${tab === "outstanding"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-400"
                            }`}
                    >
                        Outstanding ({outstanding.length})
                    </button>
                    <button
                        onClick={() => setTab("earned")}
                        className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${tab === "earned"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-400"
                            }`}
                    >
                        Earned ({earned.length})
                    </button>
                </div>
            </div>

            <div className="px-5 py-4">
                {activeList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                        <p className="text-sm font-semibold text-gray-700">
                            {tab === "outstanding" ? "No pending payments" : "No payments received yet"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            {tab === "outstanding"
                                ? "All invoices are fully paid"
                                : "Payments will appear here once received"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {activeList.map((p) => (
                            <div
                                key={p.jobId}
                                onClick={() => router.push(`/designer-dashboard/jobs/${p.jobId}`)}
                                className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm active:bg-gray-50 cursor-pointer"
                            >
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                                    {p.clientName[0]?.toUpperCase()}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {p.clientName}
                                    </p>
                                    <p className="truncate text-xs text-gray-400">
                                        {p.jobTitle}
                                    </p>
                                </div>

                                <div className="flex-shrink-0 text-right">
                                    <p className={`text-sm font-bold ${tab === "outstanding" ? "text-amber-600" : "text-emerald-600"
                                        }`}>
                                        {formatCurrency(p.amount, p.currency)}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {tab === "earned" ? formatDate(p.createdAt) : "Pending"}
                                    </p>
                                </div>

                                {tab === "outstanding" && (
                                    <button
                                        onClick={(e) => remindClient(p, e)}
                                        disabled={!p.clientPhone}
                                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <MessageCircle size={14} />
                                    </button>
                                )}

                                {tab === "earned" && (
                                    <ChevronRight size={14} className="flex-shrink-0 text-gray-300" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
