import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";

type Props = {
    params: Promise<{ id: string }>;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
    NGN: "₦", USD: "$", GBP: "£", EUR: "€",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-600" },
    sent: { label: "Sent to Client", color: "bg-blue-100 text-blue-700" },
    deposit_paid: { label: "Deposit Paid", color: "bg-amber-100 text-amber-700" },
    fully_paid: { label: "Fully Paid", color: "bg-emerald-100 text-emerald-700" },
};

export default async function PublicInvoicePage({ params }: Props) {
    const { id } = await params;

    const { data: invoice, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !invoice) notFound();

    const { data: designer } = await supabase
        .from("designers")
        .select("brand_name, profile_image, business_location, slug")
        .eq("id", invoice.designer_id)
        .single();

    const symbol = CURRENCY_SYMBOLS[invoice.currency] ?? invoice.currency;
    const statusConfig = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.draft;
    const isFullyPaid = invoice.status === "fully_paid";

    return (
        <main className="min-h-screen bg-gray-50 pb-16">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-100 px-5 py-5">
                <div className="mx-auto max-w-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400">Invoice from</p>
                            <h1 className="text-lg font-bold text-gray-900">
                                {designer?.brand_name ?? "FitHouseAfrica Designer"}
                            </h1>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.color}`}>
                            {statusConfig.label}
                        </span>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-5">

                {/* FULLY PAID BANNER */}
                {isFullyPaid && (
                    <section className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600">
                            <Check size={18} className="text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-800">
                                Payment Complete
                            </p>
                            <p className="text-xs text-emerald-600">
                                Thank you — your payment has been received in full.
                            </p>
                        </div>
                    </section>
                )}

                {/* BILL TO */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                Bill To
                            </p>
                            <p className="mt-1 text-base font-bold text-gray-900">
                                {invoice.client_name ?? "Customer"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                Job
                            </p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {invoice.job_number ?? "—"}
                            </p>
                        </div>
                    </div>
                </section>

                {/* LINE ITEMS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">
                        Items
                    </h2>

                    <div className="space-y-3">
                        {(invoice.items ?? []).map((item: any, i: number) => (
                            <div
                                key={i}
                                className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                            >
                                <p className="text-sm text-gray-700">
                                    {item.description || "Item"}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {symbol}{Number(item.amount).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* TOTALS */}
                    <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Total</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {symbol}{Number(invoice.total).toLocaleString()}
                            </span>
                        </div>

                        {invoice.deposit_required > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Deposit Required</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {symbol}{Number(invoice.deposit_required).toLocaleString()}
                                </span>
                            </div>
                        )}

                        {invoice.deposit_paid > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-emerald-600">Deposit Paid</span>
                                <span className="text-sm font-semibold text-emerald-600">
                                    − {symbol}{Number(invoice.deposit_paid).toLocaleString()}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                            <span className="text-base font-bold text-gray-900">
                                Balance Due
                            </span>
                            <span className={`text-lg font-bold ${isFullyPaid ? "text-emerald-600" : "text-gray-900"
                                }`}>
                                {isFullyPaid
                                    ? "Paid ✓"
                                    : `${symbol}${Math.max(0, invoice.balance).toLocaleString()}`
                                }
                            </span>
                        </div>
                    </div>
                </section>

                {/* NOTES */}
                {invoice.notes && (
                    <section className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-600">
                            Payment Notes
                        </p>
                        <p className="text-sm leading-relaxed text-amber-900">
                            {invoice.notes}
                        </p>
                    </section>
                )}

                {/* DESIGNER INFO */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100">
                            {designer?.profile_image ? (
                                <img
                                    src={designer.profile_image}
                                    alt={designer.brand_name ?? ""}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-lg font-bold text-emerald-700">
                                    {designer?.brand_name?.[0]?.toUpperCase() ?? "F"}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                {designer?.brand_name}
                            </p>
                            {designer?.business_location && (
                                <p className="text-xs text-gray-400">
                                    {designer.business_location}
                                </p>
                            )}
                        </div>
                    </div>

                    {designer?.slug && (
                        <Link
                            href={`/store/${designer.slug}`}
                            className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            View Store
                        </Link>
                    )}
                </section>

                <p className="pb-4 text-center text-xs text-gray-400">
                    Powered by{" "}
                    <Link href="/" className="font-semibold text-emerald-600">
                        FitHouseAfrica
                    </Link>
                </p>
            </div>
        </main>
    );
}