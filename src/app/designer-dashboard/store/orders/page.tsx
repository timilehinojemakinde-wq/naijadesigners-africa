"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Package } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatCurrency } from "@/lib/formatCurrency";

type Order = {
    id: string;
    productId: string;
    productName: string;
    buyerName: string;
    buyerPhone: string;
    quantity: number;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-gray-100 text-gray-500",
    paid: "bg-amber-100 text-amber-700",
    fulfilled: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-600",
    cancelled: "bg-gray-100 text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    paid: "To Fulfill",
    fulfilled: "Fulfilled",
    failed: "Failed",
    cancelled: "Cancelled",
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [tab, setTab] = useState<"to_fulfill" | "fulfilled" | "all">("to_fulfill");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data: ordersData } = await supabase
                .from("orders")
                .select("id, product_id, buyer_name, buyer_phone, quantity, amount, currency, status, created_at")
                .eq("designer_id", user.id)
                .order("created_at", { ascending: false });

            const productIds = [...new Set((ordersData ?? []).map(o => o.product_id))];

            const { data: productsData } = productIds.length > 0
                ? await supabase.from("products").select("id, name").in("id", productIds)
                : { data: [] };

            const productMap: Record<string, string> = {};
            (productsData ?? []).forEach(p => { productMap[p.id] = p.name; });

            const list: Order[] = (ordersData ?? []).map(o => ({
                id: o.id,
                productId: o.product_id,
                productName: productMap[o.product_id] ?? "Unknown Product",
                buyerName: o.buyer_name,
                buyerPhone: o.buyer_phone,
                quantity: o.quantity,
                amount: o.amount,
                currency: o.currency,
                status: o.status,
                createdAt: o.created_at,
            }));

            setOrders(list);
            setLoading(false);
        };

        load();
    }, [router]);

    const markFulfilled = async (orderId: string) => {
        setUpdatingId(orderId);
        const { error } = await supabase
            .from("orders")
            .update({ status: "fulfilled" })
            .eq("id", orderId);

        if (!error) {
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: "fulfilled" } : o))
            );
        }
        setUpdatingId(null);
    };

    const contactBuyer = (order: Order) => {
        const message = `Hi ${order.buyerName}, this is regarding your order for ${order.productName}. `;
        const phone = order.buyerPhone.replace(/\D/g, "");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    };

    const toFulfill = orders.filter(o => o.status === "paid");
    const fulfilled = orders.filter(o => o.status === "fulfilled");
    const activeList = tab === "to_fulfill" ? toFulfill : tab === "fulfilled" ? fulfilled : orders;

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
                        href="/designer-dashboard/store"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <p className="text-lg font-bold text-gray-900">Orders</p>
                </div>
            </header>

            <div className="px-5 pt-4">
                <div className="flex gap-1 rounded-full bg-gray-100 p-1">
                    <button
                        onClick={() => setTab("to_fulfill")}
                        className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${tab === "to_fulfill" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                            }`}
                    >
                        To Fulfill ({toFulfill.length})
                    </button>
                    <button
                        onClick={() => setTab("fulfilled")}
                        className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${tab === "fulfilled" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                            }`}
                    >
                        Fulfilled ({fulfilled.length})
                    </button>
                    <button
                        onClick={() => setTab("all")}
                        className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${tab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                            }`}
                    >
                        All ({orders.length})
                    </button>
                </div>
            </div>

            <div className="px-5 py-4">
                {activeList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                        <Package size={24} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-700">No orders here yet</p>
                        <p className="mt-1 text-xs text-gray-400">
                            Paid orders from your storefront will show up here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {activeList.map((order) => (
                            <div key={order.id} className="rounded-2xl bg-white p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {order.productName}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-gray-500">
                                            {order.buyerName} · Qty {order.quantity}
                                        </p>
                                    </div>
                                    <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-500"
                                        }`}>
                                        {STATUS_LABELS[order.status] ?? order.status}
                                    </span>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatCurrency(order.amount, order.currency)}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                                        })}
                                    </span>
                                </div>

                                {(order.status === "paid" || order.status === "fulfilled") && (
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => contactBuyer(order)}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-700"
                                        >
                                            <MessageCircle size={13} />
                                            Contact Buyer
                                        </button>
                                        {order.status === "paid" && (
                                            <button
                                                onClick={() => markFulfilled(order.id)}
                                                disabled={updatingId === order.id}
                                                className="flex-1 rounded-xl bg-gray-900 py-2 text-xs font-semibold text-white disabled:opacity-60"
                                            >
                                                {updatingId === order.id ? "Updating..." : "Mark Fulfilled"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
