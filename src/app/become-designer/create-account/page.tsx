"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Menu,
    Search,
    ArrowRight,
    Eye,
    EyeOff,
} from "lucide-react";

export default function SignupPage() {
    const [showPassword, setShowPassword] =
        useState(false);

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

                    {/* Desktop Links */}
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

                    {/* Right Side */}
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
                                Account Setup • 40%
                            </p>

                            <p className="text-sm text-gray-500">
                                Step 2 of 4
                            </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full w-[40%] rounded-full bg-red-600" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-2xl md:text-5xl lg:text-6xl leading-[1.05]">
                        Create your
                        <span className="text-red-700">
                            {" "}designer account
                        </span>
                    </h1>

                    <p className="mt-3 text-sm leading-8 text-gray-600">
                        Let’s set up your account in
                        under 2 minutes.
                    </p>

                    {/* FORM */}
                    <div className="mt-10 space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Timilehin Ojemakinde"
                                className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-6 outline-none transition focus:border-red-500"
                            />
                        </div>

                        {/* Brand Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Brand Name
                            </label>

                            <input
                                type="text"
                                placeholder="FitHouse Africa"
                                className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-5 outline-none transition focus:border-red-500"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-5 outline-none transition focus:border-red-500"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                placeholder="+234 801 234 5678"
                                className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-5 outline-none transition focus:border-red-500"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Create password"
                                    className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-5 pr-14 outline-none transition focus:border-red-500"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gray-200" />

                        <p className="text-sm text-gray-500">
                            or continue with
                        </p>

                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex h-14 items-center justify-center rounded-2xl border border-gray-200 bg-white font-medium transition hover:border-red-300">
                            Google
                        </button>

                        <button className="flex h-14 items-center justify-center rounded-2xl border border-gray-200 bg-white font-medium transition hover:border-red-300">
                            Apple
                        </button>
                    </div>

                    {/* Trust */}
                    <div className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
                        <div className="space-y-3 text-sm text-gray-600">
                            <p>✓ Free to apply</p>
                            <p>✓ No monthly fee to start</p>
                            <p>✓ Reach global customers</p>
                        </div>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/become-designer/profile"
                        className="flex h-14 items-center justify-center rounded-xl bg-red-600 text-white"
                    >
                        Continue
                    </Link>

                </div>
            </section>
        </main>
    );
}
