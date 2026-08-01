"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Loader2, Video, Image as ImageIcon, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const CATEGORIES = [
    "Bridal", "Aso Ebi", "Senator", "Agbada",
    "Native Wear", "Corporate", "Casual", "Luxury", "Streetwear",
];

const MAX_VIDEO_SECONDS = 30;

type Draft = {
    key: string;
    mediaType: "image" | "video" | null;
    images: { file: File; preview: string }[];
    video: { file: File; preview: string; duration: number } | null;
    title: string;
    category: string;
    notes: string;
    error: string;
};

function newDraft(): Draft {
    return {
        key: crypto.randomUUID(),
        mediaType: null,
        images: [],
        video: null,
        title: "",
        category: "",
        notes: "",
        error: "",
    };
}

function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };
        video.onerror = () => reject(new Error("Could not read video file"));
        video.src = URL.createObjectURL(file);
    });
}

export default function NewStylePage() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    const [drafts, setDrafts] = useState<Draft[]>([newDraft()]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hasSwiped, setHasSwiped] = useState(false);
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const updateDraft = (index: number, patch: Partial<Draft>) => {
        setDrafts((prev) =>
            prev.map((d, i) => (i === index ? { ...d, ...patch } : d))
        );
    };
    const getSlideWidth = (el: HTMLDivElement) => el.clientWidth * 0.88 + 12; // 88% width + 12px gap
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
                        const idx = slideRefs.current.findIndex((el) => el === entry.target);
                        if (idx !== -1) {
                            setActiveIndex(idx);
                            setHasSwiped(true);
                        }
                    }
                });
            },
            { root: container, threshold: [0.6] }
        );

        slideRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, [drafts.length]);
    const scrollToIndex = (index: number) => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTo({ left: index * getSlideWidth(el), behavior: "smooth" });
        setActiveIndex(index);
        setHasSwiped(true);
    };

    const addDraft = () => {
        setDrafts((prev) => {
            const next = [...prev, newDraft()];
            setTimeout(() => scrollToIndex(next.length - 1), 50);
            return next;
        });
    };

    const removeDraft = (index: number) => {
        setDrafts((prev) => {
            if (prev.length === 1) return prev;
            const d = prev[index];
            d.images.forEach((img) => URL.revokeObjectURL(img.preview));
            if (d.video) URL.revokeObjectURL(d.video.preview);
            const next = prev.filter((_, i) => i !== index);
            const newIndex = Math.max(0, index - 1);
            setTimeout(() => scrollToIndex(newIndex), 50);
            return next;
        });
    };

    const handleImageSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;
        const draft = drafts[index];

        if (draft.mediaType === null) {
            // Fresh pick on an empty slot: each image becomes its own style
            const newDrafts = files.map((file) => ({
                ...newDraft(),
                mediaType: "image" as const,
                images: [{ file, preview: URL.createObjectURL(file) }],
            }));
            setDrafts((prev) => {
                const next = [...prev];
                next.splice(index, 1, ...newDrafts);
                return next;
            });
            setTimeout(() => scrollToIndex(index), 50);
        } else {
            // Adding more angles to a style already in progress
            const remaining = 8 - draft.images.length;
            const selected = files.slice(0, remaining);
            const newImages = selected.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            updateDraft(index, {
                images: [...draft.images, ...newImages],
                error: "",
            });
        }
        e.target.value = "";
    };

    const removeImage = (draftIndex: number, imgIndex: number) => {
        const draft = drafts[draftIndex];
        URL.revokeObjectURL(draft.images[imgIndex].preview);
        const nextImages = draft.images.filter((_, i) => i !== imgIndex);
        updateDraft(draftIndex, {
            images: nextImages,
            mediaType: nextImages.length > 0 ? "image" : null,
        });
    };

    const handleVideoSelect = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        updateDraft(index, { error: "" });

        try {
            const duration = await getVideoDuration(file);
            if (duration > MAX_VIDEO_SECONDS + 0.5) {
                updateDraft(index, {
                    error: `Video is ${Math.round(duration)}s — please keep it under ${MAX_VIDEO_SECONDS}s.`,
                });
                return;
            }
            updateDraft(index, {
                mediaType: "video",
                video: { file, preview: URL.createObjectURL(file), duration },
            });
        } catch {
            updateDraft(index, { error: "Couldn't read that video file. Try another." });
        }
    };

    const removeVideo = (index: number) => {
        const draft = drafts[index];
        if (draft.video) URL.revokeObjectURL(draft.video.preview);
        updateDraft(index, { video: null, mediaType: null });
    };

    const handleSaveAll = async () => {
        setFormError("");

        for (const d of drafts) {
            if (!d.title.trim()) {
                setFormError("Every style needs a title before saving.");
                return;
            }
            if (d.mediaType === null || (d.mediaType === "image" && d.images.length === 0) || (d.mediaType === "video" && !d.video)) {
                setFormError("Every style needs a photo or a video before saving.");
                return;
            }
        }

        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            for (const d of drafts) {
                let imageUrls: string[] = [];
                let videoUrl: string | null = null;

                if (d.mediaType === "image") {
                    for (const img of d.images) {
                        const ext = img.file.name.split(".").pop();
                        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                        const { error: uploadError } = await supabase.storage
                            .from("style-images")
                            .upload(fileName, img.file, { cacheControl: "3600", upsert: false });
                        if (uploadError) throw uploadError;
                        const { data: urlData } = supabase.storage
                            .from("style-images")
                            .getPublicUrl(fileName);
                        imageUrls.push(urlData.publicUrl);
                    }
                } else if (d.mediaType === "video" && d.video) {
                    const ext = d.video.file.name.split(".").pop();
                    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                    const { error: uploadError } = await supabase.storage
                        .from("style-images")
                        .upload(fileName, d.video.file, { cacheControl: "3600", upsert: false });
                    if (uploadError) throw uploadError;
                    const { data: urlData } = supabase.storage
                        .from("style-images")
                        .getPublicUrl(fileName);
                    videoUrl = urlData.publicUrl;
                }

                const { error: styleError } = await supabase
                    .from("styles")
                    .insert({
                        designer_id: user.id,
                        title: d.title.trim(),
                        category: d.category || null,
                        images: imageUrls,
                        video_url: videoUrl,
                        notes: d.notes.trim() || null,
                        is_published: true,
                    });

                if (styleError) throw styleError;
            }

            router.push("/designer-dashboard/style-library");
        } catch (err: any) {
            setFormError("Failed to save: " + err.message);
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-32">
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
                            <h1 className="text-base font-bold text-gray-900">Add Styles</h1>
                            <p className="text-xs text-gray-400">
                                {drafts.length} item{drafts.length !== 1 ? "s" : ""} · swipe to add details for each
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* SWIPE HINT */}
            {drafts.length > 1 && !hasSwiped && (
                <div className="flex justify-center pt-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-gray-900 px-3.5 py-1.5 text-[11px] font-medium text-white animate-pulse">
                        <span>Swipe to add details for each photo</span>
                        <ChevronRight size={12} />
                    </div>
                </div>
            )}

            {/* DOT INDICATORS */}
            {drafts.length > 1 && (
                <div className="flex justify-center gap-1.5 pt-3">
                    {drafts.map((d, i) => (
                        <button
                            key={d.key}
                            onClick={() => scrollToIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-6 bg-gray-900" : "w-1.5 bg-gray-300"
                                } ${d.error ? "bg-red-400" : ""}`}
                        />
                    ))}
                </div>
            )}

            {/* SWIPEABLE CAROUSEL */}
            <div
                ref={containerRef}
                className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-[6%]"
                style={{ scrollbarWidth: "none" }}
            >
                {drafts.map((draft, index) => (
                    <div
                        key={draft.key}
                        ref={(el) => { slideRefs.current[index] = el; }}
                        className="w-[88%] flex-shrink-0 snap-center"
                    >
                        <div className="mx-auto max-w-md space-y-4 px-1 pb-4">

                            {drafts.length > 1 && (
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                        Style {index + 1} of {drafts.length}
                                    </p>
                                    <button
                                        onClick={() => removeDraft(index)}
                                        className="text-xs font-semibold text-red-500"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            {/* MEDIA */}
                            <section className="rounded-2xl bg-white p-5 shadow-sm">
                                <h2 className="mb-1 text-sm font-bold text-gray-900">
                                    Photos or Video <span className="text-red-500">*</span>
                                </h2>
                                <p className="mb-4 text-xs text-gray-400">
                                    Up to 8 photos, or one video under {MAX_VIDEO_SECONDS}s.
                                </p>

                                {draft.mediaType === null && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400">
                                            <ImageIcon size={18} className="text-gray-400" />
                                            <span className="text-xs font-medium text-gray-500">Add Photos</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                hidden
                                                onChange={(e) => handleImageSelect(index, e)}
                                            />
                                        </label>
                                        <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400">
                                            <Video size={18} className="text-gray-400" />
                                            <span className="text-xs font-medium text-gray-500">Add Video</span>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                hidden
                                                onChange={(e) => handleVideoSelect(index, e)}
                                            />
                                        </label>
                                    </div>
                                )}

                                {draft.mediaType === "image" && (
                                    <>
                                        {draft.images[0] && (
                                            <div className="relative mb-3 aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
                                                <img
                                                    src={draft.images[0].preview}
                                                    alt="Cover"
                                                    className="h-full w-full object-cover"
                                                />
                                                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                                                    Cover
                                                </span>
                                                <button
                                                    onClick={() => removeImage(index, 0)}
                                                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {draft.images.slice(1).map((img, i) => (
                                                <div key={i + 1} className="relative h-20 w-20">
                                                    <img
                                                        src={img.preview}
                                                        alt=""
                                                        className="h-full w-full rounded-xl object-cover"
                                                    />
                                                    <button
                                                        onClick={() => removeImage(index, i + 1)}
                                                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                            {draft.images.length < 8 && (
                                                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400">
                                                    <Plus size={20} className="text-gray-400" />
                                                    <span className="mt-1 text-[10px] text-gray-400">More</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        hidden
                                                        onChange={(e) => handleImageSelect(index, e)}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </>
                                )}

                                {draft.mediaType === "video" && draft.video && (
                                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black">
                                        <video
                                            src={draft.video.preview}
                                            className="h-full w-full object-contain"
                                            controls
                                        />
                                        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                                            <Play size={9} /> {Math.round(draft.video.duration)}s
                                        </span>
                                        <button
                                            onClick={() => removeVideo(index)}
                                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}

                                {draft.error && (
                                    <p className="mt-3 text-xs font-medium text-red-500">{draft.error}</p>
                                )}
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
                                            value={draft.title}
                                            onChange={(e) => updateDraft(index, { title: e.target.value })}
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
                                                    onClick={() =>
                                                        updateDraft(index, {
                                                            category: cat === draft.category ? "" : cat,
                                                        })
                                                    }
                                                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${draft.category === cat
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
                                            value={draft.notes}
                                            onChange={(e) => updateDraft(index, { notes: e.target.value })}
                                            placeholder="Fabric type, customisation options, price range..."
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-gray-900"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                ))}

                {/* ADD ANOTHER SLIDE */}
                <div
                    ref={(el) => { slideRefs.current[drafts.length] = el; }}
                    className="w-[88%] flex-shrink-0 snap-center"
                >
                    <div className="mx-auto flex max-w-md items-center justify-center pb-4" style={{ minHeight: "60vh" }}>
                        <button
                            onClick={addDraft}
                            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 px-10 py-12 text-gray-400 hover:border-gray-400"
                        >
                            <Plus size={28} />
                            <span className="text-sm font-semibold">Add Another Style</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ARROW NAV */}
            {drafts.length > 1 && (
                <>
                    {activeIndex > 0 && (
                        <button
                            onClick={() => scrollToIndex(activeIndex - 1)}
                            className="fixed left-3 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-md border border-gray-100"
                        >
                            <ChevronLeft size={18} className="text-gray-700" />
                        </button>
                    )}
                    {activeIndex < drafts.length && (
                        <button
                            onClick={() => scrollToIndex(activeIndex + 1)}
                            className="fixed right-3 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-md border border-gray-100"
                        >
                            <ChevronRight size={18} className="text-gray-700" />
                        </button>
                    )}
                </>
            )}

            {/* SAVE BAR */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 py-4">
                <div className="mx-auto max-w-md">
                    {formError && (
                        <p className="mb-2 text-xs font-medium text-red-500">{formError}</p>
                    )}
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? (
                            <><Loader2 size={16} className="animate-spin" /> Saving...</>
                        ) : (
                            `Add ${drafts.length} Style${drafts.length !== 1 ? "s" : ""} to Catalogue`
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
}
