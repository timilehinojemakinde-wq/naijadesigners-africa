"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { compressWithTimeout } from "@/lib/compressImage";
import { validateVideo } from "@/lib/validateVideo";
import { uploadMediaFile } from "@/lib/uploadMedia";

const CATEGORIES = [
    "Agbada", "Senator", "Aso Ebi", "Native Wear", "Bridal", "Wedding",
    "Luxury", "Corporate", "Casual", "Streetwear", "Ready to Wear",
    "Kids Wear", "Women's Wear", "Men's Wear", "Unisex",
];

type MediaSlot = {
    id: string;
    url?: string;
    preview: string;
    type: "image" | "video";
    file?: File;
    status: "existing" | "uploading" | "done" | "error";
    error?: string;
};

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [media, setMedia] = useState<MediaSlot[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [productType, setProductType] = useState("both");
    const [currency, setCurrency] = useState("NGN");
    const [price, setPrice] = useState("");
    const [active, setActive] = useState(true);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data: product } = await supabase
                .from("products")
                .select("*")
                .eq("id", productId)
                .eq("designer_id", user.id)
                .single();

            if (!product) {
                router.push("/designer-dashboard/store");
                return;
            }

            const existingMedia: MediaSlot[] = (product.media && product.media.length > 0
                ? product.media
                : product.hero_media
                    ? [{ type: product.hero_media_type ?? "image", url: product.hero_media }]
                    : []
            ).map((m: { type: "image" | "video"; url: string }) => ({
                id: crypto.randomUUID(),
                url: m.url,
                preview: m.url,
                type: m.type,
                status: "existing" as const,
            }));

            setMedia(existingMedia);
            setName(product.name ?? "");
            setDescription(product.description ?? "");
            setCategory(product.category ?? "");
            setProductType(product.product_type ?? "both");
            setCurrency(product.currency ?? "NGN");
            setPrice(String(product.price ?? ""));
            setActive(product.active ?? true);
            setLoading(false);
        };

        load();
    }, [productId, router]);

    const processAndUpload = async (id: string, file: File, type: "image" | "video") => {
        try {
            let processedFile = file;
            if (type === "image") {
                processedFile = await compressWithTimeout(file);
            } else {
                const validation = await validateVideo(file);
                if (!validation.valid) {
                    setMedia((prev) =>
                        prev.map((m) => (m.id === id ? { ...m, status: "error", error: validation.reason } : m))
                    );
                    return;
                }
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            const url = await uploadMediaFile(processedFile, user.id);

            setMedia((prev) =>
                prev.map((m) => (m.id === id ? { ...m, status: "done", url, file: processedFile } : m))
            );
        } catch (err: any) {
            setMedia((prev) =>
                prev.map((m) => (m.id === id ? { ...m, status: "error", error: err.message } : m))
            );
        }
    };

    const retryUpload = (item: MediaSlot) => {
        if (!item.file) return;
        setMedia((prev) => prev.map((m) => (m.id === item.id ? { ...m, status: "uploading", error: undefined } : m)));
        processAndUpload(item.id, item.file, item.type);
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remaining = 4 - media.length;
        const selected = files.slice(0, remaining);

        for (const file of selected) {
            const id = crypto.randomUUID();
            const type: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
            const preview = URL.createObjectURL(file);

            setMedia((prev) => [...prev, { id, file, preview, type, status: "uploading" }]);
            processAndUpload(id, file, type);
        }
        e.target.value = "";
    };

    const removeMedia = (id: string) => {
        setMedia((prev) => {
            const item = prev.find((m) => m.id === id);
            if (item?.file) URL.revokeObjectURL(item.preview);
            return prev.filter((m) => m.id !== id);
        });
    };

    const isUploading = media.some((m) => m.status === "uploading");
    const hasError = media.some((m) => m.status === "error");

    const handleSave = async () => {
        setError("");

        if (!name.trim()) { setError("Please enter a product name."); return; }
        if (media.length === 0) { setError("Please keep at least one photo or video."); return; }
        if (isUploading) { setError("Please wait for uploads to finish."); return; }
        if (hasError) { setError("Remove or retry the failed upload before saving."); return; }
        if (!price || Number(price) <= 0) { setError("Please enter a valid price."); return; }

        setSaving(true);

        try {
            const mediaPayload = media
                .filter((m) => m.status === "done" || m.status === "existing")
                .map((m) => ({ type: m.type, url: m.url }));

            const { error: updateError } = await supabase
                .from("products")
                .update({
                    name: name.trim(),
                    description: description.trim() || null,
                    category: category || null,
                    product_type: productType,
                    media: mediaPayload,
                    hero_media: mediaPayload[0]?.url ?? null,
                    hero_media_type: mediaPayload[0]?.type ?? null,
                    currency,
                    price: Number(price),
                    active,
                })
                .eq("id", productId);

            if (updateError) throw updateError;

            router.push("/designer-dashboard/store");
        } catch (err: any) {
            setError("Failed to save: " + err.message);
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        await supabase.from("products").delete().eq("id", productId);
        router.push("/designer-dashboard/store");
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-28">
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/designer-dashboard/store"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <h1 className="text-base font-bold text-gray-900">Edit Product</h1>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-400"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-5">

                {/* VISIBILITY */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Live on Store</h2>
                            <p className="mt-0.5 text-xs text-gray-400">
                                {active ? "Visible to customers" : "Hidden from your storefront"}
                            </p>
                        </div>
                        <button
                            onClick={() => setActive(!active)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${active ? "bg-emerald-600" : "bg-gray-200"}`}
                        >
                            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                    </div>
                </section>

                {/* MEDIA */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-1 text-sm font-bold text-gray-900">Product Media</h2>
                    <p className="mb-4 text-xs text-gray-400">Up to 4 photos or videos. First item is the cover.</p>

                    {media[0] && (
                        <div className="relative mb-3 aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
                            {media[0].type === "video" ? (
                                <video src={media[0].preview} controls className="h-full w-full object-cover" />
                            ) : (
                                <img src={media[0].preview} alt="Cover" className="h-full w-full object-cover" />
                            )}
                            <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                                Cover
                            </span>
                            {media[0].status === "uploading" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <Loader2 className="animate-spin text-white" size={24} />
                                </div>
                            )}
                            {media[0].status === "error" && (
                                <button
                                    onClick={() => retryUpload(media[0])}
                                    className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 text-xs font-semibold text-white"
                                >
                                    <RotateCcw size={12} /> Retry
                                </button>
                            )}
                            <button
                                onClick={() => removeMedia(media[0].id)}
                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {media.slice(1).map((item) => (
                            <div key={item.id} className="relative h-20 w-20">
                                {item.type === "video" ? (
                                    <video src={item.preview} className="h-full w-full rounded-xl object-cover" />
                                ) : (
                                    <img src={item.preview} alt="" className="h-full w-full rounded-xl object-cover" />
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
                            </div>
                        ))}

                        {media.length < 4 && (
                            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400">
                                <Plus size={20} className="text-gray-400" />
                                <span className="mt-1 text-[10px] text-gray-400">Add</span>
                                <input type="file" accept="image/*,video/*" multiple hidden onChange={handleMediaUpload} />
                            </label>
                        )}
                    </div>
                </section>

                {/* DETAILS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="h-11 flex-1 rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                        />
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 py-4">
                <div className="mx-auto max-w-md">
                    <button
                        onClick={handleSave}
                        disabled={saving || isUploading}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? (<><Loader2 size={16} className="animate-spin" /> Saving...</>) : "Save Changes"}
                    </button>
                </div>
            </div>
        </main>
    );
}
