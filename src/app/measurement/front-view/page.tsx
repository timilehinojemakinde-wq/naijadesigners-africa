"use client";

import Link from "next/link";
import {
    Camera,
    ArrowLeft,
    ScanLine,
} from "lucide-react";

export default function FrontViewPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/measurement/instructions"
                        className="rounded-xl border border-white/20 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-lg font-bold">
                            Front View Scan
                        </h1>

                        <p className="text-sm text-gray-400">
                            Step 1 of 3
                        </p>
                    </div>
                </div>
            </header>

            <section className="relative flex min-h-[calc(100vh-81px)] flex-col px-5 pb-8 pt-5">
                {/* INSTRUCTION */}
                <div className="rounded-[28px] bg-white/10 p-4 backdrop-blur-md">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-emerald-600/20 p-3 text-emerald-500">
                            <ScanLine size={22} />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Stand Facing The Camera
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-gray-300">
                                Make sure your head and feet
                                are fully visible inside the
                                frame.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CAMERA AREA */}
                <div className="relative mt-6 flex flex-1 items-center justify-center rounded-[36px] bg-[#111]">
                    {/* Camera Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-black" />

                    {/* BODY FRAME */}
                    <div className="relative z-10 h-[430px] w-[220px] rounded-[36px] border-2 border-emerald-500">
                        {/* CORNERS */}
                        <div className="absolute left-0 top-0 h-10 w-10 border-l-4 border-t-4 border-emerald-500 rounded-tl-[28px]" />
                        <div className="absolute right-0 top-0 h-10 w-10 border-r-4 border-t-4 border-emerald-500 rounded-tr-[28px]" />
                        <div className="absolute bottom-0 left-0 h-10 w-10 border-l-4 border-b-4 border-emerald-500 rounded-bl-[28px]" />
                        <div className="absolute bottom-0 right-0 h-10 w-10 border-r-4 border-b-4 border-emerald-500 rounded-br-[28px]" />

                        {/* BODY PLACEHOLDER */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                            <div className="flex flex-col items-center">
                                <div className="h-12 w-12 rounded-full bg-gray-400" />
                                <div className="mt-2 h-48 w-24 rounded-[40px] bg-gray-500" />
                                <div className="mt-2 flex gap-5">
                                    <div className="h-24 w-5 rounded-full bg-gray-500" />
                                    <div className="h-24 w-5 rounded-full bg-gray-500" />
                                </div>
                            </div>
                        </div>

                        {/* GUIDE TEXT */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-gray-300">
                            Full body inside frame
                        </div>
                    </div>
                </div>

                {/* TIPS */}
                <div className="mt-5 rounded-[28px] bg-white/10 p-5">
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li>✓ Stand straight naturally</li>
                        <li>✓ Arms relaxed by your side</li>
                        <li>✓ Good lighting</li>
                        <li>✓ Avoid oversized clothing</li>
                    </ul>
                </div>

                {/* CAMERA BUTTON */}
                <div className="mt-6">
                    <button className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 text-lg font-semibold transition hover:bg-emerald-700">
                        <Camera size={22} />
                        Capture Front View
                    </button>

                    <p className="mt-3 text-center text-sm text-gray-500">
                        Photos are processed securely
                        and never stored.
                    </p>
                </div>

                {/* NEXT */}
                <Link
                    href="/measurement/side-view"
                    className="mt-5 flex h-14 items-center justify-center rounded-xl border border-white/20 text-white"
                >
                    Continue
                </Link>
            </section>
        </main>
    );
}
