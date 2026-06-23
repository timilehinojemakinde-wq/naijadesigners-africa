"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus, Search, Share2, Images,
    ChevronRight, Copy, Check
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import BottomNav from "@/components/dashboard/BottomNav";

type Style = {
    id: string;
    title: string | null;
    category: string | null;
    images: string[] | null;
    notes: string | null;
    is_published: boolean;
    created_at: string;
};

const CATEGORIES = [
    "All",
    "Bridal",
    "Aso Ebi",
    "Senator",
    "Agbada",
    "Native Wear",
    "Corporate",
    "Casual",
    "Luxury",
    "Streetwear",
];

export default function StyleLibraryPage() {
    const router = useRouter();
    const [styles, setStyles] = useState<Style[]>([]);
    const [filtered, setFiltered] = useState<Style[]>([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [designerSlug, setDesignerSlug] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const [{ data: stylesData }, { data: designerData }] = await Promise.all([
                supabase
                    .from("styles")
                    .select("id, title, category, images, notes, is_published, created_at")
                    .eq("designer_id", user.id)
                    .order("created_at", { ascending: false }),
                supabase
                    .from("designers")
                    .select("slug")
                    .eq("id", user.id)
                    .single(),
            ]);

            setStyles(stylesData ?? []);
            setFiltered(stylesData ?? []);
            setDesignerSlug(designerData?.slug ?? "");
            setLoading(false);
        };

        load();
    }, [router]);

    useEffect(() => {
        let result = styles;

        if (activeCategory !== "All") {
            result = result.filter(s => s.category === activeCategory);
        }

        if (search.trim()) {
            result = result.filter(s =>
                s.title?.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFiltered(result);
    }, [styles, activeCategory, search]);

    const catalogueUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/catalogue/${designerSlug}`;

    const handleShareCatalogue = async () => {
        if (navigator.share) {
            await navigator.share({
                title: "My Style Library",
                text: "Browse my style collection and pick what you love",
                url: catalogueUrl,
            });
        } else {
            await navigator.clipboard.writeText(catalogueUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="bg-white px-5 pt-12 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Style Library</h1>
                        <p className="mt-0.5 text-xs text-gray-400">
                            {styles.length} style{styles.length !== 1 ? "s" : ""} ·{" "}
                            {styles.filter(s => s.is_published).length} published
                        </p>
                    </div>
                    <Link
                        href="/designer-dashboard/style-library/new"
                        className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus size={15} />
                        Add Style
                    </Link>
                </div>

                {/* SHARE CATALOGUE LINK */}
                {designerSlug && (
                    <button
                        onClick={handleShareCatalogue}
                        className="mt-4 flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                    >
                        <div className="flex items-center gap-2">
                            <Share2 size={14} className="text-emerald-600" />
                            <div className="text-left">
                                <p className="text-xs font-semibold text-emerald-700">
                                    Share Style Catalogue
                                </p>
                                <p className="text-[10px] text-emerald-600 opacity-70">
                                    Customers browse and select styles
                                </p>
                            </div>
                        </div>
                        {copied ? (
                            <Check size={14} className="text-emerald-600" />
                        ) : (
                            <Copy size={14} className="text-emerald-600" />
                        )}
                    </button>
                )}

                {/* SEARCH */}
                <div className="relative mt-3">
                    <Search
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search styles..."
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-gray-900 focus:bg-white"
                    />
                </div>
            </header>

            {/* CATEGORY FILTERS */}
            <div className="flex gap-2 overflow-x-auto px-5 py-3">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${activeCategory === cat
                            ? "bg-gray-900 text-white"
                            : "border border-gray-200 bg-white text-gray-600"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* STYLES GRID */}
            <div className="px-5 pb-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                            <Images size={28} className="text-gray-400" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {search || activeCategory !== "All"
                                ? "No styles found"
                                : "No styles yet"}
                        </h2>
                        <p className="mt-1.5 max-w-xs text-sm text-gray-400">
                            {search || activeCategory !== "All"
                                ? "Try a different search or category"
                                : "Add past work, inspiration images, and styles customers can choose from."}
                        </p>
                        {!search && activeCategory === "All" && (
                            <Link
                                href="/designer-dashboard/style-library/new"
                                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
                            >
                                <Plus size={15} /> Add First Style
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filtered.map((style) => (
                            <Link
                                key={style.id}
                                href={`/designer-dashboard/style-library/${style.id}`}
                                className="overflow-hidden rounded-2xl bg-white shadow-sm"
                            >
                                {/* IMAGE */}
                                <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
                                    {style.images?.[0] ? (
                                        <img
                                            src={style.images[0]}
                                            alt={style.title ?? "Style"}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Images size={24} className="text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* INFO */}
                                <div className="p-3">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {style.title ?? "Untitled Style"}
                                    </p>
                                    <div className="mt-1.5 flex items-center justify-between">
                                        {style.category && (
                                            <span className="text-[10px] text-gray-400">
                                                {style.category}
                                            </span>
                                        )}
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.is_published
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-gray-100 text-gray-500"
                                            }`}>
                                            {style.is_published ? "Published" : "Private"}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}