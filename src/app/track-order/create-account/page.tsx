"use client";

import Link from "next/link";
import {
    ArrowLeft,
    UserPlus,
    Mail,
    Lock,
    Phone,
} from "lucide-react";

export default function CreateAccountPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/measurement/success"
                        className="rounded-xl border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-lg font-bold">
                            Create Account
                        </h1>

                        <p className="text-sm text-gray-500">
                            Track your order anytime
                        </p>
                    </div>
                </div>
            </header>

            <section className="px-5 py-8">
                {/* HERO */}
                <div>
                    <div className="inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                        Stay Updated
                    </div>

                    <h1 className="mt-6 text-[38px] font-bold leading-[1]">
                        Track Your
                        <span className="text-red-600">
                            {" "}Order
                        </span>
                    </h1>

                    <p className="mt-4 text-lg text-gray-600">
                        Create an account to view
                        real-time updates from your
                        designer.
                    </p>
                </div>

                {/* FORM */}
                <div className="mt-8 space-y-5">
                    <InputField
                        icon={<UserPlus size={20} />}
                        placeholder="Full Name"
                    />

                    <InputField
                        icon={<Mail size={20} />}
                        placeholder="Email Address"
                    />

                    <InputField
                        icon={<Phone size={20} />}
                        placeholder="Phone Number"
                    />

                    <InputField
                        icon={<Lock size={20} />}
                        placeholder="Create Password"
                    />
                </div>

                {/* BENEFITS */}
                <div className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold">
                        What you get
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div>✓ Live order tracking</div>
                        <div>✓ Designer updates</div>
                        <div>✓ Delivery notifications</div>
                        <div>✓ Measurement history</div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-10 space-y-3">
                    <Link
                        href="/track-order"
                        className="flex h-14 items-center justify-center rounded-xl bg-red-600 text-base font-semibold text-white"
                    >
                        Create Account
                    </Link>

                    <Link
                        href="/track-order"
                        className="flex h-14 items-center justify-center rounded-xl border border-gray-300 bg-white text-base font-medium text-gray-800"
                    >
                        Skip For Now
                    </Link>

                    <p className="text-center text-sm text-gray-500">
                        You can always track your order later.
                    </p>
                </div>
            </section>
        </main>
    );
}

function InputField({
    icon,
    placeholder,
}: {
    icon: React.ReactNode;
    placeholder: string;
}) {
    return (
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
            </div>

            <input
                type="text"
                placeholder={placeholder}
                className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 outline-none focus:border-red-500"
            />
        </div>
    );
}
