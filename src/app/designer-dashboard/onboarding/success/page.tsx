"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function OnboardingSuccess() {
    const router = useRouter();
    const [brandName, setBrandName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }

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

    const storeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/store/${slug}`;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: brandName,
                text: "Check out my fashion store on FitHouseAfrica",
                url: storeUrl,
            });
        } else {
            await navigator.clipboard.writeText(storeUrl);
            alert("Store link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-5">
            <div className="w-full max-w-md">
                {/* SUCCESS ICON */}
                <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle size={44} className="text-green-600" />
                    </div>
                </div>

                {/* HEADING */}
                <div className="mt-6 text-center">
                    <h1 className="text-2xl font-bold">
                        Your store is live! 🎉
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Welcome to FitHouseAfrica,{" "}
                        <span className="font-semibold text-gray-700">
                            {brandName}
                        </span>
                        . Start adding products to attract customers.
                    </p>
                </div>

                {/* STORE LINK CARD */}
                <div className="mt-6 rounded-[16px] bg-black p-5 text-white">
                    <p className="text-xs text-gray-400">Your Store Link</p>
                    <p className="mt-1 text-sm font-semibold">
                        fithouse.africa/store/{slug}
                    </p>
                    <button
                        onClick={handleShare}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] bg-white py-3 text-sm font-semibold text-black"
                    >
                        <Share2 size={15} />
                        Share Your Store
                    </button>
                </div>

                {/* CTAs */}
                <div className="mt-4 space-y-3">
                    <Link
                        href="/designer-dashboard/add-product"
                        className="flex h-14 w-full items-center justify-center rounded-[12px] bg-red-600 font-semibold text-white"
                    >
                        Add Your First Product
                    </Link>

                    <Link
                        href="/designer-dashboard"
                        className="flex h-12 w-full items-center justify-center rounded-[12px] border border-gray-300 text-sm font-medium text-gray-700"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}