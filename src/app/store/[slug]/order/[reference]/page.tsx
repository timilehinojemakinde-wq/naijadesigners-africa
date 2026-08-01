import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type Props = {
    params: Promise<{ slug: string; reference: string }>;
    searchParams: Promise<{ status?: string }>;
};

export default async function OrderStatusPage({ params, searchParams }: Props) {
    const { slug, reference } = await params;
    const { status } = await searchParams;
    const supabase = await createSupabaseServerClient();

    const { data: order } = await supabase
        .from("orders")
        .select("id, buyer_name, amount, currency, status, product_id")
        .eq("payment_reference", reference)
        .single();

    const paid = status === "success" || order?.status === "paid";

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5">
            <div className="w-full max-w-md text-center">
                <div
                    className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${paid ? "bg-emerald-600" : "bg-red-500"
                        }`}
                >
                    {paid ? (
                        <Check size={32} className="text-white" strokeWidth={3} />
                    ) : (
                        <X size={32} className="text-white" strokeWidth={3} />
                    )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900">
                    {paid ? "Payment Successful! 🎉" : "Payment Failed"}
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    {paid ? (
                        <>
                            Thank you{order?.buyer_name ? `, ${order.buyer_name}` : ""}! Your order of{" "}
                            <span className="font-semibold text-gray-700">
                                {order ? formatCurrency(Number(order.amount), order.currency) : ""}
                            </span>{" "}
                            has been confirmed. The designer has been notified and will reach out shortly.
                        </>
                    ) : (
                        "Something went wrong with your payment. No charge was completed — please try again."
                    )}
                </p>

                <Link
                    href={`/store/${slug}`}
                    className="mt-6 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700"
                >
                    Back to Store
                </Link>
            </div>
        </main>
    );
}
