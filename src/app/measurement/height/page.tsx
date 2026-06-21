"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Ruler,
    Info,
} from "lucide-react";

export default function HeightPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/measurement/side-view"
                        className="rounded-xl border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-lg font-bold">
                            Height Information
                        </h1>

                        <p className="text-sm text-gray-500">
                            Step 3 of 3
                        </p>
                    </div>
                </div>
            </header>

            <section className="flex min-h-[calc(100vh-81px)] flex-col px-5 py-8">
                {/* TOP */}
                <div>
                    <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600">
                        Final Step
                    </div>

                    <h1 className="mt-6 text-[42px] font-bold leading-[1]">
                        What Is Your
                        <span className="text-emerald-600">
                            {" "}Height?
                        </span>
                    </h1>

                    <p className="mt-4 text-lg text-gray-600">
                        Your height is very important.
                        It helps our AI generate more
                        accurate body measurements.
                    </p>
                </div>

                {/* HEIGHT CARD */}
                <div className="mt-8 rounded-[36px] bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600">
                            <Ruler size={26} />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Enter Your Height
                            </h2>

                            <p className="text-sm text-gray-500">
                                In centimeters or feet
                            </p>
                        </div>
                    </div>

                    {/* UNIT TOGGLE */}
                    <div className="mb-5 grid grid-cols-2 gap-3">
                        <button className="rounded-2xl bg-emerald-600 py-4 font-medium text-white">
                            CM
                        </button>

                        <button className="rounded-2xl border border-gray-200 bg-white py-4 font-medium">
                            FT
                        </button>
                    </div>

                    {/* HEIGHT INPUT */}
                    <input
                        type="number"
                        placeholder="e.g. 170"
                        className="h-16 w-full rounded-[24px] border border-gray-200 bg-[#fafafa] px-5 text-xl outline-none focus:border-emerald-500"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                        Example: 170 cm
                    </p>
                </div>

                {/* INFO CARD */}
                <div className="mt-8 rounded-[30px] bg-emerald-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 text-emerald-600">
                            <Info size={20} />
                        </div>

                        <div>
                            <h3 className="font-semibold text-emerald-700">
                                Why height matters
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-700">
                                Our AI combines your
                                front photo, side photo,
                                and height to generate
                                more accurate fashion
                                measurements.
                            </p>
                        </div>
                    </div>
                </div>

                {/* SUMMARY */}
                <div className="mt-8 rounded-[30px] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold">
                        Measurement Summary
                    </h3>

                    <div className="mt-4 space-y-3 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <span>Front View</span>
                            <span className="text-green-600">
                                ✓ Captured
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span>Side View</span>
                            <span className="text-green-600">
                                ✓ Captured
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span>Height</span>
                            <span className="text-orange-500">
                                Pending
                            </span>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-auto pt-8">
                    <Link
                        href="/measurement/processing"
                        className="flex h-14 items-center justify-center rounded-xl bg-emerald-600 text-base font-medium text-white"
                    >
                        Generate Measurements
                    </Link>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        Photos are processed securely
                        and never stored.
                    </p>
                </div>
            </section>
        </main>
    );
}
