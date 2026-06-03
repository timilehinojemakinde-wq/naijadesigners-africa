"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ChevronDown, ArrowRight } from "lucide-react";

export default function EligibilityPage() {
    const [designerType, setDesignerType] =
        useState("");

    const [experience, setExperience] =
        useState("");

    const [clients, setClients] =
        useState("");

    const designerOptions = [
        "Fashion Designer",
        "Tailor",
        "Bridal Specialist",
        "Luxury Couture",
        "Ready-to-Wear",
        "Fashion House",
    ];

    const experienceOptions = [
        "0–1 year",
        "1–3 years",
        "3–5 years",
        "5+ years",
    ];

    const clientOptions = [
        "Yes, regularly",
        "Sometimes",
        "Just starting",
    ];

    return (
        <main className="min-h-screen bg-[#fafafa] text-black">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/">
                        <h1 className="cursor-pointer text-xl font-bold">
                            FitHouse
                            <span className="text-red-600">
                                Africa
                            </span>
                        </h1>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden items-center gap-6 md:flex">
                        <button className="hover:text-red-600">
                            Explore
                        </button>

                        <button className="hover:text-red-600">
                            Designers
                        </button>

                        <button className="hover:text-red-600">
                            Pricing
                        </button>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <button className="border-0 bg-transparent p-1">
                            <Search size={18} />
                        </button>

                        <button className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                            Become Designer
                        </button>

                        <button className="rounded-md border border-gray-300 p-2 hover:bg-gray-100 md:hidden">
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
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium text-red-600">
                                Business Info • 20%
                            </p>

                            <p className="text-sm text-gray-500">
                                Step 1 of 5
                            </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full w-[20%] rounded-full bg-red-600" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
                        Tell us about your
                        <span className="text-red-700">
                            {" "}fashion business
                        </span>
                    </h1>

                    <p className="mt-3 text-lg leading-8 text-gray-600">
                        This helps us personalize your
                        onboarding experience.
                    </p>

                    {/* QUESTION 1 */}
                    <div className="mt-10">
                        <h2 className="mb-4 text-lg font-semibold">
                            What best describes you?
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {designerOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() =>
                                        setDesignerType(option)
                                    }
                                    className={`rounded-[24px] border p-5 text-left transition ${designerType === option
                                        ? "border-red-500 bg-red-50 text-red-600"
                                        : "border-gray-200 bg-white hover:border-red-300"
                                        }`}
                                >
                                    <p className="font-medium">
                                        {option}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* QUESTION 2 */}
                    <div className="mt-10">
                        <h2 className="mb-4 text-lg font-semibold">
                            How long have you been designing?
                        </h2>

                        <div className="flex flex-wrap gap-3">
                            {experienceOptions.map(
                                (option) => (
                                    <button
                                        key={option}
                                        onClick={() =>
                                            setExperience(option)
                                        }
                                        className={`rounded-xl border px-5 py-3 transition ${experience === option
                                            ? "border-red-500 bg-red-600 text-white"
                                            : "border-gray-300 bg-white hover:border-red-400"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* QUESTION 3 */}
                    <div className="mt-10">
                        <h2 className="mb-4 text-lg font-semibold">
                            Where are you based?
                        </h2>

                        <div className="flex items-center justify-between rounded-[20px] border border-gray-200 bg-white px-5 py-4">
                            <span className="text-gray-500">
                                Select Country
                            </span>

                            <ChevronDown size={20} />
                        </div>
                    </div>

                    {/* QUESTION 4 */}
                    <div className="mt-10">
                        <h2 className="mb-4 text-lg font-semibold">
                            Do you currently have clients?
                        </h2>

                        <div className="grid gap-4">
                            {clientOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() =>
                                        setClients(option)
                                    }
                                    className={`rounded-[24px] border p-5 text-left transition ${clients === option
                                        ? "border-red-500 bg-red-50 text-red-600"
                                        : "border-gray-200 bg-white hover:border-red-300"
                                        }`}
                                >
                                    <p className="font-medium">
                                        {option}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/become-designer/signup"
                        className="mt-12 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-base font-semibold text-white transition hover:bg-red-700"
                    >
                        Continue
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
