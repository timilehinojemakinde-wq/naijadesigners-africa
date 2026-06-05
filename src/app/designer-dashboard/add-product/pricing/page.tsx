"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/designer-dashboard/add-product/product-details"
                        className="rounded-xl border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-xl font-bold">
                            Add Product
                        </h1>

                        <p className="text-sm text-gray-500">
                            Step 3 of 4 — Pricing & Delivery
                        </p>
                    </div>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* Progress */}
                <div className="mb-8 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-3/4 rounded-full bg-red-600" />
                </div>

                {/* Title */}
                <div>
                    <h2 className="text-3xl font-bold leading-tight">
                        Pricing &
                        <span className="text-red-600">
                            {" "}Delivery
                        </span>
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Set pricing, timeline and delivery preferences.
                    </p>
                </div>

                {/* FORM */}
                <div className="mt-8 space-y-5">
                    {/* PRICE */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Product Price
                        </label>

                        <input
                            type="number"
                            placeholder="₦150,000"
                            className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500"
                        />
                    </div>

                    {/* TIMELINE */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Production Timeline
                        </label>

                        <select className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500">
                            <option>Choose timeline</option>
                            <option>3 - 5 Days</option>
                            <option>1 Week</option>
                            <option>2 Weeks</option>
                            <option>3 Weeks</option>
                            <option>1 Month</option>
                        </select>
                    </div>

                    {/* RUSH ORDER */}
                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">
                                    Rush Order Available
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Allow faster production for extra fee
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                className="h-6 w-6 accent-red-600"
                            />
                        </div>
                    </div>

                    {/* AI MEASUREMENT */}
                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">
                                    AI Measurement Required
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Customer must complete body scan
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                className="h-6 w-6 accent-red-600"
                            />
                        </div>
                    </div>

                    {/* INTERNATIONAL SHIPPING */}
                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">
                                    Ships Internationally
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Deliver outside your country
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                className="h-6 w-6 accent-red-600"
                            />
                        </div>
                    </div>

                    {/* DELIVERY FEE */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Delivery Fee
                        </label>

                        <input
                            type="number"
                            placeholder="₦10,000"
                            className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500"
                        />
                    </div>
                </div>

                {/* INFO CARD */}
                <div className="mt-8 rounded-[28px] bg-red-50 p-5">
                    <h3 className="font-semibold text-red-700">
                        FitHouse Tip
                    </h3>

                    <p className="mt-2 text-sm text-gray-700">
                        Products with AI measurement enabled usually
                        have fewer fitting issues and better reviews.
                    </p>
                </div>

                {/* CTA */}
                <div className="mt-10 flex gap-3">
                    <Link
                        href="/designer-dashboard/add-product/product-details"
                        className="flex h-14 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white font-medium"
                    >
                        Back
                    </Link>

                    <Link
                        href="/designer-dashboard/add-product/publish"
                        className="flex h-14 flex-1 items-center justify-center rounded-xl bg-red-600 font-medium text-white"
                    >
                        Continue
                    </Link>
                </div>
            </section>
        </main>
    );
}
