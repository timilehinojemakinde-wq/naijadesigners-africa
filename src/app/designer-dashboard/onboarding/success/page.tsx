"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Share2, ArrowRight, Package, Ruler, LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function OnboardingSuccess() {
    const router = useRouter();
    const [brandName, setBrandName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data } = await supabase
                .from("designers")
                .select("brand_name, slug")
                .eq("id", user.id)
                .single();

            if (data) {
                setBrandName(data.brand_name ?? "");
                setSlug(data.slug ?? "");
            }

            setLoading(false);
        };

        load();
    }, [router]);

    const storeUrl = typeof window !== "undefined"
        ? `${window.location.origin}/store/${slug}`
        : `/store/${slug}`;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: brandName,
                text: "Check out my fashion store on FitHouseAfrica",
                url: storeUrl,
            });
        } else {
            await navigator.clipboard.writeText(storeUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            {/* NAV */}
            <nav className="border-b border-gray-100 px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link href="/" className="text-lg font-bold tracking-tight">
                        FitHouse<span className="text-emerald-600">Africa</span>
                    </Link>
                </div>
            </nav>

            <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl md:grid-cols-2">

                {/* LEFT */}
                <div className="flex flex-col justify-center px-6 py-12 md:px-16">

                    {/* SUCCESS ICON */}
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600">
                        <Check size={32} className="text-white" strokeWidth={3} />
                    </div>

                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
                        Your store is live! 🎉
                    </h1>
                    <p className="mb-8 text-gray-500">
                        Welcome to FitHouseAfrica,{" "}
                        <span className="font-semibold text-gray-800">{brandName}</span>.
                        Your designer dashboard is ready — start building your fashion business.
                    </p>

                    {/* STORE LINK */}
                    <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Your Store Link
                        </p>
                        <p className="mb-3 text-sm font-semibold text-gray-800">
                            fithouse.africa/store/{slug}
                        </p>
                        <button
                            onClick={handleShare}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            <Share2 size={14} />
                            {copied ? "Link copied!" : "Share Your Store"}
                        </button>
                    </div>

                    {/* NEXT STEPS */}
                    <div className="mb-8 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">
                            3 things to do first:
                        </p>


                        {/* PRIMARY — Add product */}
                        <Link
                            href="/designer-dashboard/add-product"
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Add Your First Product <ArrowRight size={16} />
                        </Link>

                        {/* SECONDARY — Dashboard */}
                        <Link
                            href="/designer-dashboard"
                            className="flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                        >
                            Go to Dashboard
                        </Link>

                        <Link
                            href="/designer-dashboard/measurements"
                            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
                        >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                <Ruler size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">Try the AI measurement scan</p>
                                <p className="text-xs text-gray-500">Experience it before your clients do</p>
                            </div>
                            <ArrowRight size={16} className="text-gray-400" />
                        </Link>

                        <Link
                            href="/designer-dashboard"
                            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
                        >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                <LayoutDashboard size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">Explore your dashboard</p>
                                <p className="text-xs text-gray-500">Orders, invoices, store settings</p>
                            </div>
                            <ArrowRight size={16} className="text-gray-400" />
                        </Link>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="hidden flex-col justify-center bg-gray-900 px-12 py-12 md:flex">
                    <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        Setup Complete
                    </div>

                    <h2 className="mb-6 text-2xl font-bold text-white">
                        What happens next.
                    </h2>

                    <div className="space-y-6 mb-10">
                        {[
                            {
                                title: "Your 14-day free trial starts now",
                                desc: "Full access to all features. No credit card needed until your trial ends.",
                            },
                            {
                                title: "Add products to attract customers",
                                desc: "Designers with 5+ products get 3× more enquiries from the marketplace.",
                            },
                            {
                                title: "Send your first AI measurement link",
                                desc: "Share with an existing client today. They scan themselves in 60 seconds.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{item.title}</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Need help?
                        </p>
                        <p className="text-sm text-gray-400">
                            Reply to your welcome email or contact our support team. We're here to make sure your setup is flawless.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}