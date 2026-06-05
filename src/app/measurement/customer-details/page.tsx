"use client";

import Link from "next/link";
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
} from "lucide-react";

export default function CustomerDetailsPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/measurement/processing"
                        className="rounded-xl border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-lg font-bold">
                            Customer Details
                        </h1>

                        <p className="text-sm text-gray-500">
                            Final Step
                        </p>
                    </div>
                </div>
            </header>

            <section className="px-5 py-8">
                {/* TITLE */}
                <div>
                    <div className="inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                        Measurements Ready
                    </div>

                    <h1 className="mt-6 text-[40px] font-bold leading-[1]">
                        Almost
                        <span className="text-red-600">
                            {" "}Done
                        </span>
                    </h1>

                    <p className="mt-4 text-lg text-gray-600">
                        Add your details so your
                        designer can contact you
                        and process your order.
                    </p>
                </div>

                {/* SUCCESS CARD */}
                <div className="mt-8 rounded-[30px] bg-red-50 p-5">
                    <h3 className="font-semibold text-red-700">
                        ✓ Measurements Generated
                    </h3>

                    <p className="mt-2 text-sm text-gray-700">
                        Your AI measurements are
                        ready and will be securely
                        sent to your designer after
                        submission.
                    </p>
                </div>

                {/* FORM */}
                <div className="mt-8 space-y-5">
                    {/* FULL NAME */}
                    <InputField
                        icon={<User size={20} />}
                        label="Full Name"
                        placeholder="Enter your full name"
                    />

                    {/* PHONE */}
                    <InputField
                        icon={<Phone size={20} />}
                        label="Phone Number"
                        placeholder="+234..."
                    />

                    {/* EMAIL */}
                    <InputField
                        icon={<Mail size={20} />}
                        label="Email (Optional)"
                        placeholder="example@email.com"
                    />

                    {/* COUNTRY */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Country
                        </label>

                        <select className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500">
                            <option>Select country</option>
                            <option>Nigeria</option>
                            <option>Ghana</option>
                            <option>South Africa</option>
                            <option>United Kingdom</option>
                            <option>United States</option>
                        </select>
                    </div>

                    {/* STATE/CITY */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-2 block font-medium">
                                State
                            </label>

                            <input
                                type="text"
                                placeholder="Lagos"
                                className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">
                                City
                            </label>

                            <input
                                type="text"
                                placeholder="Lekki"
                                className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 outline-none focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* ADDRESS */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Delivery Address
                        </label>

                        <div className="relative">
                            <MapPin
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <textarea
                                rows={4}
                                placeholder="Enter delivery address"
                                className="w-full rounded-2xl border border-gray-200 bg-white p-4 pl-12 outline-none focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* SPECIAL NOTES */}
                    <div>
                        <label className="mb-2 block font-medium">
                            Notes For Designer
                            <span className="text-gray-400">
                                {" "} (Optional)
                            </span>
                        </label>

                        <div className="relative">
                            <FileText
                                size={18}
                                className="absolute left-4 top-5 text-gray-400"
                            />

                            <textarea
                                rows={4}
                                placeholder="Any special fitting request?"
                                className="w-full rounded-2xl border border-gray-200 bg-white p-4 pl-12 outline-none focus:border-red-500"
                            />
                        </div>
                    </div>
                </div>

                {/* PRIVACY */}
                <div className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold">
                        Privacy Notice
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        Your measurements are securely
                        shared only with your designer.
                        FitHouse does not store your
                        body photos.
                    </p>
                </div>

                {/* CTA */}
                <div className="mt-10">
                    <Link
                        href="/measurement/success"
                        className="flex h-14 items-center justify-center rounded-xl bg-red-600 text-base font-semibold text-white transition hover:bg-red-700"
                    >
                        Submit Measurements
                    </Link>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        Your designer will be notified instantly.
                    </p>
                </div>
            </section>
        </main>
    );
}

function InputField({
    icon,
    label,
    placeholder,
}: {
    icon: React.ReactNode;
    label: string;
    placeholder: string;
}) {
    return (
        <div>
            <label className="mb-2 block font-medium">
                {label}
            </label>

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
        </div>
    );
}
