"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "./layout";
import { supabase } from "@/lib/supabaseClient";

const BUSINESS_TYPES = [
    { value: "fashion_designer", label: "Fashion Designer", emoji: "✂️" },
    { value: "tailor", label: "Tailor", emoji: "🧵" },
    { value: "bridal_specialist", label: "Bridal Specialist", emoji: "👰" },
    { value: "fashion_house", label: "Fashion House", emoji: "🏛️" },
    { value: "ready_to_wear", label: "Ready to Wear", emoji: "👗" },
    { value: "luxury_couture", label: "Luxury Couture", emoji: "💎" },
];

const EXPERIENCE_OPTIONS = [
    { value: "0", label: "0–1 year" },
    { value: "2", label: "1–3 years" },
    { value: "4", label: "3–5 years" },
    { value: "6", label: "5+ years" },
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
        if (!businessType) { setError("Please select your business type."); return; }
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

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="border-b border-gray-100 bg-white px-5 py-6">
                <div className="mx-auto max-w-md">
                    {/* PROGRESS */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-1.5 flex-1 rounded-full bg-red-600" />
                        <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
                        <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
                    </div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                        Step 1 of 3
                    </p>
                    <h1 className="mt-1 text-2xl font-bold">
                        Tell us about your business
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        This helps us personalise your store and connect you with the right customers.
                    </p>
                </div>
            </header>

            <section className="mx-auto max-w-md space-y-6 px-5 py-6">
                {/* BUSINESS TYPE */}
                <div className="rounded-[16px] bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700">
                        What best describes you?
                    </h2>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        {BUSINESS_TYPES.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setBusinessType(type.value)}
                                className={`flex flex-col items-start rounded-[12px] border-2 p-4 text-left transition ${businessType === type.value
                                    ? "border-red-600 bg-red-50"
                                    : "border-gray-200 bg-white"
                                    }`}
                            >
                                <span className="text-2xl">{type.emoji}</span>
                                <span className="mt-2 text-sm font-medium">
                                    {type.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* EXPERIENCE */}
                <div className="rounded-[16px] bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700">
                        How long have you been designing?
                    </h2>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        {EXPERIENCE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setYearsExperience(opt.value)}
                                className={`rounded-[12px] border-2 py-3 text-sm font-medium transition ${yearsExperience === opt.value
                                    ? "border-red-600 bg-red-50 text-red-600"
                                    : "border-gray-200 bg-white text-gray-700"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LOCATION */}
                <div className="rounded-[16px] bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Where are you based?
                    </h2>
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Lagos, Nigeria"
                        className="mt-3 h-14 w-full rounded-[12px] border border-gray-200 px-4 text-sm outline-none focus:border-red-500"
                    />
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
                    {saving ? "Saving..." : "Continue →"}
                </button>
            </section>
        </main>
    );
}