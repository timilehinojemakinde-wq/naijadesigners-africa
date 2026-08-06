"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, AtSign } from "lucide-react";
import { useOnboarding } from "../layout";
import { supabase } from "@/lib/supabaseClient";

function StepTracker({ current }: { current: number }) {
    const steps = ["About You", "Your Brand", "Go Live"];
    return (
        <div className="mb-10 flex items-center gap-2">
            {steps.map((label, i) => {
                const n = i + 1;
                const done = n < current;
                const active = n === current;
                return (
                    <div key={label} className="flex flex-1 items-center gap-2">
                        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${done ? "bg-emerald-600 text-white" :
                                active ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-600" :
                                    "border-2 border-gray-200 text-gray-400"
                            }`}>
                            {done ? <Check size={12} strokeWidth={3} /> : n}
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`h-0.5 flex-1 rounded-full transition ${done ? "bg-emerald-600" : "bg-gray-200"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function OnboardingStep2() {
    const router = useRouter();
    const { data, setData } = useOnboarding();

    const [brandName, setBrandName] = useState(data.brandName);
    const [bio, setBio] = useState(data.bio);
    const [instagram, setInstagram] = useState(data.instagram);
    const [tiktok, setTiktok] = useState(data.tiktok);
    const [facebook, setFacebook] = useState(data.facebook);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleContinue = async () => {
        if (!brandName.trim()) { setError("Please enter your brand name."); return; }
        if (!instagram.trim() && !tiktok.trim() && !facebook.trim()) {
            setError("Please add at least one social profile so we can verify you.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) { router.push("/auth"); return; }

            const { error: updateError } = await supabase
                .from("designers")
                .update({
                    brand_name: brandName,
                    bio,
                    instagram_handle: instagram,
                    tiktok_handle: tiktok,
                    facebook_handle: facebook,
                    onboarding_completed: true,
                })
                .eq("id", user.id);

            if (updateError) {
                setError("Failed to save: " + updateError.message);
                setSaving(false);
                return;
            }

            setData((prev) => ({ ...prev, brandName, bio, instagram, tiktok, facebook }));
            router.push("/designer-dashboard/onboarding/success");
        } catch (err: any) {
            setError("Unexpected error: " + err.message);
            setSaving(false);
        }
    };

    const canContinue = brandName.trim() && (instagram.trim() || tiktok.trim() || facebook.trim());

    return (
        <main className="min-h-screen bg-white">
            <nav className="border-b border-gray-100 px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link href="/" className="text-lg font-bold tracking-tight">
                        FitHouse<span className="text-emerald-600">Africa</span>
                    </Link>
                </div>
            </nav>

            <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl md:grid-cols-[1fr_420px]">
                <div className="flex flex-col justify-center px-6 py-16 md:px-16">
                    <StepTracker current={2} />

                    <button
                        onClick={() => router.back()}
                        className="mb-8 flex w-fit items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>

                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-600">
                        Your brand
                    </p>
                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
                        Tell customers{" "}
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                            who you are
                        </span>
                    </h1>
                    <p className="mb-10 text-sm text-gray-500">
                        This is how customers discover and remember you.
                    </p>

                    <div className="mb-6">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                            Brand Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="e.g. House of Tife"
                            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                            Bio <span className="font-normal text-gray-400">— optional</span>
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Describe your style, speciality and what makes your brand unique..."
                            rows={3}
                            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        />
                    </div>

                    <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="mb-3 text-xs font-semibold text-gray-600">
                            Social profile <span className="font-normal text-gray-400">— at least one, so we can verify you're a real designer</span>
                        </p>
                        <div className="space-y-2.5">
                            <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition">
                                <span className="flex items-center gap-1.5 border-r border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-500">
                                    <AtSign size={13} /> IG
                                </span>
                                <input
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    placeholder="yourbrand"
                                    className="h-11 flex-1 px-3 text-sm outline-none"
                                />
                            </div>
                            <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition">
                                <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-500">
                                    TikTok
                                </span>
                                <input
                                    value={tiktok}
                                    onChange={(e) => setTiktok(e.target.value)}
                                    placeholder="yourbrand"
                                    className="h-11 flex-1 px-3 text-sm outline-none"
                                />
                            </div>
                            <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition">
                                <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-500">
                                    FB
                                </span>
                                <input
                                    value={facebook}
                                    onChange={(e) => setFacebook(e.target.value)}
                                    placeholder="yourbrand"
                                    className="h-11 flex-1 px-3 text-sm outline-none"
                                />
                            </div>
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
                            <>Continue <ArrowRight size={16} /></>
                        )}
                    </button>
                </div>

                {/* RIGHT — live-ish preview, styled like the real public catalogue hero */}
                <div className="hidden flex-col justify-between bg-gray-900 px-10 py-16 md:flex">
                    <div>
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Setup · Step 2 of 3
                        </div>
                        <h2 className="mb-3 text-xl font-bold text-white">
                            This becomes your public storefront.
                        </h2>
                        <p className="mb-8 text-sm leading-relaxed text-gray-400">
                            Customers see this exact page when browsing your catalogue.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-950 shadow-xl">
                        <div className="relative h-28 bg-gradient-to-br from-emerald-700 via-emerald-800 to-gray-900">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                            <div className="absolute bottom-3 left-4 flex items-end gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/80 bg-emerald-500 text-xs font-bold text-white">
                                    {brandName?.[0]?.toUpperCase() ?? "?"}
                                </div>
                                <p className="pb-0.5 text-sm font-bold text-white drop-shadow">
                                    {brandName || "Your Brand Name"}
                                </p>
                            </div>
                        </div>
                        <div className="p-4">
                            {bio && (
                                <p className="mb-3 text-[11px] leading-relaxed text-gray-400 line-clamp-2">{bio}</p>
                            )}
                            <div className="grid grid-cols-3 gap-1.5">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="aspect-[3/4] rounded-lg bg-gray-800" />
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">Updates as you type ↑</p>
                </div>
            </div>
        </main>
    );
}