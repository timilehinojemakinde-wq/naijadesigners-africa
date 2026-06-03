"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Search,
    Menu,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

export default function SignupPage() {
    const [showPassword, setShowPassword] =
        useState(false);

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
                                Account Setup • 40%
                            </p>

                            <p className="text-sm text-gray-500">
                                Step 2 of 5
                            </p>
                        </div>

                        <div className="h-2 rounded-full bg-gray-200">
                            <div className="h-2 w-[40%] rounded-full bg-red-600" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl font-bold leading-tight">
                        Create your
                        <span className="text-red-600">
                            {" "}designer account
                        </span>
                    </h1>

                    <p className="mt-3 text-lg text-gray-600">
                        Let’s get you set up in under
                        2 minutes.
                    </p>

                    {/* FORM */}
                    <div className="mt-8 space-y-5">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                        />

                        <Input
                            label="Brand Name"
                            placeholder="House of Tife"
                        />

                        <Input
                            label="Email Address"
                            placeholder="hello@email.com"
                        />

                        <Input
                            label="Phone Number"
                            placeholder="+234..."
                        />

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
                                    className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-5 pr-14 outline-none focus:border-red-500"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
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

                    {/* Social */}
                    <div className="my-8 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />
                        <p className="text-sm text-gray-500">
                            or continue with
                        </p>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="h-14 rounded-2xl border border-gray-200 bg-white font-medium">
                            Google
                        </button>

                        <button className="h-14 rounded-2xl border border-gray-200 bg-white font-medium">
                            Apple
                        </button>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/become-designer/profile"
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

/* Reusable Input */
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
