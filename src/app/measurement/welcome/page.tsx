"use client";

import Link from "next/link";
import {
    Shield,
    Sparkles,
    Camera,
} from "lucide-react";

export default function MeasurementWelcomePage() {
    return (
        <main className="min-h-screen bg-[#fafafa]">
            <section className="flex min-h-screen flex-col px-5 py-8">
                {/* TOP */}
                <div>
                    <div className="inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                        FitHouse AI Measurement
                    </div>

                    <h1 className="mt-6 text-[42px] font-bold leading-[1]">
                        Get Your
                        <span className="text-red-600">
                            {" "}Perfect Fit
                        </span>
                    </h1>

                    <p className="mt-4 text-lg text-gray-600">
                        Complete a quick AI body scan
                        to generate accurate fashion
                        measurements for your designer.
                    </p>
                </div>

                {/* HERO CARD */}
                <div className="mt-8 overflow-hidden rounded-[36px] bg-white shadow-sm">
                    <div className="h-[280px] bg-gray-100" />

                    <div className="p-6">
                        <h2 className="text-xl font-semibold">
                            Secure & Accurate
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Takes less than 2 minutes.
                            No physical tape measurement
                            required.
                        </p>
                    </div>
                </div>

                {/* BENEFITS */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <BenefitCard
                        icon={<Camera size={22} />}
                        title="2 Photos"
                        subtitle="Front & side view"
                    />

                    <BenefitCard
                        icon={<Sparkles size={22} />}
                        title="AI Powered"
                        subtitle="Smart measurements"
                    />

                    <BenefitCard
                        icon={<Shield size={22} />}
                        title="Private"
                        subtitle="Securely processed"
                    />

                    <BenefitCard
                        icon={<Sparkles size={22} />}
                        title="Know Your Height"
                        subtitle="Needed for Ai better accuracy"
                    />
                </div>

                {/* FOOTER CTA */}
                <div className="mt-auto pt-8">
                    <div className="mb-4 rounded-[28px] bg-red-50 p-5">
                        <div>
                            <p className="text-sm font-semibold text-red-700">
                                Before You Start
                            </p>

                            <p className="mt-2 text-sm text-gray-700">
                                Please know your height before
                                starting. Your height helps the
                                AI generate more accurate body
                                measurements.
                            </p>

                            <p className="mt-2 text-sm text-gray-700">
                                You will also take:
                            </p>

                            <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                <li>✓ Front view photo</li>
                                <li>✓ Side view photo</li>
                                <li>✓ Height input</li>
                            </ul>
                        </div>

                    </div>

                    <Link
                        href="/measurement/instructions"
                        className="flex h-14 items-center justify-center rounded-xl bg-red-600 text-base font-medium text-white"
                    >
                        Start Measurement
                    </Link>
                </div>
            </section>
        </main>
    );
}

function BenefitCard({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-xl bg-red-50 p-3 text-red-600">
                {icon}
            </div>

            <h3 className="font-semibold">
                {title}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
                {subtitle}
            </p>
        </div>
    );
}
