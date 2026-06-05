"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

export default function ProductDetailsPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/designer-dashboard/add-product/upload-photos"
                        className="rounded-xl border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-xl font-bold">
                            Add Product
                        </h1>

                        <p className="text-sm text-gray-500">
                            Step 2 of 4 — Product Details
                        </p>
                    </div>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* Progress */}
                <div className="mb-8 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-2/4 rounded-full bg-red-600" />
                </div>

                {/* Title */}
                <div>
                    <h2 className="text-3xl font-bold leading-tight">
                        Product
                        <span className="text-red-600">
                            {" "}Details
                        </span>
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Add details customers need
                        before ordering.
                    </p>
                </div>

                {/* FORM */}
                <div className="mt-8 space-y-5">
                    {/* Product Name */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Product Name
                        </label>

                        <input
                            type="text"
                            placeholder="Luxury Wedding Dress"
                            className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Description
                        </label>

                        <textarea
                            rows={5}
                            placeholder="Describe your product..."
                            className="w-full rounded-2xl border border-gray-200 bg-white p-4 outline-none focus:border-red-500"
                        />
                    </div>

                    {/* CATEGORY (REQUIRED) */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Category
                            <span className="text-red-600">
                                {" "}*
                            </span>
                        </label>

                        <div className="relative">
                            <select
                                className="h-14 w-full appearance-none rounded-2xl border border-red-300 bg-red-50 px-4 outline-none focus:border-red-500"
                                required
                            >
                                <option>
                                    Select category
                                </option>

                                <option>Wedding</option>
                                <option>Aso Ebi</option>
                                <option>Native Wear</option>
                                <option>Luxury</option>
                                <option>Corporate</option>
                                <option>Casual</option>
                                <option>Menswear</option>
                                <option>Bridal</option>
                                <option>Kids</option>
                                <option>Ready-to-Wear</option>
                            </select>

                            <ChevronDown
                                size={18}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                        </div>

                        <p className="mt-2 text-sm text-red-600">
                            Required for marketplace visibility
                        </p>
                    </div>

                    {/* Subcategory */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Subcategory
                        </label>

                        <input
                            type="text"
                            placeholder="Luxury Bridal"
                            className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500"
                        />
                    </div>

                    {/* Fabric */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Fabric Type
                        </label>

                        <input
                            type="text"
                            placeholder="Lace, Silk, Cotton..."
                            className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Gender
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                "Women",
                                "Men",
                                "Unisex",
                            ].map((item) => (
                                <button
                                    key={item}
                                    className="rounded-xl border border-gray-200 bg-white py-4 font-medium transition hover:border-red-400"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Style Tags */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Style Tags
                        </label>

                        <input
                            type="text"
                            placeholder="Luxury, Elegant, Bridal..."
                            className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500"
                        />
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-10 flex gap-3">
                    <Link
                        href="/designer-dashboard/add-product/upload-photos"
                        className="flex h-14 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white font-medium"
                    >
                        Back
                    </Link>

                    <Link
                        href="/designer-dashboard/add-product/pricing"
                        className="flex h-14 flex-1 items-center justify-center rounded-xl bg-red-600 font-medium text-white"
                    >
                        Continue
                    </Link>
                </div>
            </section>
        </main>
    );
}
