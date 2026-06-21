"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Designer = {
    brand_name: string | null;
    slug: string | null;
    bio: string | null;
    profile_image: string | null;
    cover_image: string | null;
    location: string | null;
    business_location: string | null;
    intagram_handle: string | null;
};

type Product = {
    id: string;
    name: string;
    price: number;
    currency: string;
    hero_media: string | null;
    hero_media_type: string | null;
};

export default function PreviewStorePage() {
    const router = useRouter();
    const [designer, setDesigner] = useState<Designer | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }

            const [{ data: designerData }, { data: productsData }] = await Promise.all([
                supabase
                    .from("designers")
                    .select("brand_name, slug, bio, profile_image, cover_image, location, business_location, intagram_handle")
                    .eq("id", user.id)
                    .single(),
                supabase
                    .from("products")
                    .select("id, name, price, currency, hero_media, hero_media_type")
                    .eq("designer_id", user.id)
                    .eq("active", true)
                    .order("created_at", { ascending: false }),
            ]);

            setDesigner(designerData);
            setProducts(productsData ?? []);
            setLoading(false);
        };

        load();
    }, [router]);

    const storeSlug = designer?.slug ?? "";
    const storeFullUrl = `${window?.location?.origin}/store/${storeSlug}`;
    const displayLocation = designer?.business_location ?? designer?.location ?? "Nigeria";

    const handleShare = async () => {
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
            <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/designer-dashboard/store"
                            className="rounded-[12px] border border-gray-200 p-2"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <p className="text-xs text-gray-500">Store Preview</p>
                            <h1 className="font-semibold">
                                {designer?.brand_name ?? "Your Store"}
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={handleShare}
                        className="rounded-[12px] bg-black px-4 py-2 text-sm text-white"
                    >
                        Share
                    </button>
                </div>
            </header>

            {/* BROWSER BAR */}
            <section className="px-5 pt-4">
                <div className="rounded-[12px] border border-gray-200 bg-white px-4 py-3">
                    <p className="truncate text-sm text-gray-400">
                        fithouse.africa/store/{storeSlug || "your-store"}
                    </p>
                </div>
            </section>

            {/* COVER IMAGE */}
            {designer?.cover_image && (
                <section className="mt-4 px-5">
                    <div className="h-36 w-full overflow-hidden rounded-[16px] bg-gray-100">
                        <img
                            src={designer.cover_image}
                            alt="Cover"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </section>
            )}

            {/* BRAND PROFILE */}
            <section className="mt-4 px-5">
                <div className="rounded-[16px] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                            {designer?.profile_image ? (
                                <img
                                    src={designer.profile_image}
                                    alt="Logo"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-2xl font-bold text-emerald-600">
                                    {designer?.brand_name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">
                                {designer?.brand_name ?? "Your Brand Name"}
                            </h2>
                            {displayLocation && (
                                <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                                    <MapPin size={12} />
                                    {displayLocation}
                                </p>
                            )}
                            {designer?.intagram_handle && (
                                <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-400">
                                    <span className="text-xs">@</span>
                                    @{designer.intagram_handle}
                                </p>
                            )}
                        </div>
                    </div>

                    {designer?.bio && (
                        <p className="mt-4 text-sm leading-relaxed text-gray-600">
                            {designer.bio}
                        </p>
                    )}

                    <div className="mt-5 flex gap-3">
                        <button className="flex-1 rounded-[12px] bg-emerald-600 py-3 text-sm font-medium text-white">
                            Contact Designer
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center rounded-[12px] border border-gray-200 px-4"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* PRODUCTS */}
            <section className="mt-6 px-5">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">Products</h3>
                    <p className="text-sm text-gray-500">{products.length} item{products.length !== 1 ? "s" : ""}</p>
                </div>

                {products.length === 0 ? (
                    <div className="rounded-[16px] border border-dashed border-gray-300 bg-white p-8 text-center">
                        <h3 className="font-medium">No products yet</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Products you upload will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {products.map((product) => (
                            <div key={product.id} className="overflow-hidden rounded-[16px] bg-white shadow-sm">
                                <div className="h-[140px] w-full bg-gray-100">
                                    {product.hero_media ? (
                                        product.hero_media_type === "video" ? (
                                            <video src={product.hero_media} className="h-full w-full object-cover" />
                                        ) : (
                                            <img src={product.hero_media} alt={product.name} className="h-full w-full object-cover" />
                                        )
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-300 text-3xl">👗</div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h4 className="truncate text-sm font-semibold">{product.name}</h4>
                                    <p className="mt-1 text-sm font-bold text-emerald-600">
                                        {product.currency} {Number(product.price).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* VISIT PUBLIC STORE */}
            <div className="fixed bottom-5 left-5 right-5">
                <Link
                    href={`/store/${storeSlug}`}
                    className="flex h-14 items-center justify-center gap-2 rounded-[16px] bg-black text-white shadow-lg"
                >
                    Visit Public Store
                    <ArrowLeft size={18} className="rotate-180" />
                </Link>
            </div>
        </main>
    );
}