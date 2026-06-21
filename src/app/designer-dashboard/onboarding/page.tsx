"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useOnboarding } from "./layout";
import { supabase } from "@/lib/supabaseClient";

const BUSINESS_TYPES = [
    {
        value: "fashion_designer",
        label: "Fashion Designer",
        desc: "I create original designs and custom pieces",
        emoji: "✂️",
    },
    {
        value: "tailor",
        label: "Tailor",
        desc: "I sew and alter garments for clients",
        emoji: "🧵",
    },
    {
        value: "bridal_specialist",
        label: "Bridal Specialist",
        desc: "I focus on wedding and bridal wear",
        emoji: "👰",
    },
    {
        value: "fashion_house",
        label: "Fashion House",
        desc: "I run a team or studio with multiple designers",
        emoji: "🏛️",
    },
    {
        value: "ready_to_wear",
        label: "Ready to Wear",
        desc: "I sell finished pieces in standard sizes",
        emoji: "👗",
    },
    {
        value: "luxury_couture",
        label: "Luxury Couture",
        desc: "I create high-end, premium fashion pieces",
        emoji: "💎",
    },
];

const EXPERIENCE_OPTIONS = [
    { value: "0", label: "0–1 yr" },
    { value: "2", label: "1–3 yrs" },
    { value: "4", label: "3–5 yrs" },
    { value: "6", label: "5+ yrs" },
];

export default function OnboardingStep1() {
    const router = useRouter();
    const { data, setData } = useOnboarding();

    const [businessType, setBusinessType] = useState(data.businessType);
    const [yearsExperience, setYearsExperience] = useState(data.yearsExperience);
    const [location, setLocation] = useState(data.location);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleContinue = async () => {
        if (!businessType) { setError("Please select what best describes you."); return; }
        if (!yearsExperience) { setError("Please select your experience level."); return; }
        if (!location.trim()) { setError("Please enter your location."); return; }

        setSaving(true);
        setError("");

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) { router.push("/auth"); return; }

            const { error: updateError } = await supabase
                .from("designers")
                .update({
                    business_type: businessType,
                    years_experience: parseInt(yearsExperience),
                    business_location: location,
                })
                .eq("id", user.id);

            if (updateError) {
                setError("Failed to save: " + updateError.message);
                setSaving(false);
                return;
            }

            setData((prev) => ({ ...prev, businessType, yearsExperience, location }));
            router.push("/designer-dashboard/onboarding/brand");
        } catch (err: any) {
            setError("Unexpected error: " + err.message);
            setSaving(false);
        }
    };

    const canContinue = businessType && yearsExperience && location.trim();

    return (
        <main className="min-h-screen bg-white">
            {/* NAV */}
            <nav className="border-b border-gray-100 px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link href="/" className="text-lg font-bold tracking-tight">
                        FitHouse<span className="text-emerald-600">Africa</span>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="font-semibold text-emerald-600">Step 1</span>
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
                        <div className="h-0.5 flex-1 rounded-full bg-gray-200" />
                        <div className="h-0.5 flex-1 rounded-full bg-gray-200" />
                    </div>

                    {/* HEADLINE */}
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-600">
                        About you
                    </p>
                    <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                        What best describes your work?
                    </h1>
                    <p className="mb-8 text-sm text-gray-500">
                        We'll use this to personalise your dashboard and storefront.
                    </p>

                    {/* BUSINESS TYPE — single column list */}
                    <div className="mb-8 space-y-2">
                        {BUSINESS_TYPES.map((type) => {
                            const selected = businessType === type.value;
                            return (
                                <button
                                    key={type.value}
                                    onClick={() => setBusinessType(type.value)}
                                    className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition ${selected
                                            ? "border-emerald-600 bg-emerald-50"
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <span className="text-xl">{type.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold ${selected ? "text-emerald-700" : "text-gray-800"}`}>
                                            {type.label}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {type.desc}
                                        </p>
                                    </div>
                                    <div className={`h-4 w-4 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition ${selected
                                            ? "border-emerald-600 bg-emerald-600"
                                            : "border-gray-300"
                                        }`}>
                                        {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* EXPERIENCE — horizontal pills */}
                    <div className="mb-8">
                        <p className="mb-3 text-sm font-semibold text-gray-700">
                            Years of experience
                        </p>
                        <div className="flex gap-2">
                            {EXPERIENCE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setYearsExperience(opt.value)}
                                    className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition ${yearsExperience === opt.value
                                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* LOCATION */}
                    <div className="mb-8">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Where are you based?
                        </label>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                            placeholder="e.g. Lagos, Nigeria"
                            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        />
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

                {/* RIGHT — Context */}
                <div className="hidden flex-col justify-between bg-gray-900 px-10 py-16 md:flex">
                    <div>
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                            Setup · Step 1 of 3
                        </div>

                        <h2 className="mb-3 text-xl font-bold text-white">
                            Your setup takes under 3 minutes.
                        </h2>
                        <p className="mb-10 text-sm leading-relaxed text-gray-400">
                            Answer 3 questions and your store goes live instantly. No technical knowledge needed.
                        </p>

                        <div className="space-y-4">
                            {[
                                { step: "01", title: "About you", desc: "Business type & location", active: true, done: false },
                                { step: "02", title: "Your brand", desc: "Name, store URL & bio", active: false, done: false },
                                { step: "03", title: "Go live", desc: "Your store launches instantly", active: false, done: false },
                            ].map((item) => (
                                <div key={item.step} className="flex items-start gap-3">
                                    <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${item.active
                                            ? "bg-emerald-600 text-white"
                                            : "border border-gray-700 text-gray-600"
                                        }`}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold ${item.active ? "text-white" : "text-gray-600"}`}>
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 rounded-xl border border-gray-700 bg-gray-800 p-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Why we ask
                        </p>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Your business type determines how your storefront is configured — from measurement workflows to order pipeline defaults. It takes 30 seconds and saves hours later.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}