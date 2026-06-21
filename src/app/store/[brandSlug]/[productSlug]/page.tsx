"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type MediaItem = {
    url: string;
    type: "image" | "video";
};

type Product = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    made_to_measure: boolean;
    hero_media: string | null;
    hero_media_type: string | null;
    sub_image_1: string | null;
    sub_image_2: string | null;
    sub_image_3: string | null;
    category_id: string | null;
};

type Designer = {
    id: string;
    brand_name: string | null;
    profile_image: string | null;
    business_location: string | null;
    slug: string | null;
};

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const brandSlug = params.brandSlug as string;
    const productSlug = params.productSlug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [designer, setDesigner] = useState<Designer | null>(null);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    useEffect(() => {
        const load = async () => {
            // Load designer by slug
            const { data: designerData, error: designerError } = await supabase
                .from("designers")
                .select("id, brand_name, profile_image, business_location, slug")
                .eq("slug", brandSlug)
                .single();

            if (designerError || !designerData) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setDesigner(designerData);

            // Load product by slug + designer_id
            const { data: productData, error: productError } = await supabase
                .from("products")
                .select("id, name, description, price, currency, made_to_measure, hero_media, hero_media_type, sub_image_1, sub_image_2, sub_image_3, category_id")
                .eq("slug", productSlug)
                .eq("designer_id", designerData.id)
                .eq("active", true)
                .single();

            if (productError || !productData) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setProduct(productData);

            // Build media array
            const mediaItems: MediaItem[] = [];
            if (productData.hero_media) {
                mediaItems.push({
                    url: productData.hero_media,
                    type: (productData.hero_media_type as "image" | "video") ?? "image",
                });
            }
            if (productData.sub_image_1) mediaItems.push({ url: productData.sub_image_1, type: "image" });
            if (productData.sub_image_2) mediaItems.push({ url: productData.sub_image_2, type: "image" });
            if (productData.sub_image_3) mediaItems.push({ url: productData.sub_image_3, type: "image" });

            setMedia(mediaItems);
            setLoading(false);
        };

        load();
    }, [brandSlug, productSlug]);

    // Swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                setActiveIndex((prev) => Math.min(prev + 1, media.length - 1));
            } else {
                setActiveIndex((prev) => Math.max(prev - 1, 0));
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({
                title: product?.name ?? "Check this out",
                text: `Check out ${product?.name} on FitHouseAfrica`,
                url,
            });
        } else {
            await navigator.clipboard.writeText(url);
            alert("Link copied!");
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
            </main>
        );
    }

    if (notFound || !product || !designer) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-5 text-center">
                <h1 className="text-xl font-bold">Product not found</h1>
                <p className="mt-2 text-sm text-gray-500">
                    This product may have been removed or the link is incorrect.
                </p>
                <Link
                    href={`/store/${brandSlug}`}
                    className="mt-6 rounded-[12px] bg-black px-6 py-3 text-sm font-medium text-white"
                >
                    View Store
                </Link>
            </main>
        );
    }

    const currentMedia = media[activeIndex];
    const isCustom = product.made_to_measure;

    return (
        <main className="min-h-screen bg-[#fafafa]">
            {/* FLOATING HEADER */}
            <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-4">
                <button
                    onClick={() => router.back()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
                >
                    <ArrowLeft size={18} />
                </button>
                <button
                    onClick={handleShare}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
                >
                    <Share2 size={18} />
                </button>
            </div>

            {/* MEDIA CAROUSEL */}
            <div
                className="relative h-[420px] w-full overflow-hidden bg-gray-100"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {currentMedia ? (
                    currentMedia.type === "video" ? (
                        <video
                            key={currentMedia.url}
                            src={currentMedia.url}
                            controls
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <img
                            key={currentMedia.url}
                            src={currentMedia.url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    )
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-6xl">
                        👗
                    </div>
                )}

                {/* PREV / NEXT ARROWS (desktop) */}
                {media.length > 1 && (
                    <>
                        <button
                            onClick={() => setActiveIndex((p) => Math.max(p - 1, 0))}
                            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setActiveIndex((p) => Math.min(p + 1, media.length - 1))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </>
                )}

                {/* DOTS INDICATOR */}
                {media.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                        {media.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`h-1.5 rounded-full transition-all ${i === activeIndex
                                    ? "w-5 bg-white"
                                    : "w-1.5 bg-white/50"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* MEDIA COUNT */}
                {media.length > 1 && (
                    <div className="absolute right-4 top-16 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
                        {activeIndex + 1}/{media.length}
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="rounded-t-[28px] bg-white -mt-6 relative z-10 px-5 pt-6 pb-40">
                {/* NAME + PRICE */}
                <div className="flex items-start justify-between gap-3">
                    <h1 className="text-2xl font-bold leading-tight flex-1">
                        {product.name}
                    </h1>
                    <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-emerald-600">
                            {product.currency}{" "}
                            {Number(product.price).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* BADGES */}
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {isCustom ? "Custom Made" : "Ready to Wear"}
                    </span>
                    {product.made_to_measure && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                            AI Measurement Available
                        </span>
                    )}
                </div>

                {/* DESCRIPTION */}
                {product.description && (
                    <div className="mt-5">
                        <h3 className="text-sm font-semibold text-gray-700">
                            About this piece
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                            {product.description}
                        </p>
                    </div>
                )}

                {/* DESIGNER CARD */}
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700">
                        Designer
                    </h3>
                    <Link
                        href={`/store/${brandSlug}`}
                        className="mt-3 flex items-center gap-3 rounded-[16px] border border-gray-100 bg-gray-50 p-4"
                    >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                            {designer.profile_image ? (
                                <img
                                    src={designer.profile_image}
                                    alt={designer.brand_name ?? ""}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-emerald-600 text-lg font-bold text-white">
                                    {designer.brand_name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">
                                {designer.brand_name}
                            </p>
                            {designer.business_location && (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin size={10} />
                                    {designer.business_location}
                                </p>
                            )}
                        </div>
                        <span className="text-xs text-gray-400">View Store →</span>
                    </Link>
                </div>

                {/* MEASUREMENT NOTE */}
                {product.made_to_measure && (
                    <div className="mt-5 rounded-[14px] border border-blue-100 bg-blue-50 p-4">
                        <p className="text-sm font-medium text-blue-800">
                            📏 Custom measurements available
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-blue-600">
                            After ordering, the designer will send you an AI measurement link.
                            Scan yourself in 60 seconds — no tape measure needed.
                        </p>
                    </div>
                )}
            </div>

            {/* STICKY BOTTOM CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white px-5 py-4">
                {product.made_to_measure ? (
                    <div className="flex gap-3">
                        <button className="flex-1 rounded-[12px] bg-emerald-600 py-4 font-semibold text-white">
                            Request Custom Order
                        </button>
                        <button className="rounded-[12px] border border-gray-200 px-4 py-4">
                            <Share2 size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <button className="flex-1 rounded-[12px] bg-emerald-600 py-4 font-semibold text-white">
                            Buy Now
                        </button>
                        <button
                            onClick={handleShare}
                            className="rounded-[12px] border border-gray-200 px-4 py-4"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>
                )}
                <p className="mt-2 text-center text-xs text-gray-400">
                    Secure payment · Protected by FitHouseAfrica
                </p>
            </div>
        </main>
    );
}