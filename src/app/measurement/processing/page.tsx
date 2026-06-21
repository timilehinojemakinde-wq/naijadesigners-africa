"use client";

import Link from "next/link";
import {
    ScanLine,
    Shield,
    Sparkles,
} from "lucide-react";

export default function ProcessingPage() {
    return (
        <main className="min-h-screen bg-black text-white overflow-hidden">
            <section className="relative flex min-h-screen flex-col items-center justify-center px-5">
                {/* BACKGROUND GLOW */}
                <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/20 blur-[120px]" />

                {/* CONTENT */}
                <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
                    {/* AI SCANNER */}
                    <div className="relative flex h-[220px] w-[220px] items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                        {/* OUTER PULSE */}
                        <div className="absolute h-[220px] w-[220px] animate-ping rounded-full border border-emerald-500/20" />

                        <div className="absolute h-[180px] w-[180px] rounded-full border border-emerald-500/30" />

                        {/* BODY + SCAN */}
                        <div className="relative flex flex-col items-center">
                            {/* HEAD */}
                            <div className="h-10 w-10 rounded-full bg-gray-400" />

                            {/* BODY */}
                            <div className="mt-2 h-24 w-14 rounded-[30px] bg-gray-500" />

                            {/* LEGS */}
                            <div className="mt-2 flex gap-3">
                                <div className="h-14 w-3 rounded-full bg-gray-500" />
                                <div className="h-14 w-3 rounded-full bg-gray-500" />
                            </div>

                            {/* SCAN LINE */}
                            <div className="absolute left-1/2 top-8 h-[140px] w-[90px] -translate-x-1/2 overflow-hidden">
                                <div className="animate-bounce">
                                    <div className="h-[2px] w-full bg-emerald-500 shadow-[0_0_20px_rgba(239,68,68,0.9)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TITLE */}
                    <h1 className="mt-10 text-[38px] font-bold leading-tight">
                        Generating Your
                        <span className="text-emerald-500">
                            {" "}Measurements
                        </span>
                    </h1>

                    <p className="mt-4 max-w-sm text-lg leading-8 text-gray-400">
                        Our AI is analyzing your
                        front view, side view and
                        height for accurate body
                        measurements.
                    </p>

                    {/* STEPS */}
                    <div className="mt-10 w-full space-y-4">
                        <ProcessingItem
                            title="Processing front view"
                            status="done"
                        />

                        <ProcessingItem
                            title="Analyzing side view"
                            status="done"
                        />

                        <ProcessingItem
                            title="Combining height data"
                            status="active"
                        />

                        <ProcessingItem
                            title="Generating measurements"
                            status="pending"
                        />
                    </div>

                    {/* TRUST */}
                    <div className="mt-8 rounded-[28px] bg-white/10 p-5 backdrop-blur-md">
                        <div className="flex items-start gap-3 text-left">
                            <div className="rounded-xl bg-emerald-500/20 p-3 text-emerald-400">
                                <Shield size={20} />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Privacy Protected
                                </h3>

                                <p className="mt-1 text-sm leading-6 text-gray-400">
                                    Your photos are processed
                                    securely and are never stored
                                    on FitHouse servers.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CONTINUE */}
                    <Link
                        href="/measurement/customer-details"
                        className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-600 text-base font-semibold text-white transition hover:bg-emerald-700"
                    >
                        Continue
                    </Link>

                    <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles size={16} />
                        Usually takes less than 30 seconds
                    </p>
                </div>
            </section>
        </main>
    );
}

function ProcessingItem({
    title,
    status,
}: {
    title: string;
    status: "done" | "active" | "pending";
}) {
    return (
        <div className="flex items-center justify-between rounded-[22px] bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${status === "done"
                        ? "bg-green-500/20 text-green-400"
                        : status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-gray-500"
                        }`}
                >
                    <ScanLine size={18} />
                </div>

                <p className="font-medium">
                    {title}
                </p>
            </div>

            <div>
                {status === "done" && (
                    <span className="text-sm text-green-400">
                        ✓ Done
                    </span>
                )}

                {status === "active" && (
                    <span className="text-sm text-emerald-400">
                        Processing...
                    </span>
                )}

                {status === "pending" && (
                    <span className="text-sm text-gray-500">
                        Waiting
                    </span>
                )}
            </div>
        </div>
    );
}
