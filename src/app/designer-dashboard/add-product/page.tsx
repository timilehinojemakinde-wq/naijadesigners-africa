"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { compressWithTimeout } from "@/lib/compressImage";
import { validateVideo } from "@/lib/validateVideo";
import { uploadMediaFile } from "@/lib/uploadMedia";
import { useProductDraft } from "./layout";
import type { MediaItem } from "./layout";

const CATEGORIES = [
    "Agbada", "Senator", "Aso Ebi", "Native Wear", "Bridal", "Wedding",
    "Luxury", "Corporate", "Casual", "Streetwear", "Ready to Wear",
    "Kids Wear", "Women's Wear", "Men's Wear", "Unisex",
];

export default function AddProductPage() {
    const router = useRouter();
    const { draft, setDraft } = useProductDraft();

    const [media, setMedia] = useState<MediaItem[]>(draft?.media ?? []);
    const [name, setName] = useState(draft?.name ?? "");
    const [description, setDescription] = useState(draft?.description ?? "");
    const [category, setCategory] = useState(draft?.category ?? "");
    const [productType, setProductType] = useState(draft?.productType ?? "both");
    const [currency, setCurrency] = useState(draft?.currency ?? "NGN");
    const [price, setPrice] = useState(draft?.price ?? "");

    // Process (compress/validate) then upload one file in the background
    const processAndUpload = async (id: string, file: File, type: "image" | "video") => {
        try {
            let processedFile = file;

            if (type === "image") {
                processedFile = await compressWithTimeout(file);
            } else {
                const validation = await validateVideo(file);
                if (!validation.valid) {
                    setMedia((prev) =>
                        prev.map((m) =>
                            m.id === id ? { ...m, status: "error", error: validation.reason } : m
                        )
                    );
                    return;
                }
            }

            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error("You must be logged in to upload media.");
            }

            const url = await uploadMediaFile(processedFile, user.id);

            setMedia((prev) =>
                prev.map((m) =>
                    m.id === id ? { ...m, status: "done", url, file: processedFile } : m
                )
            );
        } catch (err: any) {
            setMedia((prev) =>
                prev.map((m) =>
                    m.id === id ? { ...m, status: "error", error: err.message } : m
                )
            );
        }
    };

    const retryUpload = (item: MediaItem) => {
        setMedia((prev) =>
            prev.map((m) => (m.id === item.id ? { ...m, status: "uploading", error: undefined } : m))
        );
        processAndUpload(item.id, item.file, item.type);
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remainingSlots = 4 - media.length;
        const selectedFiles = files.slice(0, remainingSlots);

        for (const file of selectedFiles) {
            const id =
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`;

            const type: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
            const preview = URL.createObjectURL(file);

            const newItem: MediaItem = {
                id,
                file,
                preview,
                type,
                status: "uploading",
            };

            setMedia((prev) => [...prev, newItem]);
            processAndUpload(id, file, type);
        }

        e.target.value = "";
    };

    const removeMedia = (id: string) => {
        setMedia((prev) => {
            const item = prev.find((m) => m.id === id);
            if (item) URL.revokeObjectURL(item.preview);
            return prev.filter((m) => m.id !== id);
        });
    };

    const heroMedia = media[0];
    const isUploading = media.some((m) => m.status === "uploading");
    const hasError = media.some((m) => m.status === "error");

    const handleContinue = () => {
        if (!media.length) {
            alert("Please upload at least one product image or video.");
            return;
        }
        if (!name.trim()) {
            alert("Please enter product name.");
            return;
        }
        if (isUploading) {
            alert("Please wait for all media to finish uploading.");
            return;
        }
        if (hasError) {
            alert("One or more media files failed to upload. Please retry or remove them.");
            return;
        }
        if (!price || Number(price) <= 0) {
            alert("Please enter a valid price.");
            return;
        }

        setDraft({ media, name, description, category, productType, currency, price });
        router.push("/designer-dashboard/add-product/preview");
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-28">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/designer-dashboard/store")}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-gray-900">Add Product</h1>
                        <p className="text-xs text-gray-400">Upload media and product details</p>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-5">

                {/* MEDIA */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900">Product Media</h2>
                    <p className="mt-1 mb-4 text-xs text-gray-400">
                        Up to 4 photos or videos (max 30s, 25MB). First upload is your main display media.
                    </p>

                    {heroMedia ? (
                        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                            {heroMedia.type === "video" ? (
                                <video src={heroMedia.preview} controls className="h-72 w-full object-contain" />
                            ) : (
                                <img src={heroMedia.preview} alt="Hero" className="h-72 w-full object-contain" />
                            )}

                            {heroMedia.status === "uploading" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <Loader2 className="animate-spin text-white" size={28} />
                                </div>
                            )}

                            {heroMedia.status === "error" && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 px-4 text-center">
                                    <AlertCircle className="text-red-400" size={26} />
                                    <p className="text-xs text-white">{heroMedia.error}</p>
                                    <button
                                        onClick={() => retryUpload(heroMedia)}
                                        className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900"
                                    >
                                        <RotateCcw size={12} /> Retry
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-gray-400">
                            <Plus size={28} className="text-gray-400" />
                            <p className="mt-3 text-sm text-gray-500">Tap to upload product media</p>
                            <input hidden multiple type="file" accept="image/*,video/*" onChange={handleMediaUpload} />
                        </label>
                    )}

                    {media.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {media.map((item, index) => (
                                <div key={item.id} className="relative flex-shrink-0">
                                    {item.type === "video" ? (
                                        <video
                                            src={item.preview}
                                            className={`h-20 w-20 rounded-xl border object-cover ${index === 0 ? "border-gray-900" : "border-gray-200"
                                                }`}
                                        />
                                    ) : (
                                        <img
                                            src={item.preview}
                                            alt=""
                                            className={`h-20 w-20 rounded-xl border object-cover ${index === 0 ? "border-gray-900" : "border-gray-200"
                                                }`}
                                        />
                                    )}

                                    {item.status === "uploading" && (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                                            <Loader2 className="animate-spin text-white" size={16} />
                                        </div>
                                    )}

                                    {item.status === "error" && (
                                        <button
                                            onClick={() => retryUpload(item)}
                                            className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60"
                                        >
                                            <RotateCcw className="text-white" size={16} />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => removeMedia(item.id)}
                                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white"
                                    >
                                        <X size={10} />
                                    </button>

                                    {index === 0 && (
                                        <span className="absolute bottom-1 left-1 rounded-full bg-gray-900 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                                            Hero
                                        </span>
                                    )}
                                </div>
                            ))}

                            {media.length < 4 && (
                                <label className="flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
                                    <Plus size={18} className="text-gray-400" />
                                    <input hidden multiple type="file" accept="image/*,video/*" onChange={handleMediaUpload} />
                                </label>
                            )}
                        </div>
                    )}

                    {isUploading && (
                        <p className="mt-3 text-xs text-gray-400">
                            Uploading media in the background — you can keep filling the form.
                        </p>
                    )}
                </section>

                {/* DETAILS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">Product Details</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Royal Green Agbada"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                Description <span className="font-normal text-gray-400">— optional</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Luxury handmade senator outfit crafted with premium fabric for weddings, owambe and special occasions."
                                rows={4}
                                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat === category ? "" : cat)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${category === cat
                                            ? "bg-gray-900 text-white"
                                            : "border border-gray-200 text-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">Product Type</label>
                            <select
                                value={productType}
                                onChange={(e) => setProductType(e.target.value)}
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            >
                                <option value="ready-made">Ready Made</option>
                                <option value="custom">Custom Measurement</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* PRICING */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">Pricing</h2>
                    <div className="flex gap-2">
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-gray-900"
                        >
                            <option>NGN</option>
                            <option>USD</option>
                            <option>GBP</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="h-11 flex-1 rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                        />
                    </div>
                </section>
            </div>

            {/* SAVE BAR */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 py-4">
                <div className="mx-auto max-w-md">
                    <button
                        onClick={handleContinue}
                        disabled={isUploading}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {isUploading ? "Uploading media..." : "Continue to Preview"}
                    </button>
                </div>
            </div>
        </main>
    );
}
