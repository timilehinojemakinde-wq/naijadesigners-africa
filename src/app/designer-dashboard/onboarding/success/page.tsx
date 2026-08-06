"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const SUPPORT_PHONE = "+2347066633446";
const SUPPORT_NAME = "Getrude";

export default function OnboardingSuccess() {
    const router = useRouter();
    const [brandName, setBrandName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data } = await supabase
                .from("designers")
                .select("brand_name")
                .eq("id", user.id)
                .single();

            setBrandName(data?.brand_name ?? "");
            setLoading(false);
        };
        load();
    }, [router]);

    const whatsappMessage = encodeURIComponent(
        `Hi Getrude! I just signed up as ${brandName || "a designer"} on FitHouseAfrica and had a question.`
    );

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <nav className="border-b border-gray-100 px-6 py-4">
                <div className="mx-auto max-w-6xl">
                    <Link href="/" className="text-lg font-bold tracking-tight">
                        FitHouse<span className="text-emerald-600">Africa</span>
                    </Link>
                </div>
            </nav>

            <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl md:grid-cols-2">
                {/* LEFT — the reframe lives here */}
                <div className="flex flex-col justify-center px-6 py-12 md:px-16">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                        <Check size={30} className="text-emerald-600" strokeWidth={3} />
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        You're in, {brandName || "welcome"}.
                    </h1>
                    <p className="mt-2 text-base text-gray-500">
                        One last step before you're fully set up.
                    </p>

                    {/* PROGRESS TRACKER */}
                    <div className="mt-8 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                                <Check size={15} strokeWidth={3} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Profile Created</p>
                                <p className="text-xs text-gray-400">Your brand and details are saved</p>
                            </div>
                        </div>

                        <div className="ml-4 h-6 w-px bg-gray-200" />

                        <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-white">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-emerald-700">Verifying Your Profile</p>
                                <p className="text-xs text-gray-400">Usually done within 24 hours</p>
                            </div>
                        </div>

                        <div className="ml-4 h-6 w-px bg-gray-200" />

                        <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
                                <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-400">Full Access</p>
                                <p className="text-xs text-gray-400">Your dashboard unlocks completely</p>
                            </div>
                        </div>
                    </div>

                    {/* WHY WE VERIFY — reframed as protection, not suspicion */}
                    <div className="mt-8 rounded-2xl bg-gray-50 p-5">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                            <ShieldCheck size={13} className="text-emerald-600" /> Why we check every profile
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                            We personally verify every designer — not to slow you down, but to keep this
                            platform genuine for the customers who'll be paying you. Your 14-day free trial
                            starts today either way. We're building a service, not just collecting signups.
                        </p>
                    </div>

                    <Link
                        href="/designer-dashboard"
                        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        Go to My Dashboard <ArrowRight size={16} />
                    </Link>
                </div>

                {/* RIGHT — the human touch */}
                <div className="hidden flex-col justify-between bg-gray-900 px-12 py-12 md:flex">
                    <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        A real person, not a bot
                    </div>

                    <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                                {SUPPORT_NAME[0]}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Hi, I'm {SUPPORT_NAME} 👋</p>
                                <p className="text-xs text-gray-400">FitHouseAfrica Support</p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-gray-300">
                            Welcome to FitHouseAfrica! I'll be reviewing your profile personally.
                            If you have any questions while you wait, or anytime after — message me
                            directly. I'm here to help you succeed, not just process a signup.
                        </p>
                        <a
                            href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-500"
                        >
                            <MessageCircle size={15} />
                            Message {SUPPORT_NAME} on WhatsApp
                        </a>
                    </div>

                    <div className="mt-8 space-y-4">
                        {[
                            { title: "Your 14-day free trial starts now", desc: "Full access to every feature once verified — no credit card needed." },
                            { title: "We check Instagram, TikTok, or Facebook", desc: "Whatever you gave us — just enough to confirm you're a real designer." },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{item.title}</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}