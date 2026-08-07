"use client";

import { Sparkles, Phone, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";

const SUPPORT_PHONE = "+2347066633446";
const SUPPORT_PHONE_DISPLAY = "+234 706 663 3446";
const SUPPORT_NAME = "Getrude";

export default function ApprovalPendingModal({
    brandName,
    status,
    dismissible = false,
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
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-white/30 px-5 pb-8 sm:items-center sm:pb-0">
            <div className="w-full max-w-sm rounded-3xl bg-white/95 p-6 text-center shadow-2xl backdrop-blur-xl">
                {status === "rejected" ? (
                    <>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                            <XCircle size={22} className="text-red-500" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            We couldn't verify your profile
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                            Reach out and we'll take another look — happy to help you get set up.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                            <Sparkles size={22} className="text-emerald-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Almost there, {brandName || "welcome"} 🎉
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                            We're confirming your profile — usually done in under 24 hours.
                            Your dashboard is ready and waiting.
                        </p>

                        <button
                            onClick={handleRefresh}
                            disabled={checking}
                            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
                            {checking ? "Checking..." : "Check Status"}
                        </button>

                        {dismissible && onClose && (
                            <button
                                onClick={onClose}
                                className="mt-2.5 text-xs font-medium text-gray-400 hover:text-gray-600"
                            >
                                Take a look around while I wait
                            </button>
                        )}
                    </>
                )}

                <a
                    href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                    <Phone size={12} />
                    Need help? Call {SUPPORT_NAME} · {SUPPORT_PHONE_DISPLAY}
                </a>
            </div>
        </div>
    );
}