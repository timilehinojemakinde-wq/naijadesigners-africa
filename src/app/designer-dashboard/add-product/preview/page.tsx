"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useProductDraft } from "../layout";

export default function PreviewPage() {
    const router = useRouter();
    const { draft } = useProductDraft();

    useEffect(() => {
        if (!draft) {
            router.push("/designer-dashboard/add-product");
        }
    }, [draft, router]);

    const handlePublish = () => {
        router.push("/designer-dashboard/add-product/publish");
    };

    if (!draft) return null;

    const hero = draft.media[0];
    const gallery = draft.media.slice(1);

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="sticky top-0 border-b bg-white">
                <div className="flex items-center gap-3 px-5 py-4">
                    <button
                        onClick={() => router.back()}
                        className="rounded-[12px] border p-2"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h1 className="text-lg font-bold">Preview Product</h1>
                        <p className="text-sm text-gray-500">
                            This is how customers will see it
                        </p>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-md px-5 py-6">
                {/* HERO MEDIA */}
                <div className="overflow-hidden rounded-[12px] bg-white shadow-sm">
                    {hero?.type === "video" ? (
                        <video
                            src={hero.preview}
                            controls
                            className="h-[320px] w-full object-contain"
                        />
                    ) : (
                        <img
                            src={hero?.preview}
                            alt={draft.name}
                            className="h-[320px] w-full object-contain"
                        />
                    )}
                </div>

                {/* GALLERY */}
                {gallery.length > 0 && (
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                        {gallery.map((item, i) => (
                            <div
                                key={i}
                                className="h-[80px] w-[80px] flex-shrink-0 overflow-hidden rounded-[12px] border bg-white"
                            >
                                {item.type === "video" ? (
                                    <video src={item.preview} className="h-full w-full object-cover" />
                                ) : (
                                    <img src={item.preview} alt="" className="h-full w-full object-cover" />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* PRODUCT DETAILS CARD */}
                <div className="mt-4 rounded-[12px] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="text-xl font-bold">{draft.name}</h2>
                        <span className="whitespace-nowrap text-xl font-bold text-emerald-600">
                            {draft.currency} {Number(draft.price).toLocaleString()}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {draft.category && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                {draft.category}
                            </span>
                        )}
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
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
                </div>

                {/* NOTICE BANNER */}
                <div className="mt-4 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm text-amber-800">
                        👆 This is exactly how customers will see your product on your store.
                    </p>
                </div>

                {/* ACTIONS */}
                <button
                    onClick={handlePublish}
                    className="mt-6 h-14 w-full rounded-[12px] bg-emerald-600 font-semibold text-white"
                >
                    Publish to Store
                </button>

                <button
                    onClick={() => router.back()}
                    className="mt-3 h-12 w-full rounded-[12px] border border-gray-300 text-sm font-medium text-gray-700"
                >
                    Edit Product
                </button>
            </section>
        </main>
    );
}