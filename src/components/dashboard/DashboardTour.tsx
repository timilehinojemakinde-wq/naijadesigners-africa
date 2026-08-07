"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

type Step = {
    ref: React.RefObject<HTMLElement | null>;
    title: string;
    desc: string;
};

export default function DashboardTour({
    steps,
    onComplete,
}: {
    steps: Step[];
    onComplete: () => void;
}) {
    const [index, setIndex] = useState(0);
    const [rect, setRect] = useState<DOMRect | null>(null);

    const updateRect = () => {
        const el = steps[index]?.ref.current;
        if (el) setRect(el.getBoundingClientRect());
    };

    useEffect(() => {
        updateRect();
        window.addEventListener("resize", updateRect);
        window.addEventListener("scroll", updateRect, true);
        return () => {
            window.removeEventListener("resize", updateRect);
            window.removeEventListener("scroll", updateRect, true);
        };
    }, [index]);

    if (!rect) return null;

    const step = steps[index];
    const padding = 8;
    const spotlightTop = rect.top - padding;
    const spotlightLeft = rect.left - padding;
    const spotlightWidth = rect.width + padding * 2;
    const spotlightHeight = rect.height + padding * 2;

    const tooltipTop = spotlightTop + spotlightHeight + 12;
    const flipUp = tooltipTop + 140 > window.innerHeight;

    return (
        <div className="fixed inset-0 z-[200]">
            {/* SPOTLIGHT CUTOUT */}
            <div
                className="absolute rounded-2xl transition-all duration-300"
                style={{
                    top: spotlightTop,
                    left: spotlightLeft,
                    width: spotlightWidth,
                    height: spotlightHeight,
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.75)",
                }}
            />

            {/* TOOLTIP */}
            <div
                className="absolute w-64 rounded-2xl bg-white p-4 shadow-2xl transition-all duration-300"
                style={{
                    left: Math.min(Math.max(spotlightLeft, 16), window.innerWidth - 272),
                    top: flipUp ? spotlightTop - 12 - 140 : tooltipTop,
                }}
            >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
                    Step {index + 1} of {steps.length}
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{step.desc}</p>

                <div className="mt-3 flex items-center justify-between">
                    <button
                        onClick={onComplete}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600"
                    >
                        Skip tour
                    </button>
                    <button
                        onClick={() => {
                            if (index < steps.length - 1) {
                                setIndex(index + 1);
                            } else {
                                onComplete();
                            }
                        }}
                        className="flex items-center gap-1 rounded-full bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white"
                    >
                        {index < steps.length - 1 ? "Next" : "Done"}
                        <ArrowRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}