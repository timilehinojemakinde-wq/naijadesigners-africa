"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Share2, Copy, Check, Package, ClipboardList, Settings, Eye } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatCurrency } from "@/lib/formatCurrency";
import BottomNav from "@/components/dashboard/BottomNav";

type Product = {
    id: string;
    name: string;
    price: number;
    currency: string;
    hero_media: string | null;
    hero_media_type: string | null;
    active: boolean;
};

export default function StorePage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [designerSlug, setDesignerSlug] = useState("");
    const [totalSales, setTotalSales] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [currency, setCurrency] = useState("NGN");
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const [{ data: designerData }, { data: productsData }, { data: ordersData }] = await Promise.all([
                supabase.from("designers").select("slug").eq("id", user.id).single(),
                supabase
                    .from("products")
                    .select("id, name, price, currency, hero_media, hero_media_type, active")
                    .eq("designer_id", user.id)
                    .order("created_at", { ascending: false }),
                supabase
                    .from("orders")
                    .select("amount, currency, status")
                    .eq("designer_id", user.id),
            ]);

            setDesignerSlug(designerData?.slug ?? "");
            setProducts(productsData ?? []);

            const orders = ordersData ?? [];
            const paidOrders = orders.filter(o => o.status === "paid" || o.status === "fulfilled");
            setTotalSales(paidOrders.reduce((s, o) => s + Number(o.amount || 0), 0));
            setPendingOrders(orders.filter(o => o.status === "paid").length);
            setCurrency(orders[0]?.currency ?? "NGN");

            setLoading(false);
        };

        load();
    }, [router]);

    const storeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/store/${designerSlug}`;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: "My Store",
                text: "Shop my collection",
                url: storeUrl,
            });
        } else {
            await navigator.clipboard.writeText(storeUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
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
            <header className="bg-white px-5 pt-12 pb-4">
                <h1 className="text-xl font-bold text-gray-900">Store</h1>
                <p className="mt-0.5 text-xs text-gray-400">
                    {products.length} product{products.length !== 1 ? "s" : ""} ·{" "}
                    {products.filter(p => p.active).length} live
                </p>
            </header>

            <div className="px-5 py-4 space-y-4">

                {/* SALES HERO CARD */}
                <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                                Total Sales
                            </p>
                            <p className="mt-1.5 truncate text-2xl font-bold text-white">
                                {formatCurrency(totalSales, currency)}
                            </p>
                        </div>
                        <div className="mx-4 h-10 w-px flex-shrink-0 bg-white/10" />
                        <Link href="/designer-dashboard/store/orders" className="min-w-0 text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                                To Fulfill
                            </p>
                            <p className="mt-1.5 truncate text-2xl font-bold text-amber-400">
                                {pendingOrders}
                            </p>
                        </Link>
                    </div>
                </div>

                {/* STORE LINK */}
                {designerSlug && (
                    <button
                        onClick={handleShare}
                        className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Share2 size={15} className="flex-shrink-0 text-gray-500" />
                            <div className="min-w-0 text-left">
                                <p className="text-xs font-semibold text-gray-900">Share Store Link</p>
                                <p className="truncate text-[11px] text-gray-400">{storeUrl}</p>
                            </div>
                        </div>
                        {copied ? (
                            <Check size={15} className="flex-shrink-0 text-emerald-600" />
                        ) : (
                            <Copy size={15} className="flex-shrink-0 text-gray-400" />
                        )}
                    </button>
                )}

                {/* QUICK ACTIONS */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/designer-dashboard/add-product"
                        className="flex items-center gap-3 rounded-2xl bg-gray-900 p-4 text-white"
                    >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                            <Plus size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Add Product</p>
                            <p className="text-xs text-gray-400">New listing</p>
                        </div>
                    </Link>

                    <Link
                        href="/designer-dashboard/store/orders"
                        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4"
                    >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
                            <ClipboardList size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Orders</p>
                            <p className="text-xs text-gray-400">Track & fulfill</p>
                        </div>
                    </Link>

                    <Link
                        href="/designer-dashboard/store/edit"
                        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4"
                    >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                            <Settings size={16} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Edit Store</p>
                            <p className="text-xs text-gray-400">Brand info</p>
                        </div>
                    </Link>

                    <Link
                        href={`/store/${designerSlug}`}
                        target="_blank"
                        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4"
                    >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                            <Eye size={16} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Preview</p>
                            <p className="text-xs text-gray-400">Public view</p>
                        </div>
                    </Link>
                </div>

                {/* PRODUCTS */}
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                        Products
                    </p>

                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                                <Package size={28} className="text-gray-400" />
                            </div>
                            <h2 className="text-base font-semibold text-gray-900">No products yet</h2>
                            <p className="mt-1.5 max-w-xs text-sm text-gray-400">
                                Add your first piece to start selling.
                            </p>
                            <Link
                                href="/designer-dashboard/add-product"
                                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
                            >
                                <Plus size={15} /> Add Product
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/designer-dashboard/store/edit-product/${product.id}`}
                                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                                >
                                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
                                        {product.hero_media ? (
                                            product.hero_media_type === "video" ? (
                                                <video src={product.hero_media} className="h-full w-full object-cover" />
                                            ) : (
                                                <img src={product.hero_media} alt={product.name} className="h-full w-full object-cover" />
                                            )
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package size={24} className="text-gray-300" />
                                            </div>
                                        )}
                                        {!product.active && (
                                            <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                                                Hidden
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {product.name}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-gray-900">
                                            {formatCurrency(Number(product.price), product.currency)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </main>
    );
}
