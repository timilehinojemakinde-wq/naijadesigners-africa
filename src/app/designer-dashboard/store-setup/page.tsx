"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function StoreSetupPage() {
    const router = useRouter();

    const [brandName, setBrandName] =
        useState("");

    const generateSlug = (
        brand: string
    ) => {
        return brand
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    };

    const slug =
        generateSlug(brandName);

    const [checkingSlug, setCheckingSlug] =
        useState(false);

    const [slugAvailable, setSlugAvailable] =
        useState<boolean | null>(null);

    useEffect(() => {
        const checkSlug = async () => {
            if (!slug) {
                setSlugAvailable(null);
                return;
            }

            setCheckingSlug(true);

            const { data } =
                await supabase
                    .from("storefronts")
                    .select("slug")
                    .eq("slug", slug)
                    .maybeSingle();

            setSlugAvailable(!data);

            setCheckingSlug(false);
        };

        const timeout =
            setTimeout(checkSlug, 500);

        return () =>
            clearTimeout(timeout);
    }, [slug]);



    const [location, setLocation] =
        useState("");

    const [whatsapp, setWhatsapp] =
        useState("");

    const [instagram, setInstagram] =
        useState("");

    const [bio, setBio] =
        useState("");

    const handleContinue = () => {
        const storeData = {
            brandName,
            slug,
            location,
            whatsapp,
            instagram,
            bio,
        };

        sessionStorage.setItem(
            "storeSetup",
            JSON.stringify(storeData)
        );

        router.push(
            "/designer-dashboard/add-product"
        );
    };

    return (
        <main className="min-h-screen bg-[#fafafa] pb-20">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <button
                        onClick={() =>
                            router.back()
                        }
                        className="rounded-[12px] border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold">
                            Set Up Store
                        </h1>

                        <p className="text-sm text-gray-500">
                            Create your
                            storefront to
                            start selling
                        </p>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-md px-5 py-6">
                <div className="rounded-[12px] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        Store Information
                    </h2>

                    {/* BRAND NAME */}
                    <input
                        value={brandName}
                        onChange={(e) =>
                            setBrandName(
                                e.target
                                    .value
                            )
                        }
                        placeholder="Brand Name"
                        className="mt-5 h-14 w-full rounded-[12px] border border-gray-200 px-4 outline-none focus:border-emerald-500"
                    />

                    {/* SLUG */}

                    <div className="mt-4 rounded-[12px] border border-gray-200 bg-[#fafafa] p-4">
                        <p className="text-sm text-gray-500">
                            Your Store Website Link
                        </p>

                        <div className="mt-2 rounded-[10px] bg-white p-3 text-sm font-medium text-emerald-600">
                            {brandName
                                ? `fithouse.africa/store/${slug}`
                                : "Enter your brand name"}
                        </div>

                        <div className="mt-2">
                            {checkingSlug ? (
                                <p className="text-sm text-gray-500">
                                    Checking availability...
                                </p>
                            ) : slugAvailable === true ? (
                                <p className="text-sm text-green-600">
                                    ✓ Store URL available
                                </p>
                            ) : slugAvailable === false ? (
                                <p className="text-sm text-emerald-600">
                                    ✕ URL already taken
                                </p>
                            ) : null}
                        </div>

                        <p className="mt-2 text-xs text-gray-400">
                            Your customers will shop here
                        </p>
                    </div>

                    {/* LOCATION */}
                    <input
                        value={location}
                        onChange={(e) =>
                            setLocation(
                                e.target
                                    .value
                            )
                        }
                        placeholder="Business Location"
                        className="mt-4 h-14 w-full rounded-[12px] border border-gray-200 px-4 outline-none focus:border-emerald-500"
                    />

                    {/* WHATSAPP */}
                    <input
                        value={whatsapp}
                        onChange={(e) =>
                            setWhatsapp(
                                e.target
                                    .value
                            )
                        }
                        placeholder="WhatsApp Number"
                        className="mt-4 h-14 w-full rounded-[12px] border border-gray-200 px-4 outline-none focus:border-emerald-500"
                    />

                    {/* INSTAGRAM */}
                    <input
                        value={instagram}
                        onChange={(e) =>
                            setInstagram(
                                e.target
                                    .value
                            )
                        }
                        placeholder="Instagram Handle"
                        className="mt-4 h-14 w-full rounded-[12px] border border-gray-200 px-4 outline-none focus:border-emerald-500"
                    />

                    {/* BIO */}
                    <textarea
                        value={bio}
                        onChange={(e) =>
                            setBio(
                                e.target
                                    .value
                            )
                        }
                        placeholder="Tell customers about your fashion brand..."
                        className="mt-4 min-h-[120px] w-full rounded-[12px] border border-gray-200 p-4 outline-none focus:border-emerald-500"
                    />
                </div>

                {/* CTA */}
                <button
                    onClick={handleContinue}
                    disabled={!slugAvailable}
                    className={`mt-8 h-14 w-full rounded-[12px] font-medium text-white ${slugAvailable
                        ? "bg-emerald-600"
                        : "cursor-not-allowed bg-gray-300"
                        }`}
                >
                    Create My Store
                </button>
            </section>
        </main >
    );
}