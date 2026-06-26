"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Home, Package, Ruler, Store,
    Receipt, User, Plus, ExternalLink, Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Product = {
    id: string;
    name: string;
    price: number;
    currency: string;
    hero_media: string | null;
    hero_media_type: string | null;
    active: boolean;
    slug: string;
};

type Designer = {
    brand_name: string | null;
    slug: string | null;
    profile_image: string | null;
    location: string | null;
    business_location: string | null;
};

export default function StorePage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [designer, setDesigner] = useState<Designer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }

            const [{ data: designerData }, { data: productsData }] = await Promise.all([
                supabase
                    .from("designers")
                    .select("brand_name, slug, profile_image, location, business_location")
                    .eq("id", user.id)
                    .single(),
                supabase
                    .from("products")
                    .select("id, name, price, currency, hero_media, hero_media_type, active, slug")
                    .eq("designer_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(5),
            ]);

            setDesigner(designerData);
            setProducts(productsData ?? []);
            setLoading(false);
        };

        load();
    }, [router]);

    const storeSlug = designer?.slug ?? "";
    const storeUrl = `fithouse.africa/store/${storeSlug}`;

    const [storeFullUrl, setStoreFullUrl] = useState("");

    useEffect(() => {
        if (storeSlug) {
            setStoreFullUrl(`${window.location.origin}/store/${storeSlug}`);
        }
    }, [storeSlug]);

    const handleShare = async () => {
        if (!storeFullUrl) return;

        if (navigator.share) {
            await navigator.share({
                title: designer?.brand_name ?? "My FitHouse Store",
                text: "Check out my fashion store on FitHouseAfrica",
                url: storeFullUrl,
            });
        } else {
            await navigator.clipboard.writeText(storeFullUrl);
            alert("Store link copied!");
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#fafafa] pb-28">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold">Storefront</h1>
                    <p className="text-sm text-gray-500">Manage products & store</p>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* STORE LINK CARD */}
                <div className="rounded-[8px] bg-black p-5 text-white">
                    <p className="text-xs text-gray-400">Your Store Link</p>
                    <h3 className="mt-1 text-base font-semibold leading-snug">
                        {storeSlug ? storeUrl : "Set up your store slug →"}
                    </h3>
                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={handleShare}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-black"
                        >
                            <ExternalLink size={15} />
                            Share Store
                        </button>
                        <Link
                            href="/designer-dashboard/store/preview"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-600 py-3 text-sm font-medium text-white"
                        >
                            <Eye size={15} />
                            Preview
                        </Link>
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/designer-dashboard/add-product"
                            className="rounded-[8px] bg-emerald-600 p-5 text-left text-white"
                        >
                            <Plus size={22} />
                            <p className="mt-4 font-medium">Add Product</p>
                            <p className="text-sm text-emerald-100">Upload to storefront</p>
                        </Link>

                        <Link
                            href="/designer-dashboard/store/edit"
                            className="rounded-[8px] bg-white p-5 text-left shadow-sm"
                        >
                            <Store size={22} />
                            <p className="mt-4 font-medium">Edit Store</p>
                            <p className="text-sm text-gray-500">Customize storefront</p>
                        </Link>
                    </div>
                </div>

                {/* MARKETPLACE INFO */}
                <div className="mt-8 rounded-[8px] bg-emerald-50 p-5">
                    <h3 className="font-semibold text-emerald-700">Marketplace Sync</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                        Products uploaded to your storefront automatically appear on
                        FitHouse marketplace based on selected category, price, location
                        and style.
                    </p>
                </div>

                {/* PRODUCT LIST */}
                <div className="mt-10">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Your Products</h3>
                        <Link
                            href="/designer-dashboard/store/products"
                            className="text-sm text-emerald-600"
                        >
                            View All
                        </Link>
                    </div>

                    {products.length === 0 ? (
                        <div className="rounded-[8px] border border-dashed border-gray-300 bg-white p-8 text-center">
                            <p className="font-medium text-gray-700">No products yet</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Tap "Add Product" to upload your first piece.
                            </p>
                            <Link
                                href="/designer-dashboard/add-product"
                                className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white"
                            >
                                Add Product
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="overflow-hidden rounded-[8px] bg-white shadow-sm"
                                >
                                    <div className="flex items-center gap-4 p-4">
                                        {/* THUMBNAIL */}
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[8px] bg-gray-100">
                                            {product.hero_media ? (
                                                product.hero_media_type === "video" ? (
                                                    <video
                                                        src={product.hero_media}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={product.hero_media}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                )
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </div>

                                        {/* INFO */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="truncate font-semibold">
                                                {product.name}
                                            </h4>
                                            <p className="mt-1 text-sm font-semibold text-emerald-600">
                                                {product.currency}{" "}
                                                {Number(product.price).toLocaleString()}
                                            </p>
                                            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${product.active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {product.active ? "Live" : "Hidden"}
                                            </span>
                                        </div>

                                        {/* EDIT */}
                                        <Link
                                            href={`/designer-dashboard/store/edit-product/${product.id}`}
                                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* BOTTOM NAV */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
                <div className="mx-auto flex max-w-md items-center justify-between px-6 py-4">
                    <NavItem href="/designer-dashboard" icon={<Home size={20} />} label="Home" />
                    <NavItem href="/designer-dashboard/orders" icon={<Package size={20} />} label="Orders" />
                    <NavItem href="/designer-dashboard/measurements" icon={<Ruler size={20} />} label="Measure" />
                    <NavItem href="/designer-dashboard/store" icon={<Store size={20} />} label="Store" active />
                    <NavItem href="/designer-dashboard/invoice" icon={<Receipt size={20} />} label="Invoice" />
                    <NavItem href="/designer-dashboard/profile" icon={<User size={20} />} label="Profile" />
                </div>
            </nav>
        </main>
    );
}

function NavItem({
    href, icon, label, active = false,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-1 ${active ? "text-emerald-600" : "text-gray-500"}`}
        >
            {icon}
            <span className="text-xs">{label}</span>
        </Link>
    );
}