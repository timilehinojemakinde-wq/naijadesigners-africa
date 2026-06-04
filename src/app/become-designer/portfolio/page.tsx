"use client";

import Link from "next/link";
import { Menu, Search, ArrowRight, Upload } from "lucide-react";

export default function PortfolioPage() {
    return (
        <main className="min-h-screen bg-[#fafafa]">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <h1 className="text-xl font-bold">
                        FitHouse
                        <span className="text-red-600">
                            Africa
                        </span>
                    </h1>

                    <div className="flex items-center gap-3">
                        <button>
                            <Search size={18} />
                        </button>

                        <button className="rounded-md border border-gray-300 p-2 md:hidden">
                            <Menu size={16} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* CONTENT */}
            <section className="px-5 py-8">
                <div className="mx-auto max-w-2xl">
                    {/* Progress */}
                    <div className="mb-8">
                        <div className="mb-2 flex justify-between">
                            <p className="text-sm font-medium text-red-600">
                                Portfolio • 80%
                            </p>

                            <p className="text-sm text-gray-500">
                                Step 4 of 5
                            </p>
                        </div>

                        <div className="h-2 rounded-full bg-gray-200">
                            <div className="h-2 w-[80%] rounded-full bg-red-600" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl font-bold leading-tight">
                        Upload your
                        <span className="text-red-600">
                            {" "}best designs
                        </span>
                    </h1>

                    <p className="mt-3 text-lg text-gray-600">
                        Show customers your best work.
                        Upload at least 3 fashion photos.
                    </p>

                    {/* Upload Box */}
                    <div className="mt-8 rounded-[28px] border-2 border-dashed border-red-200 bg-white p-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                            <Upload
                                size={28}
                                className="text-red-600"
                            />
                        </div>

                        <h3 className="mt-5 text-lg font-semibold">
                            Upload Portfolio Images
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                            PNG, JPG up to 10MB
                        </p>

                        <button className="mt-5 rounded-xl bg-red-600 px-6 py-3 text-white">
                            Choose Images
                        </button>
                    </div>

                    {/* Preview Grid */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="aspect-square rounded-[24px] bg-gray-200"
                            />
                        ))}
                    </div>

                    {/* CTA */}
                    <Link
                        href="/become-designer/review"
                        className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-white"
                    >
                        Continue
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </main>
    );
}