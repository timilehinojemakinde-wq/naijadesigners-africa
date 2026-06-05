"use client";

import Link from "next/link";
import {
    CheckCircle2,
    Bell,
    PackageCheck,
    ArrowRight,
} from "lucide-react";

export default function MeasurementSuccessPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] overflow-hidden">
            <section className="relative flex min-h-screen flex-col px-5 py-8">
                {/* BACKGROUND GLOW */}
                <div className="absolute left-1/2 top-28 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-green-500/10 blur-[90px]" />

                {/* CONTENT */}
                <div className="relative z-10 flex flex-1 flex-col">
                    {/* SUCCESS ICON */}
                    <div className="mx-auto mt-10 flex h-28 w-28 items-center justify-center rounded-full bg-green-100">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-white">
                            <CheckCircle2 size={42} />
                        </div>
                    </div>

                    {/* TITLE */}
                    <div className="mt-8 text-center">
                        <div className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                            Measurements Submitted
                        </div>

                        <h1 className="mt-6 text-[42px] font-bold leading-[1]">
                            You're
                            <span className="text-green-600">
                                {" "}All Set
                            </span>
                        </h1>

                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Your measurements have been
                            securely sent to your designer.
                            They’ve been notified and can
                            now begin processing your order.
                        </p>
                    </div>

                    {/* STATUS CARDS */}
                    <div className="mt-10 space-y-4">
                        <StatusCard
                            icon={<CheckCircle2 size={22} />}
                            title="Measurements Sent"
                            subtitle="AI body measurements submitted successfully"
                        />

                        <StatusCard
                            icon={<Bell size={22} />}
                            title="Designer Notified"
                            subtitle="Your designer has received your details"
                        />

                        <StatusCard
                            icon={<PackageCheck size={22} />}
                            title="Track Order Status"
                            subtitle="Follow updates from measurement to delivery"
                        />
                    </div>

                    {/* ORDER FLOW */}
                    <div className="mt-8 rounded-[30px] bg-white p-5 shadow-sm">
                        <h3 className="font-semibold">
                            What happens next?
                        </h3>

                        <div className="mt-4 space-y-3 text-sm text-gray-600">
                            <div>✓ Measurements received</div>
                            <div>✓ Designer reviews order</div>
                            <div>✓ Production begins</div>
                            <div>✓ Shipping updates</div>
                            <div>✓ Delivery tracking</div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-auto pt-8 space-y-3">
                        <Link
                            href="/track-order/create-account"
                            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-red-600 text-base font-semibold text-white transition hover:bg-red-700"
                        >
                            Create Account & Track Order
                            <ArrowRight size={18} />
                        </Link>

                        <Link
                            href="/track-order"
                            className="flex h-14 items-center justify-center rounded-xl border border-gray-300 bg-white text-base font-medium text-gray-800"
                        >
                            Track My Order
                        </Link>

                        <p className="text-center text-sm text-gray-500">
                            You’ll receive updates as your
                            order progresses.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

function StatusCard({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex items-start gap-4 rounded-[28px] bg-white p-5 shadow-sm">
            <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                {icon}
            </div>

            <div>
                <h3 className="font-semibold">
                    {title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}
