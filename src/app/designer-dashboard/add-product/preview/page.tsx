"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatCurrency } from "@/lib/formatCurrency";
import { useProductDraft } from "../layout";

export default function PreviewProductPage() {
    const router = useRouter();
    const { draft, clearDraft } = useProductDraft();
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!draft) {
            router.replace("/designer-dashboard/add-product");
        }
    }, [draft, router]);

    if (!draft) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    const hero = draft.media[0];

    const handlePublish = async () => {
        setError("");
        setPublishing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const mediaPayload = draft.media
                .filter((m) => m.status === "done" && m.url)
                .map((m) => ({ type: m.type, url: m.url }));

            const { error: insertError } = await supabase.from("products").insert({
                designer_id: user.id,
                name: draft.name.trim(),
                description: draft.description.trim() || null,
                category: draft.category || null,
                product_type: draft.productType,
                media: mediaPayload,
                hero_media: mediaPayload[0]?.url ?? null,
                hero_media_type: mediaPayload[0]?.type ?? null,
                currency: draft.currency,
                price: Number(draft.price),
                active: true,
            });

            if (insertError) throw insertError;

            clearDraft();
            router.push("/designer-dashboard/store");
        } catch (err: any) {
            setError("Failed to publish: " + err.message);
            setPublishing(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-28">
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/designer-dashboard/add-product")}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-gray-900">Preview Product</h1>
                        <p className="text-xs text-gray-400">This is how it'll look to customers</p>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-5">

                <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="aspect-[3/4] w-full bg-gray-100">
                        {hero?.type === "video" ? (
                            <video src={hero.preview} controls className="h-full w-full object-cover" />
                        ) : hero ? (
                            <img src={hero.preview} alt={draft.name} className="h-full w-full object-cover" />
                        ) : null}
                    </div>

                    {draft.media.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto p-3">
                            {draft.media.slice(1).map((m) => (
                                <div key={m.id} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                                    {m.type === "video" ? (
                                        <video src={m.preview} className="h-full w-full object-cover" />
                                    ) : (
                                        <img src={m.preview} alt="" className="h-full w-full object-cover" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">{draft.name}</h2>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                        {formatCurrency(Number(draft.price) || 0, draft.currency)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {draft.category && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                {draft.category}
                            </span>
                        )}
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {draft.productType === "ready-made"
                                ? "Ready Made"
                                : draft.productType === "custom"
                                    ? "Custom Measurement"
                                    : "Ready Made & Custom"}
                        </span>
                    </div>

                    {draft.description && (
                        <p className="mt-4 text-sm leading-relaxed text-gray-600">
                            {draft.description}
                        </p>
                    )}
                </section>

                {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 py-4">
                <div className="mx-auto max-w-md space-y-2">
                    <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {publishing ? (
                            <><Loader2 size={16} className="animate-spin" /> Publishing...</>
                        ) : (
                            "Publish to Store"
                        )}
                    </button>
                    <button
                        onClick={() => router.push("/designer-dashboard/add-product")}
                        className="flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
                    >
                        Edit Details
                    </button>
                </div>
            </div>
        </main>
    );
}
