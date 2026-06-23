"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const CATEGORIES = [
    "Bridal", "Aso Ebi", "Senator", "Agbada",
    "Native Wear", "Corporate", "Casual", "Luxury", "Streetwear",
];

export default function NewStylePage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [notes, setNotes] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const remaining = 8 - images.length;
        const selected = files.slice(0, remaining);

        const newImages = selected.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImages((prev) => [...prev, ...newImages]);
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSave = async () => {
        setError("");

        if (!title.trim()) { setError("Please enter a title for this style."); return; }
        if (images.length === 0) { setError("Please add at least one image."); return; }

        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            // Upload images to style-images bucket
            const imageUrls: string[] = [];

            for (const img of images) {
                const fileExt = img.file.name.split(".").pop();
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("style-images")
                    .upload(fileName, img.file, { cacheControl: "3600", upsert: false });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from("style-images")
                    .getPublicUrl(fileName);

                imageUrls.push(urlData.publicUrl);
            }

            // Save style record
            const { data: style, error: styleError } = await supabase
                .from("styles")
                .insert({
                    designer_id: user.id,
                    title: title.trim(),
                    category: category || null,
                    images: imageUrls,
                    notes: notes.trim() || null,
                    is_published: isPublished,
                })
                .select("id")
                .single();

            if (styleError) throw styleError;

            router.push(`/designer-dashboard/style-library/${style.id}`);
        } catch (err: any) {
            setError("Failed to save: " + err.message);
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/designer-dashboard/style-library"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-base font-bold text-gray-900">Add Style</h1>
                        <p className="text-xs text-gray-400">Add to your style library</p>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-5">

                {/* IMAGES */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-1 text-sm font-bold text-gray-900">
                        Style Images <span className="text-red-500">*</span>
                    </h2>
                    <p className="mb-4 text-xs text-gray-400">
                        Add up to 8 images. First image is the cover.
                    </p>

                    {/* Hero preview */}
                    {images[0] && (
                        <div className="relative mb-3 aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
                            <img
                                src={images[0].preview}
                                alt="Cover"
                                className="h-full w-full object-cover"
                            />
                            <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                                Cover
                            </span>
                            <button
                                onClick={() => removeImage(0)}
                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    {/* Thumbnails + add more */}
                    <div className="flex flex-wrap gap-2">
                        {images.slice(1).map((img, i) => (
                            <div key={i + 1} className="relative h-20 w-20">
                                <img
                                    src={img.preview}
                                    alt=""
                                    className="h-full w-full rounded-xl object-cover"
                                />
                                <button
                                    onClick={() => removeImage(i + 1)}
                                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}

                        {images.length < 8 && (
                            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400">
                                <Plus size={20} className="text-gray-400" />
                                <span className="mt-1 text-[10px] text-gray-400">
                                    {images.length === 0 ? "Add" : "More"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    onChange={handleImageSelect}
                                />
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
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Red Ball Gown, Royal Agbada"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                Category
                            </label>
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
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                Notes{" "}
                                <span className="font-normal text-gray-400">— optional</span>
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Fabric type, customisation options, price range..."
                                rows={3}
                                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-gray-900"
                            />
                        </div>
                    </div>
                </section>

                {/* VISIBILITY */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Publish to Catalogue
                            </h2>
                            <p className="mt-0.5 text-xs text-gray-400">
                                Customers can see and select this style from your shared catalogue link
                            </p>
                        </div>
                        <button
                            onClick={() => setIsPublished(!isPublished)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${isPublished ? "bg-emerald-600" : "bg-gray-200"
                                }`}
                        >
                            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isPublished ? "translate-x-5" : "translate-x-0.5"
                                }`} />
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
                >
                    {saving ? (
                        <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : (
                        "Save to Style Library"
                    )}
                </button>
            </div>
        </main>
    );
}