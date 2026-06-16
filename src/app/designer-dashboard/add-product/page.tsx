"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { compressWithTimeout } from "@/lib/compressImage";
import { validateVideo } from "@/lib/validateVideo";
import { uploadMediaFile } from "@/lib/uploadMedia";
import { useProductDraft } from "./layout";
import type { MediaItem } from "./layout";

export default function AddProductPage() {
    const router = useRouter();
    const { setDraft } = useProductDraft();

    const [media, setMedia] = useState<MediaItem[]>([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [productType, setProductType] = useState("both");
    const [currency, setCurrency] = useState("NGN");
    const [price, setPrice] = useState("");

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

    // UPLOAD MEDIA — kicks off background upload immediately on selection
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

    // REMOVE MEDIA
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

        setDraft({
            media,
            name,
            description,
            category,
            productType,
            currency,
            price,
        });

        router.push("/designer-dashboard/add-product/preview");
    };

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <button
                        onClick={() => router.push("/designer-dashboard")}
                        className="rounded-[12px] border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold">Add Product</h1>
                        <p className="text-sm text-gray-500">Upload media and product details</p>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-md px-5 py-6">
                {/* MEDIA */}
                <div className="rounded-[12px] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Product Media</h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Upload up to 4 photos or videos (max 30s, 25MB).
                        First upload becomes your main display media.
                    </p>

                    {/* HERO PREVIEW */}
                    {heroMedia ? (
                        <div className="relative mt-5 overflow-hidden rounded-[12px] border border-gray-200 bg-gray-50">
                            {heroMedia.type === "video" ? (
                                <video
                                    src={heroMedia.preview}
                                    controls
                                    className="h-[320px] w-full object-contain"
                                />
                            ) : (
                                <img
                                    src={heroMedia.preview}
                                    alt="Hero"
                                    className="h-[320px] w-full object-contain"
                                />
                            )}

                            {heroMedia.status === "uploading" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <Loader2 className="animate-spin text-white" size={32} />
                                </div>
                            )}

                            {heroMedia.status === "error" && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 px-4 text-center">
                                    <AlertCircle className="text-red-400" size={28} />
                                    <p className="text-xs text-white">{heroMedia.error}</p>
                                    <button
                                        onClick={() => retryUpload(heroMedia)}
                                        className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-black"
                                    >
                                        <RotateCcw size={12} /> Retry
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <label className="mt-5 flex h-[260px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-red-400">
                            <Plus size={32} />
                            <p className="mt-3 text-sm text-gray-600">Tap to upload product media</p>
                            <input
                                hidden
                                multiple
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleMediaUpload}
                            />
                        </label>
                    )}

                    {/* SUPPORTING MEDIA */}
                    {media.length > 0 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                            {media.map((item, index) => (
                                <div key={item.id} className="relative flex-shrink-0">
                                    {item.type === "video" ? (
                                        <video
                                            src={item.preview}
                                            className={`h-[90px] w-[90px] rounded-[12px] border object-cover ${index === 0 ? "border-red-600" : "border-gray-200"
                                                }`}
                                        />
                                    ) : (
                                        <img
                                            src={item.preview}
                                            alt=""
                                            className={`h-[90px] w-[90px] rounded-[12px] border object-cover ${index === 0 ? "border-red-600" : "border-gray-200"
                                                }`}
                                        />
                                    )}

                                    {item.status === "uploading" && (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-[12px] bg-black/40">
                                            <Loader2 className="animate-spin text-white" size={18} />
                                        </div>
                                    )}

                                    {item.status === "error" && (
                                        <button
                                            onClick={() => retryUpload(item)}
                                            className="absolute inset-0 flex items-center justify-center rounded-[12px] bg-black/60"
                                        >
                                            <RotateCcw className="text-white" size={18} />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => removeMedia(item.id)}
                                        className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                                    >
                                        <X size={14} />
                                    </button>

                                    {index === 0 && (
                                        <span className="absolute bottom-1 left-1 rounded bg-red-600 px-2 py-1 text-[10px] text-white">
                                            Hero
                                        </span>
                                    )}
                                </div>
                            ))}

                            {media.length < 4 && (
                                <label className="flex h-[90px] w-[90px] cursor-pointer items-center justify-center rounded-[12px] border-2 border-dashed border-gray-300 bg-gray-50">
                                    <Plus size={22} />
                                    <input
                                        hidden
                                        multiple
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleMediaUpload}
                                    />
                                </label>
                            )}
                        </div>
                    )}

                    {isUploading && (
                        <p className="mt-3 text-xs text-gray-500">
                            ⏳ Uploading media in the background — you can keep filling the form.
                        </p>
                    )}
                </div>

                {/* PRODUCT DETAILS */}
                <div className="mt-6 rounded-[12px] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Product Details</h2>

                    <input
                        placeholder="Product Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-4 h-14 w-full rounded-[12px] border border-gray-200 px-4 outline-none focus:border-red-500"
                    />

                    <textarea
                        placeholder="Example: Luxury handmade senator outfit crafted with premium fabric for weddings, owambe and special occasions."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-4 min-h-[140px] w-full rounded-[12px] border border-gray-200 p-4 outline-none focus:border-red-500"
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-4 h-14 w-full rounded-[12px] border border-gray-200 px-4"
                    >
                        <option value="">Select Category</option>
                        <option value="Agbada">Agbada</option>
                        <option value="Senator">Senator</option>
                        <option value="Aso Ebi">Aso Ebi</option>
                        <option value="Native Wear">Native Wear</option>
                        <option value="Bridal">Bridal</option>
                        <option value="Wedding">Wedding</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Casual">Casual</option>
                        <option value="Streetwear">Streetwear</option>
                        <option value="Ready to Wear">Ready to Wear</option>
                        <option value="Kids Wear">Kids Wear</option>
                        <option value="Women's Wear">Women's Wear</option>
                        <option value="Men's Wear">Men's Wear</option>
                        <option value="Unisex">Unisex</option>
                    </select>

                    <select
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        className="mt-4 h-14 w-full rounded-[12px] border border-gray-200 px-4"
                    >
                        <option value="ready-made">Ready Made</option>
                        <option value="custom">Custom Measurement</option>
                        <option value="both">Both</option>
                    </select>
                </div>

                {/* PRICING */}
                <div className="mt-6 rounded-[12px] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Pricing</h2>

                    <div className="mt-4 flex gap-3">
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="h-14 rounded-[12px] border border-gray-200 px-4"
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
                            className="h-14 flex-1 rounded-[12px] border border-gray-200 px-4"
                        />
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={handleContinue}
                    disabled={isUploading}
                    className="mt-8 h-14 w-full rounded-[12px] bg-red-600 font-medium text-white disabled:opacity-50"
                >
                    {isUploading ? "Uploading media..." : "Continue to Preview"}
                </button>
            </section>
        </main>
    );
}