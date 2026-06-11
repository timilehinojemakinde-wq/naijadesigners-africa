"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Share2,
    ExternalLink,
} from "lucide-react";

export default function PreviewStorePage() {
    const brandSlug = "your-brand";

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* Header */}
            <section className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/designer-dashboard/store"
                            className="rounded-[12px] border border-gray-200 p-2"
                        >
                            <ArrowLeft size={18} />
                        </Link>

                        <div>
                            <p className="text-xs text-gray-500">
                                Store Preview
                            </p>

                            <h1 className="font-medium">
                                Your Storefront
                            </h1>
                        </div>
                    </div>

                    <button className="rounded-[12px] bg-black px-4 py-2 text-sm text-white">
                        Share
                    </button>
                </div>
            </section>

            {/* Browser Bar */}
            <section className="px-5 pt-5">
                <div className="rounded-[12px] border border-gray-200 bg-white p-3">
                    <p className="truncate text-sm text-gray-500">
                        fithouseafrica.com/store/
                        {brandSlug}
                    </p>
                </div>
            </section>

            {/* Store Hero */}
            <section className="px-5 pt-5">
                <div className="rounded-[12px] bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-200" />

                        <div>
                            <h2 className="text-lg font-semibold">
                                Your Brand Name
                            </h2>

                            <p className="text-sm text-gray-500">
                                Lagos, Nigeria
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-gray-600">
                        Luxury fashion designer creating
                        timeless ready-to-wear and
                        custom pieces.
                    </p>

                    <div className="mt-5 flex gap-3">
                        <button className="flex-1 rounded-[12px] bg-red-600 py-3 text-sm font-medium text-white">
                            Contact Designer
                        </button>

                        <button className="rounded-[12px] border border-gray-200 px-4">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Product Grid */}
            <section className="px-5 pt-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">
                        Products
                    </h3>

                    <p className="text-sm text-gray-500">
                        0 items
                    </p>
                </div>

                {/* Empty State */}
                <div className="rounded-[12px] border border-dashed border-gray-300 bg-white p-8 text-center">
                    <h3 className="font-medium">
                        No products yet
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                        Products you upload will
                        appear here.
                    </p>
                </div>
            </section>

            {/* Visit Public Store */}
            <section className="fixed bottom-5 left-5 right-5">
                <Link
                    href={`/store/${brandSlug}`}
                    className="flex h-14 items-center justify-center gap-2 rounded-[12px] bg-black text-white shadow-lg"
                >
                    Visit Public Store
                    <ExternalLink size={18} />
                </Link>
            </section>
        </main>
    );
}
