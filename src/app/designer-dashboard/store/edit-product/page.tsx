"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function EditStorePage() {
    const router = useRouter();

    const [brandName, setBrandName] = useState("");
    const [slug, setSlug] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [instagram, setInstagram] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [slugError, setSlugError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError || !user) {
                    setLoadError("Not logged in. Please log in first.");
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("designers")
                    .select("brand_name, slug, bio, business_location, intagram_handle")
                    .eq("id", user.id)
                    .single();

                if (error) {
                    if (error.code === "PGRST116") {
                        setLoading(false);
                        return;
                    }
                    setLoadError(`Failed to load: ${error.message}`);
                    setLoading(false);
                    return;
                }

                if (data) {
                    setBrandName(data.brand_name ?? "");
                    setSlug(data.slug ?? "");
                    setBio(data.bio ?? "");
                    setLocation(data.business_location ?? "");
                    setInstagram(data.intagram_handle ?? "");
                }

                setLoading(false);
            } catch (err: any) {
                setLoadError("Unexpected error: " + err.message);
                setLoading(false);
            }
        };

        load();
    }, [router]);

    const handleSlugChange = (value: string) => {
        const cleaned = value
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/--+/g, "-");
        setSlug(cleaned);
        setSlugError("");
    };

    const handleSave = async () => {
        if (!slug.trim()) {
            setSlugError("Store URL is required.");
            return;
        }

        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data: existing } = await supabase
                .from("designers")
                .select("id")
                .eq("slug", slug)
                .neq("id", user.id)
                .maybeSingle();

            if (existing) {
                setSlugError("This store URL is already taken. Try another.");
                setSaving(false);
                return;
            }

            const { error } = await supabase
                .from("designers")
                .update({
                    brand_name: brandName,
                    slug,
                    bio,
                    business_location: location,
                    intagram_handle: instagram,
                })
                .eq("id", user.id);

            if (error) {
                setLoadError("Failed to save: " + error.message);
                setSaving(false);
                return;
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setLoadError("Unexpected error: " + err.message);
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    if (loadError) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">Failed to load</h2>
                    <p className="mt-2 break-words text-sm text-gray-500">{loadError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/designer-dashboard/store"
                        className="mt-3 block text-sm text-gray-400 underline"
                    >
                        Go back
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/designer-dashboard/store"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-base font-bold text-gray-900">Edit Store</h1>
                        <p className="text-xs text-gray-400">Customize your storefront</p>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-5">

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">Brand Info</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                Brand Name
                            </label>
                            <input
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                placeholder="e.g. House of Tife"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                Store URL
                            </label>
                            <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 focus-within:border-gray-900">
                                <span className="flex-shrink-0 bg-gray-50 px-3 py-3 text-xs text-gray-400">
                                    fithouse.africa/store/
                                </span>
                                <input
                                    value={slug}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    placeholder="houseoftife"
                                    className="h-11 flex-1 px-2 text-sm outline-none"
                                />
                            </div>
                            {slugError && (
                                <p className="mt-1 text-xs text-red-500">{slugError}</p>
                            )}
                            {slug && !slugError && (
                                <p className="mt-1 text-xs text-emerald-600">
                                    fithouse.africa/store/{slug}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                Bio
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell customers about your brand..."
                                rows={4}
                                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-gray-900"
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">Contact & Location</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                Business Location
                            </label>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Lagos, Nigeria"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                Instagram Handle
                            </label>
                            <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 focus-within:border-gray-900">
                                <span className="flex-shrink-0 bg-gray-50 px-3 py-3 text-xs text-gray-400">
                                    @
                                </span>
                                <input
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    placeholder="houseoftife"
                                    className="h-11 flex-1 px-2 text-sm outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 py-4">
                <div className="mx-auto max-w-md space-y-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? (
                            <><Loader2 size={16} className="animate-spin" /> Saving...</>
                        ) : saved ? (
                            <><CheckCircle size={16} /> Saved!</>
                        ) : (
                            "Save Changes"
                        )}
                    </button>

                    {saved && (
                        <Link
                            href={`/store/${slug}`}
                            target="_blank"
                            className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
                        >
                            Preview Your Store →
                        </Link>
                    )}
                </div>
            </div>
        </main>
    );
}
