"use client";

import { Lock, Phone, RefreshCw, AtSign, X, XCircle } from "lucide-react";
import { useState } from "react";

const SUPPORT_PHONE = "+2348012345678"; // TODO: replace with real support number
const SUPPORT_PHONE_DISPLAY = "+234 801 234 5678";

export default function ApprovalPendingModal({
    brandName,
    status,
    dismissible = true,
    onRefresh,
    onClose,
}: {
    brandName: string;
    status: "pending" | "rejected";
    dismissible?: boolean;
    onRefresh: () => Promise<void>;
    onClose?: () => void;
}) {
    const [checking, setChecking] = useState(false);

    const handleRefresh = async () => {
        setChecking(true);
        await onRefresh();
        setChecking(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:px-5">
            <div className="relative w-full max-w-sm rounded-t-3xl bg-white p-7 text-center shadow-2xl sm:rounded-3xl">
                {dismissible && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                    >
                        <X size={16} />
                    </button>
                )}

                {status === "rejected" ? (
                    <>
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                            <XCircle size={26} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            We couldn't verify your profile
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-gray-500">
                            Hi {brandName || "there"} — we weren't able to confirm your designer profile from
                            the details provided. This doesn't have to be final — reach out and we'll gladly
                            take another look.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                            <Lock size={26} className="text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Your account is under review
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-gray-500">
                            Hi {brandName || "there"} — we're quickly verifying your designer profile.
                            This usually takes under 24 hours. You'll get a WhatsApp message the moment
                            you're approved.
                        </p>

                        <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-left">
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                                <AtSign size={12} /> Why we do this
                            </p>
                            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                                We manually confirm every designer through their Instagram or TikTok
                                to keep FitHouseAfrica trustworthy for customers browsing your catalogue.
                            </p>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={checking}
                            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
                            {checking ? "Checking..." : "Check Approval Status"}
                        </button>

                        {dismissible && onClose && (
                            <button
                                onClick={onClose}
                                className="mt-2 text-xs font-medium text-gray-400 hover:text-gray-600"
                            >
                                Look around while I wait
                            </button>
                        )}
                    </>
                )}
                <a

                    href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
                >
                    <Phone size={15} />
                    Contact Support · {SUPPORT_PHONE_DISPLAY}
                </a>
            </div>
        </div>
    );
}