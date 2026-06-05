"use client";

import Link from "next/link";
import { Menu, Search, ArrowRight } from "lucide-react";

export default function ProfilePage() {
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
                                Brand Profile • 60%
                            </p>

                            <p className="text-sm text-gray-500">
                                Step 3 of 5
                            </p>
                        </div>

                        <div className="h-2 rounded-full bg-gray-200">
                            <div className="h-2 w-[60%] rounded-full bg-red-600" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl font-bold leading-tight">
                        Tell us about
                        <span className="text-red-600">
                            {" "}your brand
                        </span>
                    </h1>

                    <p className="mt-3 text-lg text-gray-600">
                        This helps customers trust
                        and discover your fashion
                        business.
                    </p>

                    {/* FORM */}
                    <div className="mt-8 space-y-5">
                        <Input
                            label="Brand Name"
                            placeholder="House of Tife"
                        />

                        <Input
                            label="Instagram Handle"
                            placeholder="@houseoftife"
                        />

                        <Input
                            label="Business Location"
                            placeholder="Lagos, Nigeria"
                        />

                        {/* Brand Description */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Brand Description
                            </label>

                            <textarea
                                placeholder="Tell customers about your style, specialty and brand..."
                                rows={5}
                                className="w-full rounded-2xl border border-gray-200 bg-white p-5 outline-none focus:border-red-500"
                            />
                        </div>

                        {/* Specialties */}
                        <div>
                            <label className="mb-3 block text-sm font-medium">
                                What do you specialize in?
                            </label>

                            <div className="flex flex-wrap gap-3">
                                {[
                                    "Aso Ebi",
                                    "Wedding",
                                    "Luxury",
                                    "Native Wear",
                                    "Corporate",
                                    "Casual",
                                ].map((item) => (
                                    <button
                                        key={item}
                                        className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm hover:border-red-500"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/become-designer/portfolio"
                        className="flex h-14 items-center justify-center rounded-xl bg-red-600 text-white"
                    >
                        Continue
                    </Link>

                </div>
            </section>
        </main>
    );
}

/* Input Component */
function Input({
    label,
    placeholder,
}: {
    label: string;
    placeholder: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium">
                {label}
            </label>

            <input
                type="text"
                placeholder={placeholder}
                className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-5 outline-none focus:border-red-500"
            />
        </div>
    );
}
