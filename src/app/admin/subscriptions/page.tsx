"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, TrendingUp, X } from "lucide-react";

type Payment = {
    id: string;
    designer_id: string;
    plan: string;
    amount: number;
    currency: string;
    payment_method: string | null;
    status: string | null;
    created_at: string;
    designer_name?: string;
};

type DesignerOption = { id: string; brand_name: string | null; plan: string | null };

export default function SubscriptionsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [designers, setDesigners] = useState<DesignerOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLogModal, setShowLogModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Log payment form
    const [selectedDesigner, setSelectedDesigner] = useState("");
    const [amount, setAmount] = useState("5000");
    const [method, setMethod] = useState("bank_transfer");

    const load = async () => {
        setLoading(true);
        const [{ data: paymentsData }, { data: designersData }] = await Promise.all([
            supabase.from("subscription_payments").select("*").order("created_at", { ascending: false }),
            supabase.from("designers").select("id, brand_name, plan").order("brand_name"),
        ]);

        const designerMap = new Map((designersData ?? []).map((d) => [d.id, d.brand_name]));
        const enriched = (paymentsData ?? []).map((p) => ({
            ...p,
            designer_name: designerMap.get(p.designer_id) ?? "Unknown",
        }));

        setPayments(enriched);
        setDesigners(designersData ?? []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);

    const byPlan = payments.reduce((acc, p) => {
        acc[p.plan] = (acc[p.plan] ?? 0) + Number(p.amount);
        return acc;
    }, {} as Record<string, number>);

    const handleLogPayment = async () => {
        if (!selectedDesigner || !amount) return;
        setSaving(true);

        const designer = designers.find((d) => d.id === selectedDesigner);
        const periodStart = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabase.from("subscription_payments").insert({
            designer_id: selectedDesigner,
            plan: designer?.plan ?? "unknown",
            amount: parseFloat(amount),
            payment_method: method,
            status: "paid",
            period_start: periodStart.toISOString().split("T")[0],
            period_end: periodEnd.toISOString().split("T")[0],
        });

        setShowLogModal(false);
        setSelectedDesigner("");
        setAmount("5000");
        await load();
        setSaving(false);
    };

    return (
        <div className="px-6 py-8 md:px-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
                    <p className="mt-1 text-sm text-gray-500">Revenue from designer plan payments.</p>
                </div>
                <button
                    onClick={() => setShowLogModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                    <Plus size={15} /> Log Payment
                </button>
            </div>

            {loading ? (
                <div className="mt-10 flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
                </div>
            ) : (
                <>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                                <TrendingUp size={18} />
                            </div>
                            <p className="mt-4 text-2xl font-bold text-gray-900">₦{totalRevenue.toLocaleString()}</p>
                            <p className="mt-1 text-xs font-medium text-gray-500">Total Revenue Collected</p>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">By Plan</p>
                            <div className="mt-3 space-y-2">
                                {Object.entries(byPlan).length === 0 ? (
                                    <p className="text-sm text-gray-400">No payments logged yet</p>
                                ) : (
                                    Object.entries(byPlan).map(([plan, amt]) => (
                                        <div key={plan} className="flex items-center justify-between text-sm">
                                            <span className="capitalize text-gray-600">{plan}</span>
                                            <span className="font-semibold text-gray-900">₦{amt.toLocaleString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Payment History</p>
                        {payments.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                                <p className="text-sm font-medium text-gray-700">No payments logged yet</p>
                                <p className="mt-1 text-xs text-gray-400">Log your first subscription payment above.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {payments.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{p.designer_name}</p>
                                            <p className="text-xs text-gray-400 capitalize">
                                                {p.plan} plan · {p.payment_method?.replace("_", " ") ?? "—"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-600">₦{Number(p.amount).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-900">Log Payment</h2>
                            <button onClick={() => setShowLogModal(false)}>
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Designer</label>
                                <select
                                    value={selectedDesigner}
                                    onChange={(e) => setSelectedDesigner(e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-900"
                                >
                                    <option value="">Select designer</option>
                                    {designers.map((d) => (
                                        <option key={d.id} value={d.id}>{d.brand_name ?? "Unnamed"}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Amount (₦)</label>
                                <div className="flex gap-2">
                                    {["5000", "10000"].map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => setAmount(amt)}
                                            className={`flex-1 rounded-lg border py-2 text-sm font-semibold ${amount === amt ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600"
                                                }`}
                                        >
                                            ₦{Number(amt).toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Payment Method</label>
                                <select
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-900"
                                >
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="paystack">Paystack</option>
                                    <option value="flutterwave">Flutterwave</option>
                                    <option value="cash">Cash</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleLogPayment}
                            disabled={saving || !selectedDesigner}
                            className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Log Payment"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}