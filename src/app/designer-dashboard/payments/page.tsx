"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type PendingPayment = {
    jobId: string;
    jobTitle: string | null;
    clientName: string;
    clientPhone: string | null;
    balance: number;
    currency: string;
};

export default function PaymentsPage() {
    const router = useRouter();
    const [payments, setPayments] = useState<PendingPayment[]>([]);
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
                .select("job_id, balance, currency")
                .in("job_id", jobIds)
                .gt("balance", 0);

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

            const list: PendingPayment[] = (invoicesData ?? [])
                .map(inv => {
                    const job = jobMap[inv.job_id];
                    const client = job?.client_id ? clientMap[job.client_id] : null;
                    return {
                        jobId: inv.job_id,
                        jobTitle: job?.title ?? "Untitled Job",
                        clientName: client?.name ?? "Unknown Client",
                        clientPhone: client?.phone ?? null,
                        balance: inv.balance,
                        currency: inv.currency,
                    };
                })
                .sort((a, b) => b.balance - a.balance);

            setPayments(list);
            setLoading(false);
        };

        load();
    }, [router]);

    const totalOutstanding = payments.reduce((s, p) => s + p.balance, 0);
    const currency = payments[0]?.currency ?? "NGN";

    const remindClient = (p: PendingPayment) => {
        if (!p.clientPhone) return;
        const message = `Hi ${p.clientName}, this is a friendly reminder that you have an outstanding balance of ${p.currency} ${p.balance.toLocaleString()} for your ${p.jobTitle} order. Kindly complete payment at your convenience. Thank you!`;
        const phone = p.clientPhone.replace(/\D/g, "");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
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
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3 px-5 pt-4 pb-4">
                    <Link
                        href="/designer-dashboard"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <p className="text-lg font-bold text-gray-900">Outstanding Payments</p>
                        <p className="text-xs text-gray-400">
                            {payments.length} payment{payments.length !== 1 ? "s" : ""} pending
                        </p>
                    </div>
                </div>
            </header>

            <div className="px-5 py-4 space-y-4">
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-50">
                            <Clock size={18} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Total Outstanding</p>
                            <p className="text-lg font-bold text-gray-900">
                                {currency} {totalOutstanding.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </section>

                {payments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                        <p className="text-sm font-semibold text-gray-700">
                            No pending payments
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            All invoices are fully paid
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {payments.map((p) => (
                            <div
                                key={p.jobId}
                                className="rounded-2xl bg-white p-4 shadow-sm"
                            >
                                <Link
                                    href={`/designer-dashboard/jobs/${p.jobId}`}
                                    className="flex items-center justify-between"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {p.clientName}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-gray-500">
                                            {p.jobTitle}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-sm font-bold text-orange-600">
                                            {p.currency} {p.balance.toLocaleString()}
                                        </span>
                                        <ChevronRight size={16} className="text-gray-300" />
                                    </div>
                                </Link>

                                <button
                                    onClick={() => remindClient(p)}
                                    disabled={!p.clientPhone}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <MessageCircle size={14} />
                                    Remind Client
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
