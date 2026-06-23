"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Share2, Copy, Check,
    Briefcase, Plus, Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Style = {
    id: string;
    title: string | null;
    category: string | null;
    images: string[] | null;
    notes: string | null;
    is_published: boolean;
    created_at: string;
};

export default function StyleDetailPage() {
    const router = useRouter();
    const params = useParams();
    const styleId = params.id as string;

    const [style, setStyle] = useState<Style | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [designerSlug, setDesignerSlug] = useState("");

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const [{ data: styleData }, { data: designerData }] = await Promise.all([
                supabase
                    .from("styles")
                    .select("*")
                    .eq("id", styleId)
                    .eq("designer_id", user.id)
                    .single(),
                supabase
                    .from("designers")
                    .select("slug")
                    .eq("id", user.id)
                    .single(),
            ]);

            if (!styleData) {
                router.push("/designer-dashboard/style-library");
                return;
            }

            setStyle(styleData);
            setDesignerSlug(designerData?.slug ?? "");
            setLoading(false);
        };

        load();
    }, [styleId, router]);

    const togglePublished = async () => {
        if (!style) return;
        setPublishing(true);

        const { error } = await supabase
            .from("styles")
            .update({ is_published: !style.is_published })
            .eq("id", style.id);

        if (!error) {
            setStyle((prev) => prev ? { ...prev, is_published: !prev.is_published } : prev);
        }

        setPublishing(false);
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/catalogue/${designerSlug}`;
        if (navigator.share) {
            await navigator.share({
                title: style?.title ?? "Style",
                text: "Check out this style from my collection",
                url,
            });
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDelete = async () => {
        if (!style) return;
        if (!confirm("Delete this style? This cannot be undone.")) return;

        await supabase.from("styles").delete().eq("id", style.id);
        router.push("/designer-dashboard/style-library");
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    if (!style) return null;

    const images = style.images ?? [];

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/designer-dashboard/style-library"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="text-base font-bold text-gray-900">
                                {style.title ?? "Style Detail"}
                            </h1>
                            {style.category && (
                                <p className="text-xs text-gray-400">{style.category}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-400"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-4">

                {/* IMAGES */}
                {images.length > 0 && (
                    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
                            <img
                                src={images[activeImage]}
                                alt={style.title ?? "Style"}
                                className="h-full w-full object-cover"
                            />
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`h-1.5 rounded-full transition-all ${i === activeImage
                                                    ? "w-4 bg-white"
                                                    : "w-1.5 bg-white/50"
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto p-3">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${i === activeImage
                                                ? "border-gray-900"
                                                : "border-transparent"
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* NOTES */}
                {style.notes && (
                    <section className="rounded-2xl bg-white p-5 shadow-sm">
                        <h3 className="mb-2 text-sm font-bold text-gray-900">Notes</h3>
                        <p className="text-sm leading-relaxed text-gray-600">
                            {style.notes}
                        </p>
                    </section>
                )}

                {/* VISIBILITY TOGGLE */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Catalogue Visibility
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-400">
                                {style.is_published
                                    ? "Visible in your shared catalogue"
                                    : "Private — only you can see this"}
                            </p>
                        </div>
                        <button
                            onClick={togglePublished}
                            disabled={publishing}
                            className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${style.is_published ? "bg-emerald-600" : "bg-gray-200"
                                }`}
                        >
                            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${style.is_published ? "translate-x-5" : "translate-x-0.5"
                                }`} />
                        </button>
                    </div>
                </section>

                {/* ACTIONS */}
                <div className="space-y-2.5">
                    <Link
                        href={`/designer-dashboard/jobs/new?styleId=${style.id}`}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white"
                    >
                        <Briefcase size={16} />
                        Use This Style in a New Job
                    </Link>

                    <button
                        onClick={handleShare}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700"
                    >
                        {copied ? (
                            <><Check size={16} className="text-emerald-600" /> Copied!</>
                        ) : (
                            <><Share2 size={16} /> Share Catalogue Link</>
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
}