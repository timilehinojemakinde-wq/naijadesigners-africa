"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useOnboarding } from "./layout";
import { supabase } from "@/lib/supabaseClient";

const BUSINESS_TYPES = [
    { value: "fashion_designer", label: "Fashion Designer", desc: "Original designs & custom pieces", emoji: "✂️" },
    { value: "tailor", label: "Tailor", desc: "Sewing & alterations for clients", emoji: "🧵" },
    { value: "bridal_specialist", label: "Bridal Specialist", desc: "Wedding & bridal wear", emoji: "👰" },
    { value: "fashion_house", label: "Fashion House", desc: "Team or studio, multiple designers", emoji: "🏛️" },
    { value: "ready_to_wear", label: "Ready to Wear", desc: "Finished pieces, standard sizes", emoji: "👗" },
    { value: "luxury_couture", label: "Luxury Couture", desc: "High-end, premium fashion", emoji: "💎" },
];

const EXPERIENCE_OPTIONS = [
    { value: "0", label: "0–1 yr" },
    { value: "2", label: "1–3 yrs" },
    { value: "4", label: "3–5 yrs" },
    { value: "6", label: "5+ yrs" },
];

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
            <nav className="border-b border-gray-100 px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link href="/" className="text-lg font-bold tracking-tight">
                        FitHouse<span className="text-emerald-600">Africa</span>
                    </Link>
                </div>
            </nav>

            <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl md:grid-cols-[1fr_420px]">
                <div className="flex flex-col justify-center px-6 py-16 md:px-16">
                    <StepTracker current={1} />

                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-600">
                        About you
                    </p>
                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
                        What best describes{" "}
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                            your work?
                        </span>
                    </h1>
                    <p className="mb-8 text-sm text-gray-500">
                        We'll use this to personalise your dashboard and storefront.
                    </p>

                    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {BUSINESS_TYPES.map((type) => {
                            const selected = businessType === type.value;
                            return (
                                <button
                                    key={type.value}
                                    onClick={() => setBusinessType(type.value)}
                                    className={`relative flex flex-col gap-2 rounded-2xl border p-4 text-left transition ${selected
                                            ? "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500/20"
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                        }`}
                                >
                                    {selected && (
                                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600">
                                            <Check size={11} className="text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                    <span className="text-2xl">{type.emoji}</span>
                                    <div>
                                        <p className={`text-sm font-bold ${selected ? "text-emerald-700" : "text-gray-800"}`}>
                                            {type.label}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400">{type.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mb-8">
                        <p className="mb-3 text-sm font-semibold text-gray-700">Years of experience</p>
                        <div className="flex gap-2">
                            {EXPERIENCE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setYearsExperience(opt.value)}
                                    className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${yearsExperience === opt.value
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

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

                <div className="hidden flex-col justify-center bg-gray-900 px-10 py-16 md:flex">
                    <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        Setup · Step 1 of 3
                    </div>

                    <h2 className="mb-3 text-xl font-bold text-white">
                        This is what you're walking into.
                    </h2>
                    <p className="mb-8 text-sm leading-relaxed text-gray-400">
                        Your real dashboard — orders, measurements, storefront, all in one place.
                    </p>

                    <div className="relative mx-auto max-w-[220px]">
                        <div className="absolute -inset-6 rounded-full bg-emerald-500/10 blur-3xl" />
                        <img
                            src="/images/dashboard-preview.png"
                            alt="FitHouseAfrica dashboard preview"
                            className="relative w-full drop-shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}