"use client";

import Link from "next/link";
import {
    Search,
    Package,
    Phone,
    Hash,
    ArrowRight,
} from "lucide-react";

export default function TrackOrderPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            <section className="px-5 py-8">
                {/* HERO */}
                <div>
                    <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600">
                        Order Tracking
                    </div>

                    <h1 className="mt-6 text-[40px] font-bold leading-[1]">
                        Track Your
                        <span className="text-emerald-600">
                            {" "}Order
                        </span>
                    </h1>

                    <p className="mt-4 text-lg text-gray-600">
                        Enter your order details to
                        see the latest status of
                        your fashion order.
                    </p>
                </div>

                {/* HERO CARD */}
                <div className="mt-8 rounded-[34px] bg-gradient-to-br from-red-600 to-red-700 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white/20 p-3">
                            <Package size={24} />
                        </div>

                        <div>
                            <h3 className="font-semibold">
                                Real-Time Tracking
                            </h3>

                            <p className="text-sm text-emerald-100">
                                Follow updates from
                                measurement to delivery.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <div className="mt-8 rounded-[32px] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold">
                        Enter Order Details
                    </h3>

                    <div className="mt-5 space-y-5">
                        {/* ORDER ID */}
                        <InputField
                            icon={<Hash size={20} />}
                            placeholder="Order ID (e.g. FH-2034)"
                        />

                        {/* PHONE */}
                        <InputField
                            icon={<Phone size={20} />}
                            placeholder="Phone Number"
                        />
                    </div>

                    {/* SEARCH BUTTON */}
                    <button className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-base font-semibold text-white transition hover:bg-emerald-700">
                        <Search size={18} />
                        Track Order
                    </button>
                </div>

                {/* ORDER PROCESS */}
                <div className="mt-8 rounded-[30px] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold">
                        Order Process
                    </h3>

                    <div className="mt-4 space-y-3 text-sm text-gray-600">
                        <div>✓ Measurements Received</div>
                        <div>✓ Designer Review</div>
                        <div>✓ Fabric Sourcing</div>
                        <div>✓ In Production</div>
                        <div>✓ Shipping Updates</div>
                        <div>✓ Delivered</div>
                    </div>
                </div>

                {/* ACCOUNT CTA */}
                <div className="mt-8 rounded-[30px] bg-emerald-50 p-5">
                    <h3 className="font-semibold text-emerald-700">
                        Want Faster Updates?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-700">
                        Create a FitHouse account
                        to receive live notifications
                        and track all your orders.
                    </p>

                    <Link
                        href="/track-order/create-account"
                        className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-medium text-white"
                    >
                        Create Account
                        <ArrowRight size={16} />
                    </Link>
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
                className="h-14 w-full rounded-2xl border border-gray-200 bg-[#fafafa] pl-12 pr-4 outline-none focus:border-emerald-500"
            />
        </div>
    );
}
