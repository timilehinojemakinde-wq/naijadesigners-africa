"use client";

import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Globe,
    Shirt,
    Truck,
} from "lucide-react";

export default function PublishPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/designer-dashboard/store/add-product/pricing"
                        className="rounded-xl border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-xl font-bold">
                            Add Product
                        </h1>

                        <p className="text-sm text-gray-500">
                            Step 4 of 4 — Publish Product
                        </p>
                    </div>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* Progress */}
                <div className="mb-8 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-full rounded-full bg-red-600" />
                </div>

                {/* TITLE */}
                <div>
                    <h2 className="text-3xl font-bold leading-tight">
                        Review &
                        <span className="text-red-600">
                            {" "}Publish
                        </span>
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Review product details before publishing.
                    </p>
                </div>

                {/* PRODUCT PREVIEW */}
                <div className="mt-8 overflow-hidden rounded-[32px] bg-white shadow-sm">
                    {/* Placeholder image */}
                    <div className="h-[260px] bg-gray-100" />

                    <div className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="rounded-full bg-red-50 px-3 py-1 text-sm text-red-600">
                                    Wedding
                                </p>

                                <h3 className="mt-3 text-2xl font-bold">
                                    Luxury Wedding Dress
                                </h3>

                                <p className="mt-2 text-lg font-semibold text-red-600">
                                    ₦250,000
                                </p>
                            </div>

                            <CheckCircle2
                                size={28}
                                className="text-green-500"
                            />
                        </div>

                        <p className="mt-4 text-gray-600">
                            Premium luxury wedding dress
                            tailored with high-quality fabric
                            for modern brides.
                        </p>
                    </div>
                </div>

                {/* PRODUCT DETAILS */}
                <div className="mt-8 space-y-4">
                    <InfoCard
                        icon={<Shirt size={20} />}
                        title="AI Measurement"
                        subtitle="Required for this product"
                    />

                    <InfoCard
                        icon={<Truck size={20} />}
                        title="Production Timeline"
                        subtitle="2 Weeks"
                    />

                    <InfoCard
                        icon={<Globe size={20} />}
                        title="International Shipping"
                        subtitle="Available"
                    />
                </div>

                {/* MARKETPLACE INFO */}
                <div className="mt-8 rounded-[28px] bg-red-50 p-5">
                    <h3 className="font-semibold text-red-700">
                        Marketplace Distribution
                    </h3>

                    <p className="mt-2 text-sm text-gray-700">
                        Once published, this product will
                        automatically appear in:
                    </p>

                    <div className="mt-4 space-y-2 text-sm">
                        <p>✓ Your Storefront</p>
                        <p>✓ FitHouse Marketplace</p>
                        <p>✓ Wedding Category</p>
                        <p>✓ Search Results</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-10 flex gap-3">
                    <button className="flex h-14 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white font-medium">
                        Save Draft
                    </button>

                    <Link
                        href="/designer-dashboard/store"
                        className="flex h-14 flex-1 items-center justify-center rounded-xl bg-red-600 font-medium text-white"
                    >
                        Publish Product
                    </Link>
                </div>
            </section>
        </main>
    );
}

function InfoCard({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-[24px] bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
                {icon}
            </div>

            <div>
                <h4 className="font-medium">
                    {title}
                </h4>

                <p className="text-sm text-gray-500">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}