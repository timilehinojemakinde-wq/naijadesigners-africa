"use client";

import Link from "next/link";
import { ArrowLeft, ImagePlus, Video } from "lucide-react";

export default function UploadPhotosPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/designer-dashboard/store"
                        className="rounded-xl border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-xl font-bold">
                            Add Product
                        </h1>

                        <p className="text-sm text-gray-500">
                            Step 1 of 4 — Upload Photos
                        </p>
                    </div>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* Progress */}
                <div className="mb-8 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-1/4 rounded-full bg-red-600" />
                </div>

                {/* Title */}
                <div>
                    <h2 className="text-3xl font-bold leading-tight">
                        Upload Product
                        <span className="text-red-600">
                            {" "}Photos
                        </span>
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Add clear images to help customers
                        trust and buy faster.
                    </p>
                </div>

                {/* MAIN IMAGE */}
                <div className="mt-8">
                    <p className="mb-3 font-semibold">
                        Cover Image
                        <span className="text-red-600">
                            {" "}*
                        </span>
                    </p>

                    <button className="flex h-[220px] w-full flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-red-300 bg-red-50 transition hover:bg-red-100">
                        <ImagePlus
                            size={36}
                            className="text-red-600"
                        />

                        <p className="mt-4 font-medium text-red-700">
                            Upload Main Photo
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            JPG, PNG • Max 10MB
                        </p>
                    </button>
                </div>

                {/* EXTRA IMAGES */}
                <div className="mt-10">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="font-semibold">
                            Extra Photos
                        </p>

                        <span className="text-sm text-gray-500">
                            Up to 6 images
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <button
                                key={item}
                                className="flex aspect-square items-center justify-center rounded-[24px] border border-gray-200 bg-white"
                            >
                                <ImagePlus
                                    size={24}
                                    className="text-gray-400"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* OPTIONAL VIDEO */}
                <div className="mt-10 rounded-[28px] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-50 p-3 text-red-600">
                            <Video size={22} />
                        </div>

                        <div>
                            <h3 className="font-semibold">
                                Add Product Video
                            </h3>

                            <p className="text-sm text-gray-500">
                                Optional (better conversion)
                            </p>
                        </div>
                    </div>

                    <button className="mt-5 w-full rounded-xl border border-gray-200 py-4 font-medium transition hover:border-red-400">
                        Upload Video
                    </button>
                </div>

                {/* INFO CARD */}
                <div className="mt-8 rounded-[28px] bg-red-50 p-5">
                    <h3 className="font-semibold text-red-700">
                        Pro Tip
                    </h3>

                    <p className="mt-2 text-sm text-gray-700">
                        Products with 4+ images and
                        videos usually get more orders.
                    </p>
                </div>

                {/* CTA */}
                <div className="mt-10">
                    <Link
                        href="/designer-dashboard/store/add-product/product-details"
                        className="flex h-14 items-center justify-center rounded-xl bg-red-600 text-base font-medium text-white transition hover:bg-red-700"
                    >
                        Continue
                    </Link>
                </div>
            </section>
        </main>
    );
}
