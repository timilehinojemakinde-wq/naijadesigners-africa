"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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
    const [slugAvailable, setSlugAvailable] = useState(false);

    const handleBrandNameChange = (value: string) => {
        setBrandName(value);
        const autoSlug = value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        setSlug(autoSlug);
        setSlugError("");
        setSlugAvailable(false);
    };

    const handleSlugChange = (value: string) => {
        const cleaned = value
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/--+/g, "-");
        setSlug(cleaned);
        setSlugError("");
        setSlugAvailable(false);
    };

    const handleContinue = async () => {
        if (!brandName.trim()) { setError("Please enter your brand name."); return; }
        if (!slug.trim()) { setSlugError("Your store URL is required."); return; }

        setSaving(true);
        setError("");
        setSlugError("");

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) { router.push("/auth"); return; }

            const { data: existing } = await supabase
                .from("designers")
                .select("id")
                .eq("slug", slug)
                .neq("id", user.id)
                .maybeSingle();

            if (existing) {
                setSlugError("This URL is taken. Try adding your city or a number.");
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

    const canContinue = brandName.trim() && slug.trim();

    return (
        <main className="min-h-screen bg-white">
            {/* NAV */}
            <nav className="border-b border-gray-100 px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link href="/" className="text-lg font-bold tracking-tight">
                        FitHouse<span className="text-emerald-600">Africa</span>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="font-semibold text-emerald-600">Step 2</span>
                        <span>/</span>
                        <span>3</span>
                    </div>
                </div>
            </nav>

            <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl md:grid-cols-[1fr_420px]">

                {/* LEFT — Form */}
                <div className="flex flex-col justify-center px-6 py-16 md:px-16">

                    {/* PROGRESS */}
                    <div className="mb-10 flex gap-1.5">
                        <div className="h-0.5 flex-1 rounded-full bg-emerald-600" />
                        <div className="h-0.5 flex-1 rounded-full bg-emerald-600" />
                        <div className="h-0.5 flex-1 rounded-full bg-gray-200" />
                    </div>

                    {/* BACK */}
                    <button
                        onClick={() => router.back()}
                        className="mb-8 flex w-fit items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>

                    {/* HEADLINE */}
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-600">
                        Your brand
                    </p>
                    <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                        Set up your brand identity
                    </h1>
                    <p className="mb-10 text-sm text-gray-500">
                        This is how customers discover and remember you.
                    </p>

                    {/* BRAND NAME */}
                    <div className="mb-6">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                            Brand Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={brandName}
                            onChange={(e) => handleBrandNameChange(e.target.value)}
                            placeholder="e.g. House of Tife"
                            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        />
                    </div>

                    {/* STORE URL */}
                    <div className="mb-6">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                            Store URL <span className="text-red-500">*</span>
                        </label>
                        <div className={`flex overflow-hidden rounded-xl border transition ${slugError
                                ? "border-red-400"
                                : slug && !slugError
                                    ? "border-emerald-500"
                                    : "border-gray-200 focus-within:border-emerald-500"
                            }`}>
                            <span className="flex items-center bg-gray-50 px-3 text-xs text-gray-400 border-r border-gray-200 whitespace-nowrap">
                                fithouse.africa/store/
                            </span>
                            <input
                                value={slug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                placeholder="houseoftife"
                                className="h-12 flex-1 px-3 text-sm font-medium outline-none"
                            />
                        </div>
                        {slugError && (
                            <p className="mt-1.5 text-xs text-red-600">{slugError}</p>
                        )}
                        {slug && !slugError && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                                <Check size={11} strokeWidth={3} />
                                fithouse.africa/store/{slug}
                            </p>
                        )}
                    </div>

                    {/* BIO */}
                    <div className="mb-6">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                            Bio{" "}
                            <span className="font-normal text-gray-400">— optional</span>
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Describe your style, speciality and what makes your brand unique..."
                            rows={3}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Shown on your public storefront. Keep it to 2–3 sentences.
                        </p>
                    </div>

                    {/* INSTAGRAM */}
                    <div className="mb-8">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                            Instagram{" "}
                            <span className="font-normal text-gray-400">— optional</span>
                        </label>
                        <div className="flex overflow-hidden rounded-xl border border-gray-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition">
                            <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-sm text-gray-400">
                                @
                            </span>
                            <input
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="houseoftife"
                                className="h-12 flex-1 px-4 text-sm outline-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleContinue}
                        disabled={saving || !canContinue}
                        className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition ${canContinue && !saving
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {saving ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                            <>Launch My Store <ArrowRight size={16} /></>
                        )}
                    </button>
                </div>

                {/* RIGHT — Live preview */}
                <div className="hidden flex-col justify-between bg-gray-900 px-10 py-16 md:flex">
                    <div>
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Setup · Step 2 of 3
                        </div>

                        <h2 className="mb-3 text-xl font-bold text-white">
                            Your store goes live the moment you finish.
                        </h2>
                        <p className="mb-10 text-sm leading-relaxed text-gray-400">
                            Your store URL is permanent — choose something clean and memorable that represents your brand.
                        </p>

                        <div className="space-y-4 mb-10">
                            {[
                                { step: "01", title: "About you", desc: "Business type & location", done: true },
                                { step: "02", title: "Your brand", desc: "Name, store URL & bio", done: false, active: true },
                                { step: "03", title: "Go live", desc: "Your store launches instantly", done: false },
                            ].map((item) => (
                                <div key={item.step} className="flex items-start gap-3">
                                    <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${item.done
                                            ? "bg-emerald-600 text-white"
                                            : item.active
                                                ? "border-2 border-emerald-500 text-emerald-400"
                                                : "border border-gray-700 text-gray-600"
                                        }`}>
                                        {item.done ? <Check size={10} strokeWidth={3} /> : item.step}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold ${item.done || item.active ? "text-white" : "text-gray-600"}`}>
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LIVE STORE PREVIEW */}
                    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Live preview
                        </p>

                        {/* Mock browser */}
                        <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
                            <div className="flex items-center gap-1.5 border-b border-gray-700 bg-gray-800 px-3 py-2">
                                <div className="h-2 w-2 rounded-full bg-gray-700" />
                                <div className="h-2 w-2 rounded-full bg-gray-700" />
                                <div className="h-2 w-2 rounded-full bg-gray-700" />
                                <div className="mx-auto rounded bg-gray-700 px-3 py-0.5 text-[10px] text-gray-400 truncate max-w-[180px]">
                                    fithouse.africa/store/{slug || "yourstore"}
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold text-white">
                                        {brandName?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-white">
                                            {brandName || "Your Brand Name"}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {data.location || "Lagos, Nigeria"}
                                        </p>
                                    </div>
                                </div>
                                {bio && (
                                    <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 mb-3">
                                        {bio}
                                    </p>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="aspect-square rounded-lg bg-gray-700" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <p className="mt-3 text-xs text-gray-500">
                            Updates as you type ↑
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}