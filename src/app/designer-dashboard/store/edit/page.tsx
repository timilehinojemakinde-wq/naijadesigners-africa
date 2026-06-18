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
                console.log("Auth user:", user, "authError:", authError);

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

                console.log("Designer data:", data, "error:", error);

                if (error) {
                    if (error.code === "PGRST116") {
                        console.log("No designer row found — showing empty form");
                        setLoading(false);
                        return;
                    }
                    setLoadError(`Failed to load: ${error.message} (code: ${error.code})`);
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
                console.error("Caught error:", err);
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

            console.log("Save error:", error);

            if (error) {
                alert("Failed to save: " + error.message);
                setSaving(false);
                return;
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            alert("Unexpected error: " + err.message);
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
            </main>
        );
    }

    if (loadError) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-5">
                <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-sm">
                    <h2 className="text-lg font-semibold text-red-600">Failed to load</h2>
                    <p className="mt-2 break-words text-sm text-gray-600">{loadError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 h-12 w-full rounded-[12px] bg-gray-900 text-sm text-white"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/designer-dashboard/store"
                        className="mt-3 block text-sm text-gray-500 underline"
                    >
                        Go back
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/designer-dashboard/store"
                        className="rounded-[12px] border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Edit Store</h1>
                        <p className="text-sm text-gray-500">Customize your storefront</p>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-md space-y-6 px-5 py-6">
                {/* BRAND INFO */}
                <div className="rounded-[16px] bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold">Brand Info</h2>

                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Brand Name
                            </label>
                            <input
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                placeholder="e.g. House of Tife"
                                className="mt-1 h-14 w-full rounded-[12px] border border-gray-200 px-4 outline-none focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Store URL
                            </label>
                            <div className="mt-1 flex items-center overflow-hidden rounded-[12px] border border-gray-200 focus-within:border-red-500">
                                <span className="flex-shrink-0 bg-gray-50 px-3 py-4 text-sm text-gray-400">
                                    fithouse.africa/store/
                                </span>
                                <input
                                    value={slug}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    placeholder="houseoftife"
                                    className="h-14 flex-1 px-2 text-sm outline-none"
                                />
                            </div>
                            {slugError && (
                                <p className="mt-1 text-xs text-red-600">{slugError}</p>
                            )}
                            {slug && !slugError && (
                                <p className="mt-1 text-xs text-green-600">
                                    fithouse.africa/store/{slug}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell customers about your brand..."
                                className="mt-1 min-h-[120px] w-full rounded-[12px] border border-gray-200 p-4 text-sm outline-none focus:border-red-500"
                            />
                        </div>
                    </div>
                </div>

                {/* CONTACT & LOCATION */}
                <div className="rounded-[16px] bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold">Contact & Location</h2>

                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Business Location
                            </label>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Lagos, Nigeria"
                                className="mt-1 h-14 w-full rounded-[12px] border border-gray-200 px-4 outline-none focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Instagram Handle
                            </label>
                            <div className="mt-1 flex items-center overflow-hidden rounded-[12px] border border-gray-200 focus-within:border-red-500">
                                <span className="flex-shrink-0 bg-gray-50 px-3 py-4 text-sm text-gray-400">
                                    @
                                </span>
                                <input
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    placeholder="houseoftife"
                                    className="h-14 flex-1 px-2 text-sm outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SAVE */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-[12px] bg-red-600 font-medium text-white disabled:opacity-60"
                >
                    {saving ? (
                        <><Loader2 size={18} className="animate-spin" /> Saving...</>
                    ) : saved ? (
                        <><CheckCircle size={18} /> Saved!</>
                    ) : (
                        "Save Changes"
                    )}
                </button>

                {saved && (
                    <Link
                        href="/designer-dashboard/store/preview"
                        className="flex h-12 w-full items-center justify-center rounded-[12px] border border-gray-300 text-sm font-medium"
                    >
                        Preview Your Store →
                    </Link>
                )}
            </section>
        </main>
    );
}