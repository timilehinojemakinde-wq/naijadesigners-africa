"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Copy,
    MessageCircle,
    Sparkles,
} from "lucide-react";

export default function GenerateMeasurementLinkPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/designer-dashboard/measurements"
                        className="rounded-xl border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-xl font-bold">
                            Measurement Link
                        </h1>

                        <p className="text-sm text-gray-500">
                            Generate AI body scan link
                        </p>
                    </div>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* TITLE */}
                <div>
                    <h2 className="text-3xl font-bold leading-tight">
                        Generate
                        <span className="text-red-600">
                            {" "}Measurement Link
                        </span>
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Send customers a secure AI
                        measurement link via WhatsApp
                        or email.
                    </p>
                </div>

                {/* FORM */}
                <div className="mt-8 space-y-5">
                    {/* CUSTOMER NAME */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Customer Name
                        </label>

                        <input
                            type="text"
                            placeholder="Enter customer name"
                            className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500"
                        />
                    </div>

                    {/* ORDER NAME */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Order Name
                            <span className="text-gray-400">
                                {" "} (Optional)
                            </span>
                        </label>

                        <input
                            type="text"
                            placeholder="Wedding Dress"
                            className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500"
                        />
                    </div>

                    {/* MEASUREMENT TYPE */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Measurement Type
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                "Full Body",
                                "Top Only",
                                "Trouser Only",
                                "Dress",
                            ].map((item) => (
                                <button
                                    key={item}
                                    className="rounded-2xl border border-gray-200 bg-white py-4 font-medium transition hover:border-red-400"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* EXPIRY */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Link Expiry
                        </label>

                        <select className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500">
                            <option>7 Days</option>
                            <option>14 Days</option>
                            <option>30 Days</option>
                            <option>No Expiry</option>
                        </select>
                    </div>
                </div>

                {/* GENERATED LINK */}
                <div className="mt-8 rounded-[30px] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-50 p-3 text-red-600">
                            <Sparkles size={22} />
                        </div>

                        <div>
                            <h3 className="font-semibold">
                                Generated Link
                            </h3>

                            <p className="text-sm text-gray-500">
                                Ready to share
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-gray-100 p-4 text-sm text-gray-700 break-all">
                        fithouse.africa/measurement/welcome?id=abc123
                    </div>

                    <div className="mt-5 flex gap-3">
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-4 font-medium">
                            <Copy size={18} />
                            Copy
                        </button>

                        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 font-medium text-white">
                            <MessageCircle size={18} />
                            WhatsApp
                        </button>
                    </div>
                </div>

                {/* INFO */}
                <div className="mt-8 rounded-[28px] bg-red-50 p-5">
                    <h3 className="font-semibold text-red-700">
                        How it works
                    </h3>

                    <p className="mt-2 text-sm text-gray-700">
                        Customer opens link → takes
                        front & side photo → enters
                        height → AI generates accurate
                        body measurements → instantly
                        appears in your measurement book.
                    </p>
                </div>

                {/* CTA */}
                <div className="mt-10">
                    <Link
                        href="/measurement/welcome"
                        className="flex h-14 items-center justify-center rounded-xl bg-red-600 text-base font-medium text-white"
                    >
                        Preview Customer Flow
                    </Link>
                </div>
            </section>
        </main>
    );
}
