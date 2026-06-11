"use client";

import Link from "next/link";
import {
    Menu,
    Search,
    ArrowRight,
    CircleCheck,
} from "lucide-react";

export default function ReviewPage() {
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
                                Review • 100%
                            </p>

                            <p className="text-sm text-gray-500">
                                Step 5 of 5
                            </p>
                        </div>

                        <div className="h-2 rounded-full bg-gray-200">
                            <div className="h-2 w-full rounded-full bg-red-600" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-2xl font-bold leading-tight">
                        Review your
                        <span className="text-red-600">
                            {" "}application
                        </span>
                    </h1>

                    <p className="mt-3 text-sm text-gray-600">
                        Confirm everything looks good
                        before submitting.
                    </p>

                    {/* Summary Cards */}
                    <div className="mt-8 space-y-4">
                        {[
                            {
                                title: "Business Type",
                                value: "Luxury Couture",
                            },
                            {
                                title: "Experience",
                                value: "3–5 years",
                            },
                            {
                                title: "Location",
                                value: "Lagos, Nigeria",
                            },
                            {
                                title: "Portfolio",
                                value: "3 images uploaded",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="rounded-[6px] border border-gray-200 bg-white p-5"
                            >
                                <p className="text-sm text-gray-500">
                                    {item.title}
                                </p>

                                <p className="mt-1 text-lg font-semibold">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Approval Notice */}
                    <div className="mt-8 rounded-[6px] bg-red-50 p-5">
                        <div className="flex gap-3">
                            <CircleCheck className="mt-1 text-red-600" />

                            <div>
                                <h3 className="font-semibold">
                                    Application Review
                                </h3>

                                <p className="mt-1 text-sm text-gray-600">
                                    Our team reviews applications
                                    within 24–48 hours. You’ll be
                                    notified by email.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <Link
                        href="/auth"
                        className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-white"
                    >
                        Submit Application
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
