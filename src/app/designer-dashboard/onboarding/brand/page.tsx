"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useOnboarding } from "../layout";
import { supabase } from "@/lib/supabaseClient";

export default function OnboardingStep2() {
    const router = useRouter();
    const { data, setData } = useOnboarding();

    const [brandName, setBrandName] = useState(data.brandName);
    const [slug, setSlug] = useState(data.slug);
    const [bio, setBio] = useState(data.bio);
    const [instagram, setInstagram] = useState(data.instagram);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [slugError, setSlugError] = useState("");

    const handleBrandNameChange = (value: string) => {
        setBrandName(value);
        // Auto-generate slug from brand name
        const autoSlug = value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        setSlug(autoSlug);
        setSlugError("");
    };

    const handleSlugChange = (value: string) => {
        const cleaned = value
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/--+/g, "-");
        setSlug(cleaned);
        setSlugError("");
    };

    const handleContinue = async () => {
        if (!brandName.trim()) { setError("Please enter your brand name."); return; }
        if (!slug.trim()) { setSlugError("Store URL is required."); return; }

        setSaving(true);
        setError("");
        setSlugError("");

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) { router.push("/login"); return; }

            // Check slug uniqueness
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

            const { error: updateError } = await supabase
                .from("designers")
                .update({
                    brand_name: brandName,
                    slug,
                    bio,
                    intagram_handle: instagram,
                    onboarding_completed: true,
                })
                .eq("id", user.id);

            if (updateError) {
                setError("Failed to save: " + updateError.message);
                setSaving(false);
                return;
            }

            setData((prev) => ({ ...prev, brandName, slug, bio, instagram }));
            router.push("/designer-dashboard/onboarding/success");
        } catch (err: any) {
            setError("Unexpected error: " + err.message);
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="border-b border-gray-100 bg-white px-5 py-6">
                <div className="mx-auto max-w-md">
                    {/* PROGRESS */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-1.5 flex-1 rounded-full bg-red-600" />
                        <div className="h-1.5 flex-1 rounded-full bg-red-600" />
                        <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="rounded-[12px] border border-gray-200 p-2"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                                Step 2 of 3
                            </p>
                            <h1 className="text-2xl font-bold">Set up your brand</h1>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        This is how customers will find and recognise you.
                    </p>
                </div>
            </header>

            <section className="mx-auto max-w-md space-y-5 px-5 py-6">
                {/* BRAND NAME */}
                <div className="rounded-[16px] bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700">Brand Name</h2>
                    <input
                        value={brandName}
                        onChange={(e) => handleBrandNameChange(e.target.value)}
                        placeholder="e.g. House of Tife"
                        className="mt-3 h-14 w-full rounded-[12px] border border-gray-200 px-4 text-sm outline-none focus:border-red-500"
                    />
                </div>

                {/* STORE URL */}
                <div className="rounded-[16px] bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700">Your Store URL</h2>
                    <p className="mt-1 text-xs text-gray-400">
                        Auto-generated from your brand name. You can customise it.
                    </p>
                    <div className="mt-3 overflow-hidden rounded-[12px] border border-gray-200 focus-within:border-red-500">
                        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400">
                            fithouse.africa/store/
                        </div>
                        <input
                            value={slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            placeholder="houseoftife"
                            className="h-12 w-full px-4 text-sm font-medium outline-none"
                        />
                    </div>
                    {slugError && (
                        <p className="mt-1 text-xs text-red-600">{slugError}</p>
                    )}
                    {slug && !slugError && (
                        <p className="mt-1 text-xs text-green-600">
                            ✓ fithouse.africa/store/{slug}
                        </p>
                    )}
                </div>

                {/* BIO */}
                <div className="rounded-[16px] bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Bio{" "}
                        <span className="font-normal text-gray-400">(optional)</span>
                    </h2>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="e.g. Luxury fashion designer creating timeless pieces for weddings, owambe, and special occasions."
                        className="mt-3 min-h-[100px] w-full rounded-[12px] border border-gray-200 p-4 text-sm outline-none focus:border-red-500"
                    />
                </div>

                {/* INSTAGRAM */}
                <div className="rounded-[16px] bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Instagram{" "}
                        <span className="font-normal text-gray-400">(optional)</span>
                    </h2>
                    <div className="mt-3 flex overflow-hidden rounded-[12px] border border-gray-200 focus-within:border-red-500">
                        <span className="flex items-center bg-gray-50 px-4 text-sm text-gray-400">
                            @
                        </span>
                        <input
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="houseoftife"
                            className="h-14 flex-1 px-3 text-sm outline-none"
                        />
                    </div>
                </div>

                {error && (
                    <p className="rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleContinue}
                    disabled={saving}
                    className="h-14 w-full rounded-[12px] bg-red-600 font-semibold text-white disabled:opacity-60"
                >
                    {saving ? "Setting up your store..." : "Launch My Store →"}
                </button>
            </section>
        </main>
    );
}