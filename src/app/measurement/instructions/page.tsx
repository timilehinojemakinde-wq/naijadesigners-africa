"use client";

import Link from "next/link";
import {
    Camera,
    Shield,
    Ruler,
    ArrowRight,
    ScanLine,
} from "lucide-react";

export default function MeasurementInstructionsPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            <section className="px-5 py-8">
                {/* TOP */}
                <div>
                    <div className="inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                        AI Measurement Guide
                    </div>

                    <h1 className="mt-6 text-[42px] font-bold leading-[1]">
                        Before You
                        <span className="text-red-600">
                            {" "}Start
                        </span>
                    </h1>

                    <p className="mt-4 text-lg text-gray-600">
                        Follow these quick steps to get
                        the most accurate body
                        measurements.
                    </p>
                </div>

                {/* CAMERA FRAME MOCKUP */}
                <div className="mt-8 rounded-[36px] bg-black p-5 text-white">
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-300">
                        <ScanLine size={16} />
                        Guided Camera Frame
                    </div>

                    <div className="relative flex h-[380px] items-center justify-center rounded-[28px] border border-gray-700 bg-[#111]">
                        {/* SCAN FRAME */}
                        <div className="relative h-[300px] w-[180px] rounded-[28px] border-2 border-red-500">
                            {/* Corner markers */}
                            <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-[20px] border-l-4 border-t-4 border-red-500" />
                            <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-[20px] border-r-4 border-t-4 border-red-500" />
                            <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-[20px] border-b-4 border-l-4 border-red-500" />
                            <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-[20px] border-b-4 border-r-4 border-red-500" />

                            {/* BODY SILHOUETTE */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-400" />
                                    <div className="mt-2 h-40 w-20 rounded-[30px] bg-gray-500" />
                                    <div className="mt-2 flex gap-4">
                                        <div className="h-20 w-4 rounded-full bg-gray-500" />
                                        <div className="h-20 w-4 rounded-full bg-gray-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GUIDE TEXT */}
                        <div className="absolute bottom-4 text-center text-sm text-gray-400">
                            Make sure your full body fits
                            inside the frame
                        </div>
                    </div>
                </div>

                {/* RULES */}
                <div className="mt-8 space-y-4">
                    <GuideCard
                        icon={<Camera size={20} />}
                        title="Wear Fitted Clothing"
                        subtitle="Avoid oversized outfits, jackets, hoodies, agbada or flowing gowns."
                    />

                    <GuideCard
                        icon={<ScanLine size={20} />}
                        title="Stand Inside The Frame"
                        subtitle="Your head and feet must fit fully inside the guided frame."
                    />

                    <GuideCard
                        icon={<Ruler size={20} />}
                        title="Know Your Height"
                        subtitle="Your height helps AI generate more accurate measurements."
                    />

                    <GuideCard
                        icon={<Shield size={20} />}
                        title="Your Photos Are Not Stored"
                        subtitle="Images are processed only for measurements and are never stored on FitHouse servers."
                    />
                </div>

                {/* EXTRA TIPS */}
                <div className="mt-8 rounded-[28px] bg-red-50 p-5">
                    <h3 className="font-semibold text-red-700">
                        For Best Accuracy
                    </h3>

                    <ul className="mt-3 space-y-2 text-sm text-gray-700">
                        <li>✓ Stand 2–3 meters away</li>
                        <li>✓ Use good lighting</li>
                        <li>✓ Keep full body visible</li>
                        <li>✓ Remove bulky clothing</li>
                        <li>✓ Stand straight naturally</li>
                    </ul>
                </div>

                {/* CTA */}
                <div className="mt-10">
                    <Link
                        href="/measurement/front-view"
                        className="flex h-14 items-center justify-center gap-2 rounded-xl bg-red-600 text-base font-medium text-white"
                    >
                        Start Front Scan
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </main>
    );
}

function GuideCard({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex items-start gap-4 rounded-[24px] bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
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
